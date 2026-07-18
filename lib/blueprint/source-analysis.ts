import { z } from "zod";
import type { LearnscapeBlueprint } from "./schema";

export const sourceAnalysisSchema = z.object({
  templateId: z.enum(["pendulum_world", "acid_base_titration", "ohms_law_circuit", "statistics_explorer", "unsupported"]),
  title: z.string().min(1).max(80),
  summary: z.string().min(1).max(320),
  causalQuestion: z.string().min(1).max(180),
  primaryCause: z.string().min(1).max(80),
  primaryEffect: z.string().min(1).max(80),
  misconception: z.string().min(1).max(180),
  whyInteractive: z.string().min(1).max(220),
});

export type SourceAnalysis = z.infer<typeof sourceAnalysisSchema>;
export type AnalysisProvider = "gpt" | "llama" | "deterministic";
export type AnalysisMeta = SourceAnalysis & { provider: AnalysisProvider; live: boolean; model: string };

export const sourceAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    templateId: { type: "string", enum: ["pendulum_world", "acid_base_titration", "ohms_law_circuit", "statistics_explorer", "unsupported"] },
    title: { type: "string" },
    summary: { type: "string" },
    causalQuestion: { type: "string" },
    primaryCause: { type: "string" },
    primaryEffect: { type: "string" },
    misconception: { type: "string" },
    whyInteractive: { type: "string" },
  },
  required: ["templateId", "title", "summary", "causalQuestion", "primaryCause", "primaryEffect", "misconception", "whyInteractive"],
} as const;

export function deterministicSourceAnalysis(text: string): SourceAnalysis {
  const value = text.toLowerCase();
  if (/pendul|bob|period|swing|potential energy|kinetic energy/.test(value)) return {
    templateId: "pendulum_world",
    title: "The Pendulum Observatory",
    summary: "Explore how length, mass, gravity, and energy shape a pendulum’s motion.",
    causalQuestion: "What actually changes the time a pendulum takes to complete a swing?",
    primaryCause: "pendulum length",
    primaryEffect: "swing period",
    misconception: "A heavier bob must swing faster.",
    whyInteractive: "Comparing two bobs makes the non-effect of mass and the effect of length visible in seconds.",
  };
  if (/titr|ph|acid|base|neutraliz/.test(value)) return {
    templateId: "acid_base_titration",
    title: "Acid–Base Titration",
    summary: "Reveal the sharp chemical transition that appears near the equivalence point.",
    causalQuestion: "How does added titrant volume change pH near equivalence?",
    primaryCause: "acid volume added",
    primaryEffect: "solution pH",
    misconception: "pH changes at a steady rate throughout a titration.",
    whyInteractive: "A live burette and curve connect each added drop to the sudden change in pH.",
  };
  if (/ohm|voltage|resistan|circuit|current/.test(value)) return {
    templateId: "ohms_law_circuit",
    title: "Ohm’s Law Circuit Lab",
    summary: "Test how voltage and resistance combine to determine current in a closed circuit.",
    causalQuestion: "How do voltage and resistance jointly determine current?",
    primaryCause: "voltage and resistance",
    primaryEffect: "electric current",
    misconception: "Higher voltage always means higher current, regardless of resistance.",
    whyInteractive: "Changing one electrical quantity at a time exposes the ratio behind I = V/R.",
  };
  if (/mean|median|outlier|coin|probabil|distribution|standard deviation/.test(value)) return {
    templateId: "statistics_explorer",
    title: "Outliers & Center",
    summary: "Move an outlier and compare how the mean and median respond.",
    causalQuestion: "Which measure of center is more sensitive to an extreme value?",
    primaryCause: "outlier position",
    primaryEffect: "mean and median",
    misconception: "Mean and median respond equally to extreme values.",
    whyInteractive: "Dragging one point makes robustness visible instead of leaving it as a memorized rule.",
  };
  return {
    templateId: "unsupported",
    title: "New source blueprint",
    summary: "The source can be mapped, but Learnscape does not yet have a validated world for this concept.",
    causalQuestion: "Which relationship should a learner be able to predict and test?",
    primaryCause: "source variable",
    primaryEffect: "observable outcome",
    misconception: "No validated misconception pattern is available yet.",
    whyInteractive: "A new world should only be generated after its educational and scientific constraints are validated.",
  };
}

export function analysisFromBlueprint(blueprint: LearnscapeBlueprint): SourceAnalysis {
  const causeId = blueprint.relationships[0]?.cause;
  const effectId = blueprint.relationships[0]?.effect;
  const cause = blueprint.variables.find(variable => variable.id === causeId)?.name ?? blueprint.variables[0]?.name ?? "input variable";
  const effect = blueprint.variables.find(variable => variable.id === effectId)?.name ?? blueprint.concepts[0]?.name ?? "observable outcome";
  return {
    templateId: blueprint.recommendedExperience.templateId,
    title: blueprint.title,
    summary: blueprint.source.summary,
    causalQuestion: `How does ${cause.toLowerCase()} change ${effect.toLowerCase()}?`,
    primaryCause: cause,
    primaryEffect: effect,
    misconception: blueprint.commonMisconceptions[0] ?? "The visual representation is the same as the underlying system.",
    whyInteractive: blueprint.recommendedExperience.rationale,
  };
}
