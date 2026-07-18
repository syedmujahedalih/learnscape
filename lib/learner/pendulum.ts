export type PendulumBeliefId = "mass_period" | "energy_location" | "length_period" | "ready";

export type PendulumBeliefs = Record<PendulumBeliefId, number>;

export type PendulumLearnerEvidence = {
  prediction: string;
  confidence: number;
  experimentCompleted: boolean;
  reflection: string;
  explanation: string;
  transferChoice: string;
};

export type AdaptiveExperiment = {
  id: "compare_mass" | "compare_length" | "trace_energy";
  target: PendulumBeliefId;
  title: string;
  prompt: string;
  setup: string;
  expectedLearningGain: number;
};

const prior: PendulumBeliefs = { mass_period: .25, energy_location: .2, length_period: .2, ready: .35 };

const normalize = (values: PendulumBeliefs): PendulumBeliefs => {
  const total = Object.values(values).reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value / total])) as PendulumBeliefs;
};

const update = (beliefs: PendulumBeliefs, likelihood: PendulumBeliefs, strength = 1) => normalize({
  mass_period: beliefs.mass_period * Math.pow(likelihood.mass_period, strength),
  energy_location: beliefs.energy_location * Math.pow(likelihood.energy_location, strength),
  length_period: beliefs.length_period * Math.pow(likelihood.length_period, strength),
  ready: beliefs.ready * Math.pow(likelihood.ready, strength),
});

const entropy = (beliefs: PendulumBeliefs) => -Object.values(beliefs).reduce((sum, probability) => probability > 0 ? sum + probability * Math.log2(probability) : sum, 0);

const experimentDefinitions = [
  { id: "compare_mass" as const, target: "mass_period" as const, title: "Test whether mass changes the swing time", prompt: "Keep length and release angle fixed. Compare a 1 kg bob with a 3 kg bob.", setup: "1.4 m cord · 40° release · 3.0 kg test bob", signal: { mass_period: .92, energy_location: .32, length_period: .28, ready: .12 } },
  { id: "compare_length" as const, target: "length_period" as const, title: "Test what actually controls the period", prompt: "Keep mass and release angle fixed. Stretch the cord and compare the swing time.", setup: "2.2 m cord · 40° release · 1.0 kg bob", signal: { mass_period: .25, energy_location: .28, length_period: .92, ready: .14 } },
  { id: "trace_energy" as const, target: "energy_location" as const, title: "Follow energy through one complete swing", prompt: "Release from a high angle and watch where potential and kinetic energy peak.", setup: "1.4 m cord · 60° release · energy trace", signal: { mass_period: .25, energy_location: .92, length_period: .27, ready: .14 } },
];

const informationGain = (beliefs: PendulumBeliefs, signal: PendulumBeliefs) => {
  const keys = Object.keys(beliefs) as PendulumBeliefId[];
  const positiveProbability = keys.reduce((sum, key) => sum + beliefs[key] * signal[key], 0);
  const positive = normalize(Object.fromEntries(keys.map(key => [key, beliefs[key] * signal[key]])) as PendulumBeliefs);
  const negative = normalize(Object.fromEntries(keys.map(key => [key, beliefs[key] * (1 - signal[key])])) as PendulumBeliefs);
  return Math.max(0, entropy(beliefs) - positiveProbability * entropy(positive) - (1 - positiveProbability) * entropy(negative));
};

export function inferPendulumBeliefs(evidence: PendulumLearnerEvidence): PendulumBeliefs {
  let beliefs = prior;
  if (evidence.prediction) {
    const correct = evidence.prediction === "The period stays nearly the same";
    const confidenceStrength = .65 + evidence.confidence / 100;
    beliefs = update(beliefs, correct
      ? { mass_period: .12, energy_location: .45, length_period: .5, ready: .88 }
      : { mass_period: .92, energy_location: .38, length_period: .42, ready: .08 }, confidenceStrength);
  }
  if (evidence.experimentCompleted) {
    beliefs = update(beliefs, evidence.reflection === "revised"
      ? { mass_period: .2, energy_location: .62, length_period: .65, ready: .9 }
      : { mass_period: .72, energy_location: .62, length_period: .65, ready: .48 }, .8);
  }
  const explanation = evidence.explanation.toLowerCase();
  if (explanation.includes("mass") && explanation.includes("period")) {
    const recognizesIndependence = /not|doesn|same|independent|unchanged/.test(explanation);
    beliefs = update(beliefs, recognizesIndependence
      ? { mass_period: .12, energy_location: .7, length_period: .7, ready: .94 }
      : { mass_period: .82, energy_location: .65, length_period: .65, ready: .28 }, .65);
  }
  if (evidence.transferChoice) {
    beliefs = update(beliefs, evidence.transferChoice === "lengthen the cord"
      ? { mass_period: .38, energy_location: .55, length_period: .18, ready: .94 }
      : { mass_period: .62, energy_location: .58, length_period: .9, ready: .18 }, .9);
  }
  return beliefs;
}

export function choosePendulumExperiment(beliefs: PendulumBeliefs): AdaptiveExperiment {
  return experimentDefinitions.map(experiment => {
    const diagnosticGain = informationGain(beliefs, experiment.signal);
    const misconceptionWeight = beliefs[experiment.target];
    const expectedLearningGain = diagnosticGain * .45 + misconceptionWeight * .55;
    return { ...experiment, expectedLearningGain };
  }).sort((a, b) => b.expectedLearningGain - a.expectedLearningGain)[0];
}

export function getPendulumExperiment(id: AdaptiveExperiment["id"]): AdaptiveExperiment {
  const experiment = experimentDefinitions.find(item => item.id === id);
  if (!experiment) throw new Error(`Unknown pendulum experiment: ${id}`);
  return { id: experiment.id, target: experiment.target, title: experiment.title, prompt: experiment.prompt, setup: experiment.setup, expectedLearningGain: 0 };
}

export const pendulumBeliefLabels: Record<PendulumBeliefId, string> = {
  mass_period: "Mass changes swing time",
  energy_location: "Energy peaks in the wrong place",
  length_period: "Length does not control period",
  ready: "Ready to transfer",
};
