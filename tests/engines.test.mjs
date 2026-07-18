import test from "node:test";
import assert from "node:assert/strict";
import { calculateTitration } from "../lib/titration/engine.ts";
import { calculateCircuit } from "../lib/circuit/engine.ts";
import { statistics } from "../lib/statistics/simulations.ts";

test("titration reaches pH 7 at equivalence", () => { const state = calculateTitration(25); assert.equal(state.equivalenceMl, 25); assert.equal(state.pH, 7); assert.equal(state.excess, "none"); });
test("titration tracks acid excess after equivalence", () => { const state = calculateTitration(30); assert.equal(state.excess, "hydronium"); assert.ok(state.pH < 7); });
test("open circuit has no current", () => assert.equal(calculateCircuit(9, 3, false).current, 0));
test("Ohm's law responds to variables", () => assert.equal(calculateCircuit(12, 6, true).current, 2));
test("mean shifts farther than median for an outlier", () => { const near = statistics([4,5,6,6,7,8,13]); const far = statistics([4,5,6,6,7,8,20]); assert.ok(far.mean - near.mean > far.median - near.median); });
