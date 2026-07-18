# Learnscape

**Step inside what you’re learning.** Learnscape turns a textbook source into a structured learning blueprint, then connects a learner’s prediction, manipulation, observation, equation, explanation, and transfer challenge.

## What is included

- Acid–base titration — a deterministic, simplified strong-acid/strong-base model with synchronized lab, molecular, curve, and equation views.
- Ohm’s Law circuit lab — a closed DC circuit model with adjustable voltage, resistance, and switch state.
- Statistics preview — an experimental mean-versus-median and outlier interaction.
- Source workflow — local Llama analysis, deterministic fixtures, source traceability, and intentional unsupported states.

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
