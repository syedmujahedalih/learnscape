import { z } from "zod";

export const blueprintSchema = z.object({
  id: z.string(),
  title: z.string(),
  domain: z.enum(["chemistry", "physics", "statistics", "probability", "biology", "mathematics", "computer_science", "other"]),
  source: z.object({ sourceType: z.enum(["image", "pdf", "sample", "manual"]), extractedText: z.string().optional(), summary: z.string(), relevantExcerpts: z.array(z.object({ text: z.string(), conceptIds: z.array(z.string()) })) }),
  concepts: z.array(z.object({ id: z.string(), name: z.string(), explanation: z.string(), importance: z.enum(["primary", "supporting"]) })),
  variables: z.array(z.object({ id: z.string(), name: z.string(), symbol: z.string().optional(), unit: z.string().optional(), description: z.string(), manipulable: z.boolean() })),
  equations: z.array(z.object({ id: z.string(), latex: z.string(), plainLanguage: z.string(), variableIds: z.array(z.string()) })),
  relationships: z.array(z.object({ cause: z.string(), effect: z.string(), relationship: z.enum(["increases", "decreases", "balances", "conserves", "transforms", "depends_on"]), explanation: z.string() })),
  learningObjectives: z.array(z.string()),
  commonMisconceptions: z.array(z.string()),
  recommendedExperience: z.object({ templateId: z.enum(["pendulum_world", "acid_base_titration", "ohms_law_circuit", "statistics_explorer", "concept_studio", "unsupported"]), representation: z.enum(["3d_lab", "3d_world", "interactive_circuit", "2d_simulation", "graph", "probability_experiment", "timeline", "concept_studio", "unsupported"]), rationale: z.string() }),
  assumptions: z.array(z.string()), limitations: z.array(z.string()), validationStatus: z.enum(["template_validated", "experimental_preview", "unsupported"]),
});

export type LearnscapeBlueprint = z.infer<typeof blueprintSchema>;
