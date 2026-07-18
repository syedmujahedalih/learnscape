import { NextResponse } from "next/server";
import { blueprintSchema, type LearnscapeBlueprint } from "@/lib/blueprint/schema";
import { circuitBlueprint, statisticsBlueprint, titrationBlueprint } from "@/lib/blueprint/fixtures";

const system = `You classify a textbook excerpt for Learnscape. Return JSON only with templateId, title, and summary. templateId must be exactly acid_base_titration, ohms_law_circuit, statistics_explorer, or unsupported. Choose a validated template only when the excerpt clearly describes it. Statistics can be experimental.`;

function fallback(text: string) {
  const value = text.toLowerCase();
  if (/titr|ph|acid|base|neutraliz/.test(value)) return titrationBlueprint;
  if (/ohm|voltage|resistan|circuit|current/.test(value)) return circuitBlueprint;
  if (/mean|median|outlier|coin|probabil|distribution|standard deviation/.test(value)) return statisticsBlueprint;
  return {
    ...statisticsBlueprint, id: "unsupported-source", title: "New source blueprint", domain: "other" as const, validationStatus: "unsupported" as const,
    recommendedExperience: { templateId: "unsupported" as const, representation: "unsupported" as const, rationale: "Learnscape understood the source, but a validated interactive template for this concept is not available yet." },
  };
}

function cleanJson(text: string) { return JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")); }

export async function POST(request: Request) {
  const { text, provider = "llama" } = await request.json() as { text?: string; provider?: "llama" | "gpt" };
  if (!text?.trim()) return NextResponse.json({ error: "Add some pasted textbook text before analyzing." }, { status: 400 });
  const url = provider === "gpt" ? "https://api.openai.com/v1/chat/completions" : `${process.env.LLAMA_BASE_URL ?? "http://127.0.0.1:8080/v1"}/chat/completions`;
  const model = provider === "gpt" ? "gpt-5.6" : (process.env.LLAMA_MODEL ?? "Qwen3-14B-Q4_K_M.gguf");
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (provider === "gpt") {
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "GPT mode is ready but no OPENAI_API_KEY has been configured yet. Local Llama mode remains available." }, { status: 400 });
    headers.authorization = `Bearer ${process.env.OPENAI_API_KEY}`;
  }
  try {
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify({ model, temperature: 0.1, max_tokens: 220, response_format: { type: "json_object" }, chat_template_kwargs: { enable_thinking: false }, messages: [{ role: "system", content: system }, { role: "user", content: text.slice(0, 9000) }] }) });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const choice = cleanJson(body.choices?.[0]?.message?.content ?? "{}");
    const selected = choice.templateId === "acid_base_titration" ? titrationBlueprint : choice.templateId === "ohms_law_circuit" ? circuitBlueprint : choice.templateId === "statistics_explorer" ? statisticsBlueprint : fallback(text);
    const blueprint: LearnscapeBlueprint = { ...selected, id: `analysis-${Date.now()}`, title: typeof choice.title === "string" && choice.title.length < 80 ? choice.title : selected.title, source: { sourceType: "manual", extractedText: text, summary: typeof choice.summary === "string" ? choice.summary : `Learnscape extracted a supported concept from the supplied source.`, relevantExcerpts: [{ text: text.slice(0, 280), conceptIds: selected.concepts.map(c => c.id) }] } };
    return NextResponse.json({ blueprint: blueprintSchema.parse(blueprint), provider });
  } catch (error) {
    return NextResponse.json({ blueprint: blueprintSchema.parse({ ...fallback(text), id: `fallback-${Date.now()}`, source: { sourceType: "manual", extractedText: text, summary: "Local model response was unavailable, so Learnscape used its deterministic classifier.", relevantExcerpts: [{ text: text.slice(0, 280), conceptIds: fallback(text).concepts.map(c => c.id) }] } }), provider: "deterministic", warning: error instanceof Error ? error.message : "Analysis fallback used" });
  }
}
