# Learnscape

**Don’t just read it. Test your model.** Learnscape turns a textbook source into a prediction-locked learning world. Learners commit to a mental model, change one variable, compare their prediction with evidence, explain the causal relationship, and pass a transfer check.

## Product wedge

Learnscape is not a generic course library or a points layer on top of video. Its differentiator is a source-grounded reasoning loop:

1. **Predict** — commit before the controls unlock.
2. **Experiment** — change the simulated world and capture evidence.
3. **Compare** — decide whether the evidence supports or revises the original model.
4. **Transfer** — apply the causal relationship in a changed situation.

Gamification rewards evidence and conceptual progress: an insight score, lab-notebook trail, concept-passport stamp, and discoveries tied to meaningful experimental states. The 90-second guided mission is the primary demo path.

## What is included

- Acid–base titration — a deterministic, simplified strong-acid/strong-base model with synchronized lab, molecular, curve, and equation views.
- Ohm’s Law circuit lab — a closed DC circuit model with adjustable voltage, resistance, and switch state.
- Statistics preview — an experimental mean-versus-median and outlier interaction.
- Source workflow — local Llama analysis, deterministic fixtures, source traceability, and intentional unsupported states.
- Learning missions — prediction locks, confidence capture, correctness-gated transfer checks, insight scoring, and replayable concept passports.

## Run it

1. Install dependencies with `npm install`.
2. Start your llama.cpp server (the local configuration is in `.env.example`).
3. Copy `.env.example` to `.env.local` if you need a non-default model/address.
4. Run `npm run dev`.

The app works without the model through deterministic sample pages. Use **Local Llama** for pasted-text classification. Image upload records the source locally; GPT vision can be enabled later by adding `OPENAI_API_KEY` server-side and selecting GPT‑5.6.

## Scientific boundaries

The titration is an idealized educational calculation, not laboratory chemistry. The circuit is not a SPICE simulator. Particle motion is conceptual. Statistics is a narrow experimental preview. Every blueprint states its validation status.

## Build Week notes

Learnscape is built with Codex. The optional GPT‑5.6 provider is deliberately isolated behind a server-side key; deterministic samples keep the judged demo reliable without network or API-credit dependence.
