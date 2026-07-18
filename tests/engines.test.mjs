import test from "node:test";
import assert from "node:assert/strict";
import { calculateTitration } from "../lib/titration/engine.ts";
import { calculateCircuit } from "../lib/circuit/engine.ts";
import { statistics } from "../lib/statistics/simulations.ts";
import { approximatePeriod, simulatePendulum, stepPendulum } from "../lib/pendulum/engine.ts";
import { learnedPendulumStep, pendulumModelInfo } from "../lib/pendulum/model.ts";

test("titration reaches pH 7 at equivalence", () => { const state = calculateTitration(25); assert.equal(state.equivalenceMl, 25); assert.equal(state.pH, 7); assert.equal(state.excess, "none"); });
test("titration tracks acid excess after equivalence", () => { const state = calculateTitration(30); assert.equal(state.excess, "hydronium"); assert.ok(state.pH < 7); });
test("open circuit has no current", () => assert.equal(calculateCircuit(9, 3, false).current, 0));
test("Ohm's law responds to variables", () => assert.equal(calculateCircuit(12, 6, true).current, 2));
test("mean shifts farther than median for an outlier", () => { const near = statistics([4,5,6,6,7,8,13]); const far = statistics([4,5,6,6,7,8,20]); assert.ok(far.mean - near.mean > far.median - near.median); });
test("pendulum period grows with the square root of length", () => { assert.ok(Math.abs(approximatePeriod(4) / approximatePeriod(1) - 2) < 1e-10); });
test("undamped pendulum conserves energy in the validated solver", () => { const points = simulatePendulum({ length: 1.4, mass: 1.2, gravity: 9.81, damping: 0, initialAngleDeg: 40 }, 6); const energies = points.map(point => point.total); assert.ok((Math.max(...energies) - Math.min(...energies)) / energies[0] < .001); });
test("learned transition model closely forecasts one physical step", () => { const parameters = { length: 1.4, mass: 1, gravity: 9.81, damping: .03, initialAngleDeg: 40 }; const theta = .55; const omega = -1.2; const learned = learnedPendulumStep(theta, omega, parameters); const reference = stepPendulum(theta, omega, .04, parameters); assert.ok(Math.abs(learned.theta - reference.theta) < .012); assert.ok(Math.abs(learned.omega - reference.omega) < .04); assert.ok(pendulumModelInfo.validationScore > .99); });
