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

## What is included

- Pendulum Observatory — a polished Three.js world with live kinetic/potential energy, a validated RK4 solver, and an actual trained 818-parameter transition model forecasting motion in the browser.
- Acid–base titration — a deterministic, simplified strong-acid/strong-base model with synchronized lab, molecular, curve, and equation views.
- Ohm’s Law circuit lab — a closed DC circuit model with adjustable voltage, resistance, and switch state.
- Statistics preview — an experimental mean-versus-median and outlier interaction.
- Source workflow — local Llama analysis, deterministic fixtures, source traceability, and intentional unsupported states.
- Adaptive learning missions — prediction locks, confidence capture, misconception inference, information-guided experiment selection, transfer checks, insight scoring, and replayable concept passports.

## Run it

1. Install dependencies with `npm install`.
2. Start your llama.cpp server (the local configuration is in `.env.example`).
3. Copy `.env.example` to `.env.local` if you need a non-default model/address.
4. Run `npm run dev`.

The app works without the model through deterministic sample pages. Use **Local Llama** for pasted-text classification. Image upload records the source locally; GPT vision can be enabled later by adding `OPENAI_API_KEY` server-side and selecting GPT‑5.6.

## Scientific boundaries

The pendulum assumes a rigid massless cord, point-mass bob, uniform gravity, and linear damping. Its learned forecast is educational; the numerical solver remains the validated reference. The titration is an idealized educational calculation, the circuit is not a SPICE simulator, and statistics remains a narrow experimental preview. Every blueprint states its validation status.

## Retrain the pendulum predictor

Run `python3 scripts/train_pendulum_model.py` to regenerate the deterministic TypeScript weight artifact. The training script uses procedurally generated state transitions and records its validation score alongside the exported weights.

## Build Week notes

Learnscape is built with Codex. The optional GPT‑5.6 provider is deliberately isolated behind a server-side key; deterministic samples keep the judged demo reliable without network or API-credit dependence.

The exact recording path, timed narration, pitch, technical proof points, and judge Q&A are in [`docs/demo-script.md`](docs/demo-script.md).
