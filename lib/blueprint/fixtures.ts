import type { LearnscapeBlueprint } from "./schema";

const base = (id: string, title: string, domain: LearnscapeBlueprint["domain"], templateId: LearnscapeBlueprint["recommendedExperience"]["templateId"], representation: LearnscapeBlueprint["recommendedExperience"]["representation"], validationStatus: LearnscapeBlueprint["validationStatus"], concepts: LearnscapeBlueprint["concepts"], variables: LearnscapeBlueprint["variables"], equations: LearnscapeBlueprint["equations"]): LearnscapeBlueprint => ({
  id, title, domain, source: { sourceType: "sample", summary: "A deterministic Learnscape sample page used for the guided demo.", relevantExcerpts: concepts.map(c => ({ text: c.explanation, conceptIds: [c.id] })) }, concepts, variables, equations,
  relationships: variables.slice(0, 2).map((v, i) => ({ cause: v.id, effect: variables[(i + 1) % variables.length]?.id ?? v.id, relationship: "depends_on" as const, explanation: "The values change together in this simplified conceptual model." })),
  learningObjectives: concepts.map(c => `Explain how ${c.name.toLowerCase()} changes the system.`), commonMisconceptions: ["A diagram is not the system itself; it is a representation for reasoning."], recommendedExperience: { templateId, representation, rationale: "This representation makes the key causal relationship visible and manipulable." }, assumptions: ["This is a simplified conceptual model designed to make the relationship visible."], limitations: ["Not a laboratory-grade or fully general simulation."], validationStatus,
});

export const titrationBlueprint = base("sample-titration", "Acid–Base Titration", "chemistry", "acid_base_titration", "3d_lab", "template_validated", [
  { id: "neutralization", name: "Neutralization", explanation: "Hydronium and hydroxide react in a 1:1 relationship.", importance: "primary" },
  { id: "equivalence", name: "Equivalence point", explanation: "At equivalence, neither strong reactant remains in excess.", importance: "primary" },
], [{ id: "acid", name: "Hydrochloric acid added", symbol: "Vₐ", unit: "mL", description: "Titrant volume from the burette.", manipulable: true }, { id: "base", name: "Sodium hydroxide", symbol: "Vᵦ", unit: "mL", description: "Starting analyte volume.", manipulable: false }], [{ id: "moles", latex: "n = M × V", plainLanguage: "Moles equal molarity multiplied by volume.", variableIds: ["acid", "base"] }, { id: "ph", latex: "pH = −log₁₀[H₃O⁺]", plainLanguage: "pH reflects excess hydronium concentration.", variableIds: ["acid"] }]);

export const circuitBlueprint = base("sample-circuit", "Ohm’s Law Circuit Lab", "physics", "ohms_law_circuit", "interactive_circuit", "template_validated", [{ id: "current", name: "Current", explanation: "Current depends on voltage and resistance in a closed circuit.", importance: "primary" }, { id: "resistance", name: "Resistance", explanation: "Resistance opposes current.", importance: "primary" }], [{ id: "voltage", name: "Voltage", symbol: "V", unit: "V", description: "Potential difference supplied by the source.", manipulable: true }, { id: "resistance", name: "Resistance", symbol: "R", unit: "Ω", description: "Opposition to current.", manipulable: true }], [{ id: "ohm", latex: "I = V / R", plainLanguage: "Current equals voltage divided by resistance.", variableIds: ["voltage", "resistance"] }]);

export const statisticsBlueprint = base("sample-statistics", "Outliers & Center", "statistics", "statistics_explorer", "2d_simulation", "experimental_preview", [{ id: "mean", name: "Mean", explanation: "The mean balances every data value.", importance: "primary" }, { id: "median", name: "Median", explanation: "The median is the middle ordered value.", importance: "primary" }], [{ id: "outlier", name: "Outlier", unit: "value", description: "A point far from the rest of the data.", manipulable: true }], [{ id: "mean", latex: "x̄ = Σx / n", plainLanguage: "Mean is the total divided by the count.", variableIds: ["outlier"] }]);

export const pendulumBlueprint = base("sample-pendulum", "The Pendulum Observatory", "physics", "pendulum_world", "3d_world", "template_validated", [
  { id: "period", name: "Period", explanation: "For modest release angles, pendulum period depends primarily on length and gravity—not bob mass.", importance: "primary" },
  { id: "energy", name: "Energy transformation", explanation: "Gravitational potential energy becomes kinetic energy on the way down, then returns on the way up.", importance: "primary" },
  { id: "prediction", name: "Predictive dynamics", explanation: "A learned transition model forecasts the next state and is checked against a validated numerical solver.", importance: "supporting" },
], [
  { id: "length", name: "Pendulum length", symbol: "L", unit: "m", description: "Distance from pivot to the center of the bob.", manipulable: true },
  { id: "mass", name: "Bob mass", symbol: "m", unit: "kg", description: "Mass of the pendulum bob.", manipulable: true },
  { id: "angle", name: "Release angle", symbol: "θ₀", unit: "°", description: "Starting displacement from vertical.", manipulable: true },
], [
  { id: "period", latex: "T ≈ 2π√(L/g)", plainLanguage: "A longer pendulum takes more time to complete a swing.", variableIds: ["length"] },
  { id: "energy", latex: "E = ½mv² + mgh", plainLanguage: "Kinetic and potential energy trade places throughout the swing.", variableIds: ["mass", "angle"] },
]);

pendulumBlueprint.source.summary = "A pendulum transforms gravitational potential energy into kinetic energy. Its period depends on length and gravitational acceleration, while ideal bob mass does not change the period.";
pendulumBlueprint.source.relevantExcerpts = [{ text: "A longer pendulum has a longer period; increasing bob mass changes its energy but not its ideal period.", conceptIds: ["period", "energy"] }];
pendulumBlueprint.commonMisconceptions = ["A heavier bob swings faster.", "The pendulum moves fastest at the highest point.", "Energy disappears at the bottom of the swing."];
pendulumBlueprint.assumptions = ["Rigid massless cord, point-mass bob, uniform gravity, and configurable linear damping."];
pendulumBlueprint.limitations = ["The learned forecast is an educational transition model; the numerical solver remains the validated reference."];
pendulumBlueprint.recommendedExperience.rationale = "A spatial trajectory, live energy exchange, and ghost forecast make the hidden dynamics inspectable.";

export const sampleBlueprints = [pendulumBlueprint, titrationBlueprint, circuitBlueprint, statisticsBlueprint];
