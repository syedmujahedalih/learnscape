import { cartPoleModelWeights } from "./model-weights.ts";
import type { CartPoleState } from "./engine.ts";

type Action = -1 | 0 | 1;
type Layer = { weight: readonly (readonly number[])[]; bias: readonly number[] };

const IMAGE_SIZE = 24;
const ACTIONS: readonly Action[] = [-1, 0, 1];

function silu(value: number) { return value / (1 + Math.exp(-value)); }

function dense(input: readonly number[], layer: Layer, activation = true) {
  return layer.weight.map((row, index) => {
    let total = layer.bias[index];
    for (let i = 0; i < row.length; i += 1) total += row[i] * input[i];
    return activation ? silu(total) : total;
  });
}

function drawLine(image: number[], x0: number, y0: number, x1: number, y1: number, value: number) {
  const steps = Math.max(2, Math.floor(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2));
  for (let i = 0; i <= steps; i += 1) {
    const progress = i / steps;
    const x = x0 + (x1 - x0) * progress;
    const y = y0 + (y1 - y0) * progress;
    const xFloor = Math.floor(x);
    const yFloor = Math.floor(y);
    for (const [pixelX, weightX] of [[xFloor, 1 - (x - xFloor)], [xFloor + 1, x - xFloor]]) for (const [pixelY, weightY] of [[yFloor, 1 - (y - yFloor)], [yFloor + 1, y - yFloor]]) {
      if (pixelX >= 0 && pixelX < IMAGE_SIZE && pixelY >= 0 && pixelY < IMAGE_SIZE) image[pixelY * IMAGE_SIZE + pixelX] = Math.max(image[pixelY * IMAGE_SIZE + pixelX], value * weightX * weightY);
    }
  }
}

export function renderCartPolePixels(state: CartPoleState) {
  const image = Array.from({ length: IMAGE_SIZE * IMAGE_SIZE }, () => 0);
  const trackY = 18;
  for (let x = 1; x < IMAGE_SIZE - 1; x += 1) image[trackY * IMAGE_SIZE + x] = .18;
  const cartX = 12 + Math.max(-2.7, Math.min(2.7, state.x)) / 2.7 * 9;
  for (let x = 0; x < IMAGE_SIZE; x += 1) {
    const coverage = Math.max(0, Math.min(1, 3 - Math.abs((x + .5) - cartX)));
    if (coverage > 0) for (let y = 16; y < 19; y += 1) image[y * IMAGE_SIZE + x] = .62 * coverage;
  }
  drawLine(image, cartX, 16, cartX + Math.sin(state.angle) * 10, 16 - Math.cos(state.angle) * 10, 1);
  return image;
}

export function encodeCartPole(previous: CartPoleState, current: CartPoleState) {
  const pixels = [...renderCartPolePixels(previous), ...renderCartPolePixels(current)];
  return dense(dense(pixels, cartPoleModelWeights.encoder1), cartPoleModelWeights.encoder2, false);
}

export function predictCartPoleLatent(latent: readonly number[], action: Action) {
  return dense(dense([...latent, action], cartPoleModelWeights.predictor1), cartPoleModelWeights.predictor2, false);
}

export function decodeCartPoleLatent(latent: readonly number[]): CartPoleState {
  const decoded = dense(dense(latent, cartPoleModelWeights.probe1), cartPoleModelWeights.probe2, false);
  return {
    x: decoded[0] * 2.4,
    xVelocity: decoded[1] * 4,
    angle: Math.atan2(decoded[2], decoded[3]),
    angularVelocity: decoded[4] * 6,
  };
}

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ result >>> 15, result | 1);
    result ^= result + Math.imul(result ^ result >>> 7, result | 61);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}

function sampleAction(probabilities: readonly number[], next: () => number): Action {
  const draw = next();
  if (draw < probabilities[0]) return -1;
  if (draw < probabilities[0] + probabilities[1]) return 0;
  return 1;
}

function planCost(latent: readonly number[], step: number) {
  const state = decodeCartPoleLatent(latent);
  const angle = Math.atan2(Math.sin(state.angle), Math.cos(state.angle));
  const terminalWeight = step > 20 ? 2.2 : 1;
  return terminalWeight * (5.2 * angle ** 2 + .42 * state.angularVelocity ** 2 + .3 * state.x ** 2 + .08 * state.xVelocity ** 2);
}

export type LatentPlan = {
  actions: Action[];
  imagined: CartPoleState[];
  candidates: number;
  iterations: number;
  horizon: number;
};

export function planCartPole(previous: CartPoleState, current: CartPoleState): LatentPlan {
  const horizon = 32;
  const candidates = 192;
  const iterations = 4;
  const eliteCount = 24;
  const probabilities = Array.from({ length: horizon }, () => [1 / 3, 1 / 3, 1 / 3]);
  const next = random(2026);
  const initial = encodeCartPole(previous, current);
  let bestActions: Action[] = [];
  let bestLatents: number[][] = [];

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const trials = Array.from({ length: candidates }, () => {
      let latent = initial;
      let cost = 0;
      const actions: Action[] = [];
      const latents: number[][] = [];
      for (let step = 0; step < horizon; step += 1) {
        const action = sampleAction(probabilities[step], next);
        latent = predictCartPoleLatent(latent, action);
        actions.push(action);
        latents.push(latent);
        cost += planCost(latent, step) + .012 * Math.abs(action);
      }
      return { actions, latents, cost };
    }).sort((a, b) => a.cost - b.cost);
    bestActions = trials[0].actions;
    bestLatents = trials[0].latents;
    const elites = trials.slice(0, eliteCount);
    for (let step = 0; step < horizon; step += 1) {
      const counts = ACTIONS.map(action => elites.filter(trial => trial.actions[step] === action).length + 1.5);
      const total = counts.reduce((sum, count) => sum + count, 0);
      probabilities[step] = counts.map(count => count / total);
    }
  }

  return {
    actions: bestActions,
    imagined: bestLatents.map(decodeCartPoleLatent),
    candidates,
    iterations,
    horizon,
  };
}

export function cartPoleLatentError(previous: CartPoleState, current: CartPoleState, nextState: CartPoleState, action: Action) {
  const predicted = predictCartPoleLatent(encodeCartPole(previous, current), action);
  const observed = encodeCartPole(current, nextState);
  return Math.sqrt(predicted.reduce((sum, value, index) => sum + (value - observed[index]) ** 2, 0) / predicted.length);
}

export const cartPoleWorldModelInfo = {
  ...cartPoleModelWeights.metadata,
  architecture: "two-frame pixel encoder → 8D latent → action-conditioned transition",
  training: "joint-embedding prediction with anti-collapse regularization and a physics probe",
  authority: "learned model plans; analytic CartPole dynamics judge the result",
};
