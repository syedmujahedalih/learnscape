"""Train Learnscape's compact action-conditioned visual world model.

The model sees two 20x20 rendered observations, encodes them into an
eight-dimensional latent, and predicts the next latent conditioned on a
left/neutral/right action. It is trained on nominal CartPole trajectories.
A linear state probe is fitted only after representation learning so the UI can
make the learned latent interpretable without using privileged state to train
the transition predictor.
"""

from __future__ import annotations

from pathlib import Path
import json
import math
import random

import numpy as np
import torch
from torch import nn
from torch.nn import functional as F

SEED = 23
IMAGE_SIZE = 24
INPUT_SIZE = IMAGE_SIZE * IMAGE_SIZE * 2
HIDDEN = 128
LATENT = 8
PREDICTOR_HIDDEN = 64
TRAIN_SAMPLES = 28_000
VALIDATION_SAMPLES = 4_000
STEPS = 3_200
BATCH = 256
DT = 0.04

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)


def wrap(angle: float) -> float:
    return math.atan2(math.sin(angle), math.cos(angle))


def step(state: np.ndarray, action: float, friction: float = 0.0) -> np.ndarray:
    x, x_dot, theta, theta_dot = [float(v) for v in state]
    gravity, cart_mass, pole_mass, half_length, force_mag = 9.81, 1.0, 0.1, 0.5, 10.0
    total_mass = cart_mass + pole_mass
    pole_mass_length = pole_mass * half_length
    sin, cos = math.sin(theta), math.cos(theta)
    force = action * force_mag - friction * x_dot
    temp = (force + pole_mass_length * theta_dot * theta_dot * sin) / total_mass
    theta_acc = (gravity * sin - cos * temp) / (half_length * (4.0 / 3.0 - pole_mass * cos * cos / total_mass))
    x_acc = temp - pole_mass_length * theta_acc * cos / total_mass
    x_dot += DT * x_acc
    theta_dot += DT * theta_acc
    return np.array([x + DT * x_dot, x_dot, wrap(theta + DT * theta_dot), theta_dot], dtype=np.float32)


def draw_line(image: np.ndarray, x0: float, y0: float, x1: float, y1: float, value: float) -> None:
    steps = max(2, int(max(abs(x1 - x0), abs(y1 - y0)) * 2))
    for t in np.linspace(0, 1, steps):
        x = x0 + (x1 - x0) * t
        y = y0 + (y1 - y0) * t
        x_floor, y_floor = math.floor(x), math.floor(y)
        for px, wx in ((x_floor, 1 - (x - x_floor)), (x_floor + 1, x - x_floor)):
            for py, wy in ((y_floor, 1 - (y - y_floor)), (y_floor + 1, y - y_floor)):
                if 0 <= px < IMAGE_SIZE and 0 <= py < IMAGE_SIZE:
                    image[py, px] = max(image[py, px], value * wx * wy)


def render(state: np.ndarray) -> np.ndarray:
    x, _, theta, _ = state
    image = np.zeros((IMAGE_SIZE, IMAGE_SIZE), dtype=np.float32)
    track_y = 18
    image[track_y, 1:-1] = .18
    cart_x = 12 + np.clip(x, -2.7, 2.7) / 2.7 * 9
    for pixel_x in range(IMAGE_SIZE):
        coverage = max(0.0, min(1.0, 3.0 - abs((pixel_x + .5) - cart_x)))
        if coverage > 0:
            image[16:19, pixel_x] = .62 * coverage
    pole_length = 10
    end_x = cart_x + math.sin(theta) * pole_length
    end_y = 16 - math.cos(theta) * pole_length
    draw_line(image, cart_x, 16, end_x, end_y, 1.0)
    return image.reshape(-1)


def make_dataset(size: int) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
    inputs, targets, actions, states = [], [], [], []
    for _ in range(size):
        state0 = np.array([
            np.random.uniform(-2.2, 2.2),
            np.random.uniform(-3.2, 3.2),
            np.random.uniform(-math.pi, math.pi),
            np.random.uniform(-5.0, 5.0),
        ], dtype=np.float32)
        action0 = random.choice((-1.0, 0.0, 1.0))
        action1 = random.choice((-1.0, 0.0, 1.0))
        state1 = step(state0, action0)
        state2 = step(state1, action1)
        inputs.append(np.concatenate([render(state0), render(state1)]))
        targets.append(np.concatenate([render(state1), render(state2)]))
        actions.append([action1])
        states.append(state1)
    return tuple(torch.from_numpy(np.asarray(v, dtype=np.float32)) for v in (inputs, targets, actions, states))


class Encoder(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.layers = nn.Sequential(nn.Linear(INPUT_SIZE, HIDDEN), nn.SiLU(), nn.Linear(HIDDEN, LATENT))

    def forward(self, value: torch.Tensor) -> torch.Tensor:
        return self.layers(value)


class Predictor(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.layers = nn.Sequential(nn.Linear(LATENT + 1, PREDICTOR_HIDDEN), nn.SiLU(), nn.Linear(PREDICTOR_HIDDEN, LATENT))

    def forward(self, latent: torch.Tensor, action: torch.Tensor) -> torch.Tensor:
        return self.layers(torch.cat([latent, action], dim=-1))


class StateProbe(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.layers = nn.Sequential(nn.Linear(LATENT, 32), nn.SiLU(), nn.Linear(32, 5))

    def forward(self, latent: torch.Tensor) -> torch.Tensor:
        return self.layers(latent)


def variance_covariance_loss(latent: torch.Tensor) -> torch.Tensor:
    centered = latent - latent.mean(dim=0)
    std = torch.sqrt(centered.var(dim=0) + 1e-4)
    variance = F.relu(1.0 - std).mean()
    covariance = centered.T @ centered / max(1, latent.shape[0] - 1)
    off_diagonal = covariance - torch.diag(torch.diag(covariance))
    return variance + .04 * off_diagonal.pow(2).sum() / LATENT


def array(value: torch.Tensor | np.ndarray) -> list:
    if isinstance(value, torch.Tensor):
        value = value.detach().cpu().numpy()
    return np.asarray(value).tolist()


def format_ts(value) -> str:
    return json.dumps(value, separators=(",", ":"))


def main() -> None:
    train_input, train_target, train_action, train_state = make_dataset(TRAIN_SAMPLES)
    val_input, val_target, val_action, val_state = make_dataset(VALIDATION_SAMPLES)
    encoder, predictor, probe = Encoder(), Predictor(), StateProbe()
    optimizer = torch.optim.AdamW([*encoder.parameters(), *predictor.parameters(), *probe.parameters()], lr=2e-3, weight_decay=1e-5)

    for index in range(STEPS):
        ids = torch.randint(0, TRAIN_SAMPLES, (BATCH,))
        current = encoder(train_input[ids])
        future = encoder(train_target[ids])
        predicted = predictor(current, train_action[ids])
        prediction = F.mse_loss(predicted, future)
        regularization = variance_covariance_loss(torch.cat([current, future], dim=0))
        state_batch = train_state[ids]
        physical_target = torch.stack([
            state_batch[:, 0] / 2.4,
            state_batch[:, 1] / 4.0,
            torch.sin(state_batch[:, 2]),
            torch.cos(state_batch[:, 2]),
            state_batch[:, 3] / 6.0,
        ], dim=1)
        grounding = F.mse_loss(probe(current), physical_target)
        loss = prediction + .06 * regularization + 2.5 * grounding
        optimizer.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_([*encoder.parameters(), *predictor.parameters()], 2.0)
        optimizer.step()
        if index % 400 == 0:
            print(f"step={index:4d} prediction={prediction.item():.5f} regularization={regularization.item():.5f}")

    encoder.eval(); predictor.eval(); probe.eval()
    with torch.no_grad():
        train_latent = encoder(train_input)
        val_latent = encoder(val_input)
        val_future = encoder(val_target)
        val_predicted = predictor(val_latent, val_action)
        latent_rmse = torch.sqrt(F.mse_loss(val_predicted, val_future)).item()

        probe_target = torch.stack([
            train_state[:, 0] / 2.4,
            train_state[:, 1] / 4.0,
            torch.sin(train_state[:, 2]),
            torch.cos(train_state[:, 2]),
            train_state[:, 3] / 6.0,
        ], dim=1)
        expected = torch.stack([
            val_state[:, 0] / 2.4,
            val_state[:, 1] / 4.0,
            torch.sin(val_state[:, 2]),
            torch.cos(val_state[:, 2]),
            val_state[:, 3] / 6.0,
        ], dim=1)
    with torch.no_grad():
        decoded = probe(val_latent)
        probe_rmse = torch.sqrt(F.mse_loss(decoded, expected)).item()

    encoder_first: nn.Linear = encoder.layers[0]
    encoder_last: nn.Linear = encoder.layers[2]
    predictor_first: nn.Linear = predictor.layers[0]
    predictor_last: nn.Linear = predictor.layers[2]
    probe_first: nn.Linear = probe.layers[0]
    probe_last: nn.Linear = probe.layers[2]
    metadata = {
        "trainingSamples": TRAIN_SAMPLES,
        "validationSamples": VALIDATION_SAMPLES,
        "latentDimensions": LATENT,
        "inputPixels": INPUT_SIZE,
        "parameters": sum(p.numel() for p in [*encoder.parameters(), *predictor.parameters()]),
        "latentOneStepRmse": round(latent_rmse, 6),
        "stateProbeRmse": round(probe_rmse, 6),
        "seed": SEED,
    }
    output = f'''// Generated by scripts/train_cartpole_world_model.py. Do not edit by hand.\nexport const cartPoleModelWeights = {{\n  encoder1: {{ weight: {format_ts(array(encoder_first.weight))}, bias: {format_ts(array(encoder_first.bias))} }},\n  encoder2: {{ weight: {format_ts(array(encoder_last.weight))}, bias: {format_ts(array(encoder_last.bias))} }},\n  predictor1: {{ weight: {format_ts(array(predictor_first.weight))}, bias: {format_ts(array(predictor_first.bias))} }},\n  predictor2: {{ weight: {format_ts(array(predictor_last.weight))}, bias: {format_ts(array(predictor_last.bias))} }},\n  probe1: {{ weight: {format_ts(array(probe_first.weight))}, bias: {format_ts(array(probe_first.bias))} }},\n  probe2: {{ weight: {format_ts(array(probe_last.weight))}, bias: {format_ts(array(probe_last.bias))} }},\n  metadata: {format_ts(metadata)},\n}} as const;\n'''
    target = Path(__file__).resolve().parents[1] / "lib" / "cartpole" / "model-weights.ts"
    target.write_text(output)
    print(json.dumps(metadata, indent=2))
    print(f"wrote {target}")


if __name__ == "__main__":
    main()
