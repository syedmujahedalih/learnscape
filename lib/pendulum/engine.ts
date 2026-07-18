export type PendulumParameters = {
  length: number;
  mass: number;
  gravity: number;
  damping: number;
  initialAngleDeg: number;
  initialAngularVelocity?: number;
};

export type PendulumPoint = {
  time: number;
  theta: number;
  omega: number;
  x: number;
  y: number;
  speed: number;
  kinetic: number;
  potential: number;
  total: number;
};

const acceleration = (theta: number, omega: number, parameters: PendulumParameters) =>
  -(parameters.gravity / parameters.length) * Math.sin(theta) - parameters.damping * omega;

export function pendulumPoint(time: number, theta: number, omega: number, parameters: PendulumParameters): PendulumPoint {
  const x = parameters.length * Math.sin(theta);
  const y = -parameters.length * Math.cos(theta);
  const speed = Math.abs(parameters.length * omega);
  const kinetic = .5 * parameters.mass * speed * speed;
  const potential = parameters.mass * parameters.gravity * parameters.length * (1 - Math.cos(theta));
  return { time, theta, omega, x, y, speed, kinetic, potential, total: kinetic + potential };
}

export function stepPendulum(theta: number, omega: number, dt: number, parameters: PendulumParameters) {
  const a1 = acceleration(theta, omega, parameters);
  const t2 = theta + omega * dt / 2;
  const o2 = omega + a1 * dt / 2;
  const a2 = acceleration(t2, o2, parameters);
  const t3 = theta + o2 * dt / 2;
  const o3 = omega + a2 * dt / 2;
  const a3 = acceleration(t3, o3, parameters);
  const t4 = theta + o3 * dt;
  const o4 = omega + a3 * dt;
  const a4 = acceleration(t4, o4, parameters);
  return {
    theta: theta + dt * (omega + 2 * o2 + 2 * o3 + o4) / 6,
    omega: omega + dt * (a1 + 2 * a2 + 2 * a3 + a4) / 6,
  };
}

export function simulatePendulum(parameters: PendulumParameters, duration = 10, sampleStep = 1 / 60): PendulumPoint[] {
  let theta = parameters.initialAngleDeg * Math.PI / 180;
  let omega = parameters.initialAngularVelocity ?? 0;
  const points: PendulumPoint[] = [];
  const integrationStep = Math.min(sampleStep, 1 / 240);
  let nextSample = 0;
  for (let time = 0; time <= duration + integrationStep / 2; time += integrationStep) {
    if (time + integrationStep / 2 >= nextSample) {
      points.push(pendulumPoint(nextSample, theta, omega, parameters));
      nextSample += sampleStep;
    }
    ({ theta, omega } = stepPendulum(theta, omega, integrationStep, parameters));
  }
  return points;
}

export const approximatePeriod = (length: number, gravity = 9.81) => 2 * Math.PI * Math.sqrt(length / gravity);
