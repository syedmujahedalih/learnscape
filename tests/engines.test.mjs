import test from "node:test";
import assert from "node:assert/strict";
import { calculateTitration } from "../lib/titration/engine.ts";
import { calculateCircuit } from "../lib/circuit/engine.ts";
import { statistics } from "../lib/statistics/simulations.ts";
import { approximatePeriod, simulatePendulum, stepPendulum } from "../lib/pendulum/engine.ts";
import { learnedPendulumStep, pendulumModelInfo } from "../lib/pendulum/model.ts";
import { choosePendulumExperiment, inferPendulumBeliefs } from "../lib/learner/pendulum.ts";
import { deterministicSourceAnalysis, sourceAnalysisSchema } from "../lib/blueprint/source-analysis.ts";

test("titration reaches pH 7 at equivalence", () => { const state = calculateTitration(25); assert.equal(state.equivalenceMl, 25); assert.equal(state.pH, 7); assert.equal(state.excess, "none"); });
test("titration tracks acid excess after equivalence", () => { const state = calculateTitration(30); assert.equal(state.excess, "hydronium"); assert.ok(state.pH < 7); });
test("open circuit has no current", () => assert.equal(calculateCircuit(9, 3, false).current, 0));
test("Ohm's law responds to variables", () => assert.equal(calculateCircuit(12, 6, true).current, 2));
test("mean shifts farther than median for an outlier", () => { const near = statistics([4,5,6,6,7,8,13]); const far = statistics([4,5,6,6,7,8,20]); assert.ok(far.mean - near.mean > far.median - near.median); });
test("pendulum period grows with the square root of length", () => { assert.ok(Math.abs(approximatePeriod(4) / approximatePeriod(1) - 2) < 1e-10); });
test("undamped pendulum conserves energy in the validated solver", () => { const points = simulatePendulum({ length: 1.4, mass: 1.2, gravity: 9.81, damping: 0, initialAngleDeg: 40 }, 6); const energies = points.map(point => point.total); assert.ok((Math.max(...energies) - Math.min(...energies)) / energies[0] < .001); });
test("learned transition model closely forecasts one physical step", () => { const parameters = { length: 1.4, mass: 1, gravity: 9.81, damping: .03, initialAngleDeg: 40 }; const theta = .55; const omega = -1.2; const learned = learnedPendulumStep(theta, omega, parameters); const reference = stepPendulum(theta, omega, .04, parameters); assert.ok(Math.abs(learned.theta - reference.theta) < .012); assert.ok(Math.abs(learned.omega - reference.omega) < .04); assert.ok(pendulumModelInfo.validationScore > .99); });
test("a confident mass misconception becomes the leading learner belief", () => { const beliefs = inferPendulumBeliefs({ prediction: "The swing becomes faster", confidence: 80, experimentCompleted: false, reflection: "", explanation: "", transferChoice: "" }); assert.ok(beliefs.mass_period > .6); assert.equal(choosePendulumExperiment(beliefs).id, "compare_mass"); });
test("the learner belief distribution stays normalized", () => { const beliefs = inferPendulumBeliefs({ prediction: "The swing becomes faster", confidence: 90, experimentCompleted: true, reflection: "revised", explanation: "Mass does not change the period; length controls it.", transferChoice: "lengthen the cord" }); const total = Object.values(beliefs).reduce((sum, probability) => sum + probability, 0); assert.ok(Math.abs(total - 1) < 1e-12); });
test("revision, explanation, and transfer reduce the diagnosed misconception", () => { const predictionOnly = inferPendulumBeliefs({ prediction: "The swing becomes faster", confidence: 80, experimentCompleted: false, reflection: "", explanation: "", transferChoice: "" }); const afterLearning = inferPendulumBeliefs({ prediction: "The swing becomes faster", confidence: 80, experimentCompleted: true, reflection: "revised", explanation: "Mass does not change the period; length controls swing time.", transferChoice: "lengthen the cord" }); assert.ok(afterLearning.mass_period < predictionOnly.mass_period); assert.ok(afterLearning.ready > predictionOnly.ready); });
test("source mapping recognizes the pendulum causal world", () => { const analysis = deterministicSourceAnalysis("The ideal pendulum period depends on length and gravity, not bob mass."); assert.equal(analysis.templateId, "pendulum_world"); assert.match(analysis.causalQuestion, /pendulum/i); assert.match(analysis.misconception, /heavier/i); });
test("unknown source material receives a source-grounded concept studio", () => { const analysis = deterministicSourceAnalysis("A survey of medieval manuscript illumination techniques."); assert.equal(analysis.templateId, "concept_studio"); assert.match(analysis.whyInteractive, /causal map/i); });
test("verbose model copy is compacted to fit the lesson UI", () => {
  const analysis = sourceAnalysisSchema.parse({
    templateId: "concept_studio",
    title: "Newton's First Law and Friction",
    summary: "A source-grounded lesson about motion and friction.",
    sourceExcerpt: "A body in motion tends to remain in motion unless acted on by a net external force.",
    causalQuestion: "How does friction change the motion of a sliding object?",
    primaryCause: "the amount of kinetic friction acting opposite the direction of the object's motion on the surface",
    primaryEffect: "the object's speed over time",
    misconception: "An object needs a continuing net force to keep moving at constant velocity.",
    whyInteractive: "A learner can compare otherwise identical objects on surfaces with different friction, observe the resulting changes in velocity over time, connect the evidence to net force and Newton's first law, revise an initial prediction, and explain why the object slows down without treating motion itself as evidence of a continuing forward force.",
  });
  assert.ok(analysis.primaryCause.length <= 80);
  assert.ok(analysis.whyInteractive.length <= 220);
  assert.match(analysis.primaryCause, /…$/);
  assert.match(analysis.whyInteractive, /…$/);
});
