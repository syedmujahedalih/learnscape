# Learnscape

**Predict what happens. Discover why.** Learnscape turns course material into interactive STEM systems where learners reveal how they think, run a useful experiment, explain the causal relationship, and transfer it to a new situation.

## Product wedge

Learnscape is not a generic course library or a points layer on top of video. Its differentiator is a source-grounded reasoning loop:

1. **Predict** — commit before the controls unlock.
2. **Experiment** — change the simulated world and capture evidence.
3. **Compare** — decide whether the evidence supports or revises the original model.
4. **Transfer** — apply the causal relationship in a changed situation.

The student path stays deliberately small: Predict, Test, Explain. Evidence, free exploration, and instructor diagnostics remain available on demand without competing with the next action. The Pendulum Observatory is the primary demo path.

The flagship mission also maintains a probabilistic picture of the learner's current misconception. It combines their prediction, confidence, reflection, explanation, and transfer response, then selects the experiment with the highest expected learning value. The recommendation is locked while the student runs it so the evidence trail stays coherent. An optional instructor lens makes the inference and recommendation inspectable.

## The focused prototype

- Pendulum Observatory — the single visible flagship: a polished Three.js lesson with live kinetic/potential energy, a validated RK4 reference, and a trained 818-parameter transition forecast running in the browser.
- Source workflow — a pendulum course page becomes a testable relationship, belief worth testing, and validated lesson. It supports local Llama analysis, OpenAI Responses API structured output, deterministic replay, and an honest unsupported state for other subjects.
- Adaptive learning missions — prediction locks, confidence capture, misconception inference, information-guided experiment selection, transfer checks, insight scoring, and replayable concept passports.

Earlier chemistry, circuits, and statistics engines remain in the repository as exploratory work, but they are intentionally absent from the submission experience. The prototype demonstrates one complete learning loop instead of presenting several inconsistent subject previews.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL printed by the terminal. To test a production build locally, run `npm run build` followed by `npm run start`.

The app works without a model through the deterministic sample and explicitly labeled demo replay. For llama.cpp source mapping, start your server and set `LLAMA_BASE_URL` and `LLAMA_MODEL` in `.env.local`. A public Learnscape deployment cannot reach `127.0.0.1` on your Mac; run Learnscape locally, or make the model available through an authenticated HTTPS tunnel. GPT source analysis requires `OPENAI_API_KEY`; image upload requires GPT vision.

See [local development and model connections](docs/local-development.md) for the complete setup guide and [the world-sharing roadmap](docs/world-sharing-roadmap.md) for the planned private/public creator model.

## Scientific boundaries

The pendulum assumes a rigid massless cord, point-mass bob, uniform gravity, and linear damping. Its learned forecast is educational; the numerical solver remains the validated reference. The titration is an idealized educational calculation, the circuit is not a SPICE simulator, and statistics remains a narrow experimental preview. Every blueprint states its validation status.

## Retrain the pendulum predictor

Run `python3 scripts/train_pendulum_model.py` to regenerate the deterministic TypeScript weight artifact. The training script uses procedurally generated state transitions and records its validation score alongside the exported weights.

## Build Week notes

Learnscape is built with Codex. The optional GPT‑5.6 provider is deliberately isolated behind a server-side key; deterministic samples keep the judged demo reliable without network or API-credit dependence.

The exact recording path, timed narration, pitch, technical proof points, and judge Q&A are in [`docs/demo-script.md`](docs/demo-script.md).
