import { NextResponse } from "next/server";
import { blueprintSchema, type LearnscapeBlueprint } from "@/lib/blueprint/schema";
import { circuitBlueprint, pendulumBlueprint, statisticsBlueprint, titrationBlueprint } from "@/lib/blueprint/fixtures";
import { deterministicSourceAnalysis, sourceAnalysisJsonSchema, sourceAnalysisSchema, type AnalysisMeta, type SourceAnalysis } from "@/lib/blueprint/source-analysis";

const system = `You are Learnscape's pedagogical source mapper. Convert the supplied course material into one concise, source-grounded causal learning experience. Identify the relationship a student should predict, the most plausible misconception worth testing, and why interaction adds value. Route only clear matches to these validated labs: pendulum_world for pendulum motion; ohms_law_circuit for Ohm's law, voltage, current, or resistance; acid_base_titration for acid-base titration; statistics_explorer for mean, median, or outliers. Route every other topic to concept_studio. concept_studio is an interactive causal map, not a numerical simulation; never claim it is experimentally validated. Do not invent claims beyond the supplied source. sourceExcerpt must be a faithful transcription or quotation from the source and no longer than 500 characters. Keep primaryCause and primaryEffect to short noun phrases under 60 characters. Keep whyInteractive to one concrete sentence under 180 characters.`;

function readableAnalysisError(error: unknown) {
  if (error instanceof SyntaxError || (error instanceof Error && error.name === "ZodError")) {
    return "GPT read the source but could not finish a usable lesson outline. Try creating the world again.";
  }
  return error instanceof Error ? error.message.replace("; showing the deterministic demo replay.", ".") : "The source could not be read.";
}

function conceptStudioBlueprint(analysis: SourceAnalysis): LearnscapeBlueprint {
  return {
    ...pendulumBlueprint,
    id: "concept-studio",
    title: analysis.title,
    domain: "other" as const,
    concepts: [{ id: "source-concept", name: analysis.title, explanation: analysis.summary, importance: "primary" as const }],
    variables: [
      { id: "cause", name: analysis.primaryCause, description: "The source-grounded input or condition to vary.", manipulable: true },
      { id: "effect", name: analysis.primaryEffect, description: "The outcome a learner should observe.", manipulable: false },
    ],
    equations: [],
    relationships: [{ cause: "cause", effect: "effect", relationship: "depends_on", explanation: analysis.causalQuestion }],
    learningObjectives: [`Use evidence to explain how ${analysis.primaryCause.toLowerCase()} relates to ${analysis.primaryEffect.toLowerCase()}.`],
    commonMisconceptions: [analysis.misconception],
    recommendedExperience: { templateId: "concept_studio" as const, representation: "concept_studio" as const, rationale: analysis.whyInteractive },
    assumptions: ["This is a source-grounded thinking activity, not a scientific simulation."],
    limitations: ["A subject-specific lab is needed before Learnscape can make quantitative claims or predict numerical outcomes."],
    validationStatus: "experimental_preview" as const,
  };
}

function cleanJson(text: string) { return JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")); }

function templateFor(analysis: SourceAnalysis): LearnscapeBlueprint {
  if (analysis.templateId === "pendulum_world") return pendulumBlueprint;
  if (analysis.templateId === "ohms_law_circuit") return circuitBlueprint;
  if (analysis.templateId === "acid_base_titration") return titrationBlueprint;
  if (analysis.templateId === "statistics_explorer") return statisticsBlueprint;
  return conceptStudioBlueprint(analysis);
}

function outputText(body: unknown) {
  if (!body || typeof body !== "object") return "";
  const response = body as { output_text?: unknown; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (typeof response.output_text === "string") return response.output_text;
  return response.output?.flatMap(item => item.content ?? []).find(item => item.type === "output_text")?.text ?? "";
}

async function analyzeWithGpt(text: string, image: string | undefined, pdf: string | undefined, apiKey?: string) {
  const model = process.env.OPENAI_MODEL ?? "gpt-5.6-terra";
  if (!apiKey) throw new Error("No OpenAI API key is configured. Add one in Model settings or configure the site demo key.");
  const content: Array<{ type: "input_text"; text: string } | { type: "input_image"; image_url: string; detail: "high" } | { type: "input_file"; file_data: string; filename: string }> = [
    { type: "input_text", text: text.trim() ? `Analyze this confirmed source text:\n\n${text.slice(0, 9000)}` : "Read the supplied course material. Extract the exact passage relevant to the core concept, then create the structured learning blueprint." },
  ];
  if (image) content.push({ type: "input_image", image_url: image, detail: "high" });
  if (pdf) content.push({ type: "input_file", file_data: pdf, filename: "learnscape-source.pdf" });
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      instructions: system,
      input: [{ role: "user", content }],
      reasoning: { effort: "none" },
      max_output_tokens: 550,
      text: { format: { type: "json_schema", name: "learnscape_source_analysis", strict: true, schema: sourceAnalysisJsonSchema } },
    }),
  });
  if (!response.ok) {
    const failure = await response.json().catch(() => null) as { error?: { message?: unknown } } | null;
    const detail = typeof failure?.error?.message === "string" ? failure.error.message : "The API did not provide a reason.";
    throw new Error(`GPT returned ${response.status}: ${detail}`);
  }
  const body = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number } };
  const analysis = sourceAnalysisSchema.parse(cleanJson(outputText(body)));
  return { analysis, model, usage: body.usage };
}

async function analyzeWithLlama(text: string, baseUrl?: string, configuredModel?: string, apiKey?: string) {
  const model = configuredModel || process.env.LLAMA_MODEL || "Qwen3-14B-Q4_K_M.gguf";
  const endpoint = baseUrl || process.env.LLAMA_BASE_URL || "http://127.0.0.1:8080/v1";
  const response = await fetch(`${endpoint.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" },
      chat_template_kwargs: { enable_thinking: false },
      messages: [{ role: "system", content: `${system} Return JSON with exactly these keys: templateId, title, summary, sourceExcerpt, causalQuestion, primaryCause, primaryEffect, misconception, whyInteractive.` }, { role: "user", content: text.slice(0, 9000) }],
    }),
  });
  if (!response.ok) throw new Error(`Local model returned ${response.status}; showing the deterministic demo replay.`);
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const analysis = sourceAnalysisSchema.parse(cleanJson(body.choices?.[0]?.message?.content ?? "{}"));
  return { analysis, model };
}

export async function POST(request: Request) {
  const { text = "", image, pdf, provider = "llama" } = await request.json() as { text?: string; image?: string; pdf?: string; provider?: "llama" | "gpt" };
  const openaiApiKey = request.headers.get("x-learnscape-openai-key")?.trim() || process.env.OPENAI_API_KEY;
  const llamaBaseUrl = request.headers.get("x-learnscape-llama-base-url")?.trim();
  const llamaModel = request.headers.get("x-learnscape-llama-model")?.trim();
  const llamaApiKey = request.headers.get("x-learnscape-llama-key")?.trim();
  if (!text.trim() && !image && !pdf) return NextResponse.json({ error: "Choose course material or paste an excerpt before creating the world." }, { status: 400 });
  if (image && pdf) return NextResponse.json({ error: "Choose one image or one PDF for each world." }, { status: 400 });
  if (image && !/^data:image\/(?:png|jpeg|webp);base64,/i.test(image)) return NextResponse.json({ error: "Upload a PNG, JPEG, or WebP textbook page." }, { status: 400 });
  if (image && image.length > 6_000_000) return NextResponse.json({ error: "That page is too large. Choose an image under 4 MB." }, { status: 413 });
  if (pdf && !/^data:application\/pdf;base64,/i.test(pdf)) return NextResponse.json({ error: "Upload a PDF document." }, { status: 400 });
  if (pdf && pdf.length > 17_000_000) return NextResponse.json({ error: "That PDF is too large. Keep it under 12 MB." }, { status: 413 });
  if (image && provider !== "gpt") return NextResponse.json({ error: "Page images require GPT vision. Pasted text can still use your local model." }, { status: 400 });
  if (pdf && provider !== "gpt") return NextResponse.json({ error: "PDFs use GPT so Learnscape can read all pages together. Pasted text can still use your local model." }, { status: 400 });
  try {
    const result = provider === "gpt" ? await analyzeWithGpt(text, image, pdf, openaiApiKey) : await analyzeWithLlama(text, llamaBaseUrl, llamaModel, llamaApiKey);
    const selected = templateFor(result.analysis);
    const extractedText = text.trim() || result.analysis.sourceExcerpt;
    const blueprint: LearnscapeBlueprint = { ...selected, id: `analysis-${Date.now()}`, title: result.analysis.title, source: { sourceType: pdf ? "pdf" : image ? "image" : "manual", extractedText, summary: result.analysis.summary, relevantExcerpts: [{ text: result.analysis.sourceExcerpt, conceptIds: selected.concepts.map(c => c.id) }] } };
    const analysis: AnalysisMeta = { ...result.analysis, provider, live: true, model: result.model };
    return NextResponse.json({ blueprint: blueprintSchema.parse(blueprint), analysis, usage: "usage" in result ? result.usage : undefined });
  } catch (error) {
    if (image || pdf) return NextResponse.json({ error: readableAnalysisError(error) }, { status: 503 });
    const mapped = deterministicSourceAnalysis(text);
    const selected = templateFor(mapped);
    const blueprint = { ...selected, id: `fallback-${Date.now()}`, title: mapped.title, source: { sourceType: "manual" as const, extractedText: text, summary: mapped.summary, relevantExcerpts: [{ text: text.slice(0, 280), conceptIds: selected.concepts.map(c => c.id) }] } };
    const analysis: AnalysisMeta = { ...mapped, provider: "deterministic", live: false, model: "Learnscape ruleset v1" };
    return NextResponse.json({ blueprint: blueprintSchema.parse(blueprint), analysis, warning: error instanceof Error ? error.message : "Analysis fallback used" });
  }
}
