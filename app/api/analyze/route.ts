import { NextResponse } from "next/server";
import { blueprintSchema, type LearnscapeBlueprint } from "@/lib/blueprint/schema";
import { circuitBlueprint, pendulumBlueprint, statisticsBlueprint, titrationBlueprint } from "@/lib/blueprint/fixtures";
import { deterministicSourceAnalysis, sourceAnalysisJsonSchema, sourceAnalysisSchema, type AnalysisMeta, type SourceAnalysis } from "@/lib/blueprint/source-analysis";

const system = `You are Learnscape's pedagogical source mapper. Convert a STEM excerpt into a concise causal learning blueprint. Identify the relationship a student should predict, the most plausible misconception worth testing, and why interaction adds value. Choose a supported template only when the source clearly matches it. Do not invent equations or claims beyond the supplied source.`;

function fallback(text: string) {
  const templateId = deterministicSourceAnalysis(text).templateId;
  if (templateId === "pendulum_world") return pendulumBlueprint;
  if (templateId === "acid_base_titration") return titrationBlueprint;
  if (templateId === "ohms_law_circuit") return circuitBlueprint;
  if (templateId === "statistics_explorer") return statisticsBlueprint;
  return {
    ...statisticsBlueprint, id: "unsupported-source", title: "New source blueprint", domain: "other" as const, validationStatus: "unsupported" as const,
    recommendedExperience: { templateId: "unsupported" as const, representation: "unsupported" as const, rationale: "Learnscape understood the source, but a validated interactive template for this concept is not available yet." },
  };
}

function cleanJson(text: string) { return JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")); }

function templateFor(templateId: SourceAnalysis["templateId"], text: string) {
  if (templateId === "pendulum_world") return pendulumBlueprint;
  if (templateId === "acid_base_titration") return titrationBlueprint;
  if (templateId === "ohms_law_circuit") return circuitBlueprint;
  if (templateId === "statistics_explorer") return statisticsBlueprint;
  return fallback(text);
}

function outputText(body: unknown) {
  if (!body || typeof body !== "object") return "";
  const response = body as { output_text?: unknown; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (typeof response.output_text === "string") return response.output_text;
  return response.output?.flatMap(item => item.content ?? []).find(item => item.type === "output_text")?.text ?? "";
}

async function analyzeWithGpt(text: string) {
  const model = process.env.OPENAI_MODEL ?? "gpt-5.6-sol";
  if (!process.env.OPENAI_API_KEY) throw new Error("No OpenAI API key is configured; showing the deterministic demo replay.");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model,
      instructions: system,
      input: text.slice(0, 9000),
      max_output_tokens: 700,
      text: { format: { type: "json_schema", name: "learnscape_source_analysis", strict: true, schema: sourceAnalysisJsonSchema } },
    }),
  });
  if (!response.ok) throw new Error(`GPT returned ${response.status}; showing the deterministic demo replay.`);
  const analysis = sourceAnalysisSchema.parse(cleanJson(outputText(await response.json())));
  return { analysis, model };
}

async function analyzeWithLlama(text: string) {
  const model = process.env.LLAMA_MODEL ?? "Qwen3-14B-Q4_K_M.gguf";
  const response = await fetch(`${process.env.LLAMA_BASE_URL ?? "http://127.0.0.1:8080/v1"}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" },
      chat_template_kwargs: { enable_thinking: false },
      messages: [{ role: "system", content: `${system} Return JSON with exactly these keys: templateId, title, summary, causalQuestion, primaryCause, primaryEffect, misconception, whyInteractive.` }, { role: "user", content: text.slice(0, 9000) }],
    }),
  });
  if (!response.ok) throw new Error(`Local model returned ${response.status}; showing the deterministic demo replay.`);
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const analysis = sourceAnalysisSchema.parse(cleanJson(body.choices?.[0]?.message?.content ?? "{}"));
  return { analysis, model };
}

export async function POST(request: Request) {
  const { text, provider = "llama" } = await request.json() as { text?: string; provider?: "llama" | "gpt" };
  if (!text?.trim()) return NextResponse.json({ error: "Add some pasted textbook text before analyzing." }, { status: 400 });
  try {
    const result = provider === "gpt" ? await analyzeWithGpt(text) : await analyzeWithLlama(text);
    const selected = templateFor(result.analysis.templateId, text);
    const blueprint: LearnscapeBlueprint = { ...selected, id: `analysis-${Date.now()}`, title: result.analysis.title, source: { sourceType: "manual", extractedText: text, summary: result.analysis.summary, relevantExcerpts: [{ text: text.slice(0, 280), conceptIds: selected.concepts.map(c => c.id) }] } };
    const analysis: AnalysisMeta = { ...result.analysis, provider, live: true, model: result.model };
    return NextResponse.json({ blueprint: blueprintSchema.parse(blueprint), analysis });
  } catch (error) {
    const selected = fallback(text);
    const mapped = deterministicSourceAnalysis(text);
    const blueprint = { ...selected, id: `fallback-${Date.now()}`, title: mapped.title, source: { sourceType: "manual" as const, extractedText: text, summary: mapped.summary, relevantExcerpts: [{ text: text.slice(0, 280), conceptIds: selected.concepts.map(c => c.id) }] } };
    const analysis: AnalysisMeta = { ...mapped, provider: "deterministic", live: false, model: "Learnscape ruleset v1" };
    return NextResponse.json({ blueprint: blueprintSchema.parse(blueprint), analysis, warning: error instanceof Error ? error.message : "Analysis fallback used" });
  }
}
