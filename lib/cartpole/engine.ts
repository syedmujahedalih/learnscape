export type CartPoleState = {
  x: number;
  xVelocity: number;
  angle: number;
  angularVelocity: number;
};

export type CartPoleParameters = {
  gravity: number;
  cartMass: number;
  poleMass: number;
  halfLength: number;
  forceMagnitude: number;
  cartFriction: number;
};

export const nominalCartPole: CartPoleParameters = {
  gravity: 9.81,
  cartMass: 1,
  poleMass: .1,
  halfLength: .5,
  forceMagnitude: 10,
  cartFriction: 0,
};

export const cartPoleStart = (): CartPoleState => ({
  x: 0,
  xVelocity: 0,
  angle: 14 * Math.PI / 180,
  angularVelocity: .42,
});

export function wrapAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function stepCartPole(
  state: CartPoleState,
  action: -1 | 0 | 1,
  parameters: CartPoleParameters = nominalCartPole,
  dt = .04,
): CartPoleState {
  const totalMass = parameters.cartMass + parameters.poleMass;
  const poleMassLength = parameters.poleMass * parameters.halfLength;
  const sin = Math.sin(state.angle);
  const cos = Math.cos(state.angle);
  const friction = parameters.cartFriction * state.xVelocity;
  const force = action * parameters.forceMagnitude - friction;
  const temp = (force + poleMassLength * state.angularVelocity ** 2 * sin) / totalMass;
  const angularAcceleration = (parameters.gravity * sin - cos * temp)
    / (parameters.halfLength * (4 / 3 - parameters.poleMass * cos ** 2 / totalMass));
  const xAcceleration = temp - poleMassLength * angularAcceleration * cos / totalMass;
  const xVelocity = state.xVelocity + dt * xAcceleration;
  const angularVelocity = state.angularVelocity + dt * angularAcceleration;
  return {
    x: state.x + dt * xVelocity,
    xVelocity,
    angle: wrapAngle(state.angle + dt * angularVelocity),
    angularVelocity,
  };
}

export function cartPoleScore(state: CartPoleState) {
  const anglePenalty = Math.abs(wrapAngle(state.angle)) / (Math.PI / 2);
  const positionPenalty = Math.abs(state.x) / 2.4;
  return Math.max(0, Math.round(100 * (1 - .78 * anglePenalty - .22 * positionPenalty)));
}

export function isRecovered(state: CartPoleState) {
  return Math.abs(wrapAngle(state.angle)) < 7 * Math.PI / 180
    && Math.abs(state.angularVelocity) < .7
    && Math.abs(state.x) < 1.8;
}
