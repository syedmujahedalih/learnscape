# Learnscape demo video and pitch kit

## The one-line pitch

Learnscape turns STEM concepts into interactive systems that reveal how a student reasons, choose the experiment they need next, and verify that understanding transfers.

## Before recording

- Use a 16:9 browser window at 1440 × 900 or larger and hide bookmarks and notifications.
- Open the deployed home page, reload once, and click **Enter the observatory** before the take to warm the 3D bundle.
- Reset the mission, then return to the home page. Keep a second tab on this script.
- Record cursor clicks as the primary action; do not scroll while speaking unless the script calls for it.
- Use the deterministic sample path. Local Llama and GPT are valuable architecture proof, but network latency should not be in the 90-second product video.

## 90-second submission video

| Time | Screen action | Narration |
|---|---|---|
| 0:00–0:08 | Home hero and learning loop. | “Students can get an answer right without understanding what causes it. Static pages and generic chat rarely reveal that gap.” |
| 0:08–0:16 | Click **Enter the observatory**. | “Learnscape turns a concept into an interactive system where students predict, experiment, revise, and transfer.” |
| 0:16–0:28 | Select **The swing becomes faster**, set confidence to 80%, and lock. | “Here, a learner confidently predicts that a heavier pendulum swings faster. That prediction is evidence—not just a wrong answer.” |
| 0:28–0:40 | In the notebook, briefly open **Instructor lens**. Then click **Set up experiment**. | “Learnscape estimates the likely misconception and chooses a controlled mass comparison as the most useful next experiment.” |
| 0:40–0:53 | Release the pendulum; point to the actual motion, forecast, energy, and physics check. | “The learner watches the real-time world, a tiny learned forecast, and a validated physics reference agree: mass changes energy, but not the ideal period.” |
| 0:53–1:04 | Click **Compare with prediction**, then **I changed my thinking**. | “They must reconcile the evidence with their original claim.” |
| 1:04–1:18 | Enter: “Mass does not change the ideal period; length controls the swing time.” Choose **lengthen the cord**. | “Then they explain the causal rule and apply it to an unfamiliar question. Progress comes from transfer, not clicking through.” |
| 1:18–1:30 | Stamp the passport, then finish on the completion state or home thesis. | “Learnscape is not AI-generated 3D content. It is a learning world: domain model, simulation, learner model, and tutor—helping a student’s internal model move closer to reality.” |

Recommended final title card: **Learnscape — Predict. Experiment. Understand why.**

## Three-minute live pitch

### 0:00–0:30 — Problem and thesis

“Textbooks compress dynamic systems into static pages, and most AI tutors wait for students to ask questions. Neither reliably shows an instructor how the student thinks the system works. Learnscape turns a concept into a learning world where a student must predict, intervene, observe, revise, and transfer. The 3D view is the presentation layer; causal understanding is the product.”

### 0:30–1:45 — Flagship demonstration

Enter the Pendulum Observatory. Select **The swing becomes faster** at 80% confidence and lock it.

“This is a common misconception: heavier objects feel as if they should swing faster. Learnscape combines the prediction and confidence with later evidence to maintain an inspectable probability distribution over possible misconceptions.”

Open **Instructor lens** and click **Set up experiment**.

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
- Local llama.cpp for no-credit development; optional GPT provider isolated server-side.
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
