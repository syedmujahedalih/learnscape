import { pendulumPoint, type PendulumParameters, type PendulumPoint } from "./engine.ts";
import { pendulumModelWeights } from "./model-weights.ts";

const dense = (input: number[], weights: readonly (readonly number[])[], bias: readonly number[], activate: boolean) =>
  bias.map((offset, outputIndex) => {
    const value = input.reduce((sum, item, inputIndex) => sum + item * weights[inputIndex][outputIndex], offset);
    return activate ? Math.tanh(value) : value;
  });

export function learnedPendulumStep(theta: number, omega: number, parameters: PendulumParameters) {
  let values = [
    Math.sin(theta), Math.cos(theta), omega / 5,
    (parameters.length - 1.5) / .85,
    (parameters.gravity - 8) / 4,
    (parameters.damping - .065) / .065,
  ];
  pendulumModelWeights.coefs.forEach((weights, index) => {
    values = dense(values, weights, pendulumModelWeights.intercepts[index], index < pendulumModelWeights.coefs.length - 1);
  });
  return { theta: theta + values[0] * .22, omega: omega + values[1] * 1.6 };
}

export function forecastPendulum(parameters: PendulumParameters, duration = 8): PendulumPoint[] {
  let theta = parameters.initialAngleDeg * Math.PI / 180;
  let omega = parameters.initialAngularVelocity ?? 0;
  const points: PendulumPoint[] = [];
  for (let time = 0; time <= duration; time += pendulumModelWeights.dt) {
    points.push(pendulumPoint(time, theta, omega, parameters));
    ({ theta, omega } = learnedPendulumStep(theta, omega, parameters));
  }
  return points;
}

export const pendulumModelInfo = {
  parameters: pendulumModelWeights.coefs.reduce((total, layer) => total + layer.length * layer[0].length, 0) + pendulumModelWeights.intercepts.reduce((total, layer) => total + layer.length, 0),
  validationScore: pendulumModelWeights.validationScore,
};
