# Learnscape demo video and pitch kit

## The one-line pitch

Learnscape turns STEM concepts into interactive systems that reveal how a student reasons, choose the experiment they need next, and verify that understanding transfers.

## Before recording

- Use a 16:9 browser window at 1440 × 900 or larger and hide bookmarks and notifications. The flagship is designed to remain in one frame at this size.
- Open the deployed home page, reload once, and click **Enter the pendulum** before the take to warm the 3D bundle.
- Reset the mission, then return to the home page. Keep a second tab on this script.
- Record cursor clicks as the primary action; do not scroll while speaking unless the script calls for it.
- Use the deterministic sample path. Local Llama and GPT are valuable architecture proof, but network latency should not be in the 90-second product video.

## 90-second submission video

| Time | Screen action | Narration |
|---|---|---|
| 0:00–0:07 | Home hero: textbook excerpt, causal map, and pendulum world are all visible. | “Static pages tell students what happens. Generic chat can explain it. Neither reliably reveals what a student thinks causes it.” |
| 0:07–0:15 | Click **Watch the transformation**; the source-to-world reveal appears. | “Learnscape maps the source into a causal question, a likely misconception, and a validated world where that idea can be tested.” |
| 0:15–0:25 | Point to source, cause → effect, misconception, then click **Enter the learning world**. | “This is not arbitrary 3D generation. It is a learning blueprint grounded in the supplied material.” |
| 0:25–0:37 | Select **The swing becomes faster**, set confidence to 80%, and choose **Test my prediction**. | “A learner predicts that a heavier pendulum swings faster. That prediction becomes useful evidence.” |
| 0:37–0:48 | Point to the automatically prepared controlled setup. | “Learnscape estimates the likely misconception and chooses the controlled experiment with the highest learning value.” |
| 0:48–1:00 | Release the pendulum and point to its motion and energy exchange. | “A tiny learned forecast is checked against validated physics: mass changes energy, but not the ideal period.” |
| 1:00–1:10 | Choose **I changed my mind** after the comparison. | “The learner must reconcile the evidence with the original claim.” |
| 1:10–1:23 | Enter the causal explanation and choose **lengthen the cord**. | “Then they explain the rule and transfer it to an unfamiliar problem. Progress comes from understanding, not clicking through.” |
| 1:23–1:30 | Stamp the passport. | “Learnscape turns what students read into a system they can reason about—and their interactions into evidence an instructor can act on.” |

Recommended final title card: **Learnscape — Predict. Experiment. Understand why.**

## Three-minute live pitch

### 0:00–0:30 — Problem and thesis

“Textbooks compress dynamic systems into static pages, and most AI tutors wait for students to ask questions. Neither reliably shows an instructor how the student thinks the system works. Learnscape turns a concept into a learning world where a student must predict, intervene, observe, revise, and transfer. The 3D view is the presentation layer; causal understanding is the product.”

### 0:30–1:45 — Flagship demonstration

Start on the home page and click **Watch the transformation**. Point to the supplied excerpt, the causal map, the likely misconception, and the selected validated world. Explain that **LIVE** means the structured blueprint came from GPT or local Llama; **DEMO REPLAY** is the honest deterministic fallback. Then enter the Pendulum Observatory, select **The swing becomes faster** at 80% confidence, and choose **Test my prediction**.

“This is a common misconception: heavier objects feel as if they should swing faster. Learnscape combines the prediction and confidence with later evidence to maintain an inspectable probability distribution over possible misconceptions.”

Point out the automatically prepared test. Open **Learning evidence** only if the judge asks how the path was selected.

“Instead of giving the answer, it estimates which controlled experiment has the highest learning value. For this learner it holds length and angle constant and changes mass. The choice stays fixed while evidence is collected.”

Release the pendulum.

“The amber physics reference is authoritative. The blue path is a trained 818-parameter neural forecast running in the browser. It was trained on generated transitions and reaches a recorded validation R² above 0.999. The student sees the forecast checked against the experiment rather than being asked to trust a black box.”

Compare, choose **I changed my thinking**, enter the explanation, select **lengthen the cord**, and stamp the passport.

“The mission is not complete until the learner explains the cause and transfers it. The instructor lens updates from that new evidence.”

### 1:45–2:20 — Platform proof

“This is one deep vertical slice inside a domain-general shell. A shared, source-validated blueprint describes concepts, variables, equations, misconceptions, and mission stages. Separate engines preserve scientific honesty: pendulum physics is not reused as chemistry, circuits, or statistics. A teacher can start with deterministic samples or analyze pasted material with a local llama.cpp server; GPT is an optional production provider.”

Briefly show the library and source-to-blueprint path. Do not attempt a live model call unless there is spare time.

### 2:20–3:00 — Buyer, validation, and close

“Our first buyer is an introductory STEM instructor or department that needs to see more than quiz correctness. The wedge is high-misconception concepts where one controlled interaction exposes causal thinking. A pilot would measure prediction-to-transfer improvement and compare the chosen intervention with a fixed simulation sequence. Today this is one validated pendulum experience—not a claim of universal simulation generation or proven learning gains. Learnscape turns what students read into a system they can reason about, and turns their interactions into evidence an instructor can act on.”

## Technical proof points to put on one slide

- Three.js interactive pendulum with synchronized motion, energy, parameters, and accessible values.
- Authoritative RK4 reference physics with automated energy-conservation tests.
- Trained 818-parameter next-state neural network running in the browser; recorded validation R² above 0.999.
- Probabilistic learner state updated from prediction, confidence, reflection, explanation, and transfer.
- Entropy/information-gain experiment selection across mass, length, and energy interventions.
- Source-grounded Zod blueprint contract and separate subject engines.
- OpenAI Responses API with strict structured output for causal question, cause, effect, misconception, and world selection.
- Local llama.cpp for no-credit development and an explicitly labeled deterministic replay when a provider is unavailable.
- Deterministic, offline-safe judged path with explicit scientific boundaries.

## Why this earns a 4/5 technical-risk story

The risk is no longer “can we render a pendulum?” It is whether sparse learner actions can identify a useful misconception, whether a learned dynamics forecast remains faithful to a validated physical system, and whether the platform can choose a better next experiment than a fixed lesson sequence. The prototype implements all three as an inspectable vertical slice. A 5/5 claim would require real classroom calibration, richer evidence, and measured improvement over a baseline; do not overclaim it.

## Judge Q&A

**How is this different from PhET or another simulation?**

PhET gives students excellent systems to explore. Learnscape’s wedge is the reasoning layer around a system: commit a prediction, infer a likely misconception, choose the next experiment, capture revision, and verify transfer from source-grounded course material.

**Where is the AI?**

There are three distinct intelligence layers: a trained network forecasts physical transitions; a probabilistic learner state interprets evidence; and local Llama or GPT can turn source material into a validated blueprint and feedback. AI is used for prediction and adaptation, not as a synonym for 3D generation.

**Is the neural network replacing the physics engine?**

No. The RK4 engine is the authoritative reference. The learned forecast is visible and continuously compared with it, which makes both its value and limitations inspectable.

**Is the learner state a psychological diagnosis?**

No. It is a transparent hypothesis over a narrow set of concept-specific misconceptions, based only on visible mission evidence. The instructor can inspect why a path was selected.

**How would you validate learning value?**

Run a small introductory-physics pilot with a pre-prediction, immediate transfer, and delayed transfer. Compare adaptive experiment selection against the same simulation with a fixed experiment order. Measure transfer accuracy, explanation quality, and revision calibration.

**Who pays?**

Start with introductory STEM instructors and departments that teach high-enrollment, misconception-heavy courses. Students are the users; instructors buy a better intervention and better evidence of understanding.

**Can it run without GPT credits?**

Yes. The judged mission is deterministic, and source analysis supports a local llama.cpp server for development. GPT is optional for production-quality interpretation and tutor language.

**Is this a LeJEPA or a general world model?**

No. The current forecast is a small supervised next-state MLP trained on pendulum transitions. Calling it LeJEPA would overstate the implementation. The architecture creates a credible path toward learned latent world models after the educational loop is validated.

**What is the biggest limitation today?**

The learner-state likelihoods are authored and uncalibrated, the experience covers one deep concept, and no classroom learning-gain claim has been validated yet. Those are the next pilot questions, not details to hide.

## Five phrases to repeat

1. “The 3D world is the presentation layer; causal understanding is the product.”
2. “A wrong prediction is useful evidence.”
3. “Learnscape chooses the experiment the learner needs next.”
4. “Progress is earned by transfer, not clicking through.”
5. “The physics and learner hypotheses are inspectable.”

## Avoid saying

- “AI generates arbitrary scientifically accurate worlds.”
- “This learner definitely has a misconception.” Say “the evidence currently suggests.”
- “The neural model is the ground truth.”
- “This is LeJEPA” or “a general world model.”
- “We proved learning gains.”
