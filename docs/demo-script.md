# Learnscape demo video and pitch kit

## Submission-critical checklist

- Deadline: **Tuesday, July 21 at 5:00 PM PT**.
- Create the Devpost project draft now; the connected account is registered, but no project draft exists yet.
- Video: **under 3:00**, public YouTube, with spoken audio explaining the product, Codex, and GPT-5.6.
- Run one explicit, meaningful build session with **GPT-5.6 Terra in Codex** and record exactly what changed. Recommended task: launch-readiness audit plus one implemented fix to the source-to-world flow.
- In Codex, run `/feedback` on the task containing most of the core build and save the session ID required by the submission form.
- Provide a code-repository URL. If private, share it with `testing@devpost.com` and `build-week-event@openai.com`; if public, add an appropriate license.
- Verify the YouTube link in an incognito/private window before submitting.

Recommended GPT-5.6 Terra prompt:

> Audit Learnscape as an OpenAI Build Week Education-track submission against technological implementation, design, potential impact, and quality of idea. Run the product and tests, identify the single highest-impact weakness visible in a three-minute judged demo, implement a scoped fix, verify it, and document the decision in the README.

## The one-line pitch

Learnscape teaches controls by letting students inspect, use, and falsify a physics-grounded latent world model.

## Current judged path — 90 seconds

| Time | Screen action | Narration |
|---|---|---|
| 0:00–0:12 | Hold on the new landing page. Point from **Predict** to **Falsify**. | “Controls students learn equations and use simulators, but rarely get to interrogate the model doing the predicting. Learnscape makes that model the lesson.” |
| 0:12–0:25 | Enter the CartPole lab. Choose **The model will recover it** in the known world. | “Two rendered frames become an eight-dimensional latent state. The model predicts the next latent conditioned on left, coast, or right.” |
| 0:25–0:42 | Click **Imagine 768 futures**. Point to the ghost CartPole and latent bars. | “Cross-entropy search tests hundreds of action sequences in imagination. Model Predictive Control takes one action, observes the world, and replans.” |
| 0:42–0:57 | Run the plan and let the nominal rollout finish. | “In the training world, the learned plan catches the falling pole. The amber system is authoritative physics; the blue ghost is only the model’s forecast.” |
| 0:57–1:12 | Reset to **Hidden friction**, predict surprise, imagine, and run. | “Now I change a rule the model never saw. Friction creates prediction error and the plan misses. Failure is not hidden—it becomes the student’s evidence about distribution shift and system identification.” |
| 1:12–1:25 | Open **What is—and isn’t—learned?** | “This is a real but deliberately narrow world model: a visual encoder, action-conditioned latent dynamics, planning, and a physics reality check. It is not arbitrary AI-generated 3D content.” |
| 1:25–1:30 | Return to the landing thesis. | “Learnscape: predict, imagine, act, falsify.” |

## Earlier pendulum cut — supplementary

## Before recording

- Use a 16:9 browser window at 1440 × 900 or larger and hide bookmarks and notifications. The flagship is designed to remain in one frame at this size.
- Open the deployed home page, reload once, and click **Enter the pendulum** before the take to warm the 3D bundle.
- Reset the mission, then return to the home page. Keep a second tab on this script.
- Record cursor clicks as the primary action; do not scroll while speaking unless the script calls for it.
- Use the deterministic sample path. Local Llama and GPT are valuable architecture proof, but network latency should not be in the 90-second product video.

## Earlier official submission video — target 2:40

Record the product full-screen at 1440 × 900. Use deliberate cursor movement, no background music under important narration, and leave roughly 15 seconds of safety under the three-minute limit.

| Time | Screen action | Narration |
|---|---|---|
| 0:00–0:12 | Hold on the redesigned landing page. Slowly point across textbook excerpt → causal map → pendulum. | “Textbooks tell students what happens. AI tutors can explain it. But neither reliably reveals what a student thinks causes it. Learnscape turns a concept into a system a learner can predict, test, and understand.” |
| 0:12–0:32 | Click **Watch the transformation**. Point to the source, cause → effect, misconception, and chosen world. | “From one course excerpt, Learnscape builds a grounded learning blueprint: the causal question, the variable relationship, a misconception worth testing, and a validated interactive world. It is not arbitrary AI-generated 3D content.” |
| 0:32–0:46 | Click **Enter the learning world**. Select **The swing becomes faster**, choose **Pretty sure**, then **Test my prediction**. | “Here the student predicts that a heavier pendulum swings faster. They commit before the controls unlock, so even a wrong answer becomes useful evidence about how they reason.” |
| 0:46–1:04 | Point to the automatically prepared mass comparison. Briefly open **Learning evidence** if it fits cleanly. | “Learnscape maintains an inspectable probability distribution over concept-specific misconceptions, then selects the controlled experiment with the highest expected learning value. For this learner, it holds length and angle constant and changes mass.” |
| 1:04–1:25 | Release the pendulum. Point to both trajectories, the live energy display, and the result. | “The amber path is the validated numerical physics reference. The blue path is an 818-parameter learned next-state forecast running in the browser. The forecast is checked against the reference rather than presented as ground truth.” |
| 1:25–1:43 | Continue, choose **I changed my mind**, then show the explanation and transfer question. | “The student must reconcile the evidence with the original claim, explain the causal rule, and transfer it to a changed situation. Mastery is earned through transfer—not by clicking through content.” |
| 1:43–1:57 | Enter the correct explanation, select **lengthen the cord**, and stamp the concept passport. | “Their prediction, confidence, experiment, revision, explanation, and transfer answer become an evidence trail an instructor can inspect.” |
| 1:57–2:20 | Switch to Codex. Show this task, the edited files or build log, and a passing test result. | “I built Learnscape with Codex as an engineering collaborator: pressure-testing the product wedge, simplifying the student flow, implementing the Three.js world, learner-state inference, experiment selection, structured source mapping, and automated scientific checks.” |
| 2:20–2:32 | Show the specific GPT-5.6 Terra task and its resulting diff or documented decision. | “I used GPT-5.6 Terra in Codex specifically to **[replace with the exact citable task and shipped result]**. I kept the judged path deterministic, so the demo does not depend on paid API credits or network latency.” |
| 2:32–2:45 | Return to the completion screen or landing thesis. | “Learnscape is a domain model, interactive simulation, learner model, and AI tutor working together—helping a student’s internal model move closer to reality. The 3D world is the presentation layer. Causal understanding is the product.” |

Do not record until the bracketed GPT-5.6 line names a task you actually completed with that model.

### Recording pickups

Record these as separate clips so a failed interaction does not ruin the whole take:

1. Landing and transformation reveal.
2. Prediction and adaptive experiment setup.
3. Pendulum release and evidence comparison.
4. Explanation, transfer, and passport.
5. Codex/GPT-5.6 proof.
6. Closing product thesis.

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
