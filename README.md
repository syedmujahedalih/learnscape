# Learnscape

**Predict. Imagine. Act. Falsify.** Learnscape teaches physics and controls by letting learners inspect a learned world model, use it to plan, and discover where its imagined dynamics stop matching reality.

## Product wedge

Learnscape is not a generic “AI generates 3D lessons” platform. Its wedge is a model-based controls loop:

1. **Predict** — commit to what the learned model will do.
2. **Imagine** — roll candidate action sequences through an action-conditioned latent model.
3. **Act** — execute the selected plan in an authoritative physics environment.
4. **Falsify** — change a hidden physical parameter and explain the resulting model error.

The first buyer remains a physics, robotics, or controls instructor. The core value is not prettier simulation: students learn representation, dynamics, planning, distribution shift, and system identification by making the model itself an object of inquiry.

## The focused prototype

- CartPole World Model Lab — two rendered observations are encoded into an 8D latent; an action-conditioned transition model imagines futures; Cross-Entropy Method search selects a plan; receding-horizon control replans after every observation; analytic CartPole physics judges the result.
- Falsification challenge — the nominal world matches the model’s training distribution, while hidden cart friction creates a visible out-of-distribution failure and prediction-error trail.
- Pendulum Observatory — a complementary causal-learning mission with Three.js motion, RK4 reference physics, learner-state inference, and a small learned next-state forecast.
- Source workflow — physics material can still be mapped into a causal question and an available validated lab. Unsupported material remains an explicitly labelled concept studio rather than a fabricated simulation.

The pendulum remains the most complete adaptive mission. The other routed labs are deliberately labelled by their current validation status, and sources outside those domains stay in the concept studio until a verified domain model is available.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL printed by the terminal. To test a production build locally, run `npm run build` followed by `npm run start`.

The app works without a model through the deterministic sample and explicitly labeled demo replay. For llama.cpp source mapping, start your server and set `LLAMA_BASE_URL` and `LLAMA_MODEL` in `.env.local`. A public Learnscape deployment cannot reach `127.0.0.1` on your Mac; run Learnscape locally, or make the model available through an authenticated HTTPS tunnel. GPT source analysis requires `OPENAI_API_KEY`; images and PDFs use GPT because they need multimodal reading.

See [local development and model connections](docs/local-development.md) for the complete setup guide and [the world-sharing roadmap](docs/world-sharing-roadmap.md) for the planned private/public creator model.

## Scientific boundaries

The CartPole model is a compact, LeWorldModel-inspired educational prototype—not an implementation of LeWorldModel, Dreamer, or TD-MPC2. It is trained on synthetic nominal CartPole trajectories with a joint-embedding prediction objective, anti-collapse regularization, and a small physics-grounding probe. It does not learn from arbitrary uploaded videos or generalize across embodiments. The analytic dynamics remain authoritative.

## Retrain the pendulum predictor

Run `python3 scripts/train_pendulum_model.py` to regenerate the deterministic TypeScript weight artifact. The training script uses procedurally generated state transitions and records its validation score alongside the exported weights.

## Retrain the CartPole latent model

Run `python3 scripts/train_cartpole_world_model.py`. It generates 28,000 nominal transitions, renders paired observations, trains the visual encoder and action-conditioned latent transition, fits the interpretability probe, validates the model, and exports browser-native TypeScript weights.

## Build Week notes

Learnscape is built with Codex. The optional GPT‑5.6 provider is deliberately isolated behind a server-side key; deterministic samples keep the judged demo reliable without network or API-credit dependence.

The exact recording path, timed narration, pitch, technical proof points, and judge Q&A are in [`docs/demo-script.md`](docs/demo-script.md).
