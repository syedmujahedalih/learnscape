"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  benchmarkWorkload,
  defaultExperimentConfig,
  type BatchSize,
  type CacheSize,
  type Concurrency,
  type InferenceConfig,
  type Precision,
} from "@/lib/inference/experiment";
import type { CloudBenchmarkStatus } from "@/lib/inference/trace";

type View = "home" | "learn" | "playground" | "incident";
type Prediction = "clear" | "latency" | "oom" | "";
type CloudGpu = "T4" | "L4" | "A10";
type TelemetryEvent = "site_open" | "foundations_open" | "lesson_selected" | "experiment_planned" | "playground_open" | "playground_control_changed" | "incident_started" | "gpu_trace_completed";

type MeasuredResult = {
  ttftMs: number;
  p95Ms: number;
  throughput: number;
  vramGb: number;
  queueDepth: number;
  utilization: number;
  powerWatts: number;
  costPerMillion?: number;
  oom: boolean;
};

type ConceptLesson = {
  id: string;
  index: string;
  title: string;
  eyebrow: string;
  summary: string;
  definition: string;
  question: string;
  change: string;
  observe: string;
  takeaway: string;
};

const conceptLessons: ConceptLesson[] = [
  { id: "tail-latency", index: "01", title: "Tail latency", eyebrow: "START HERE · 3 MIN", summary: "Why averages hide the requests users remember.", definition: "P95 is the response time that 95% of requests finish within. Tail percentiles expose queueing and outliers that an average can hide.", question: "If a shared prompt is reused, which latency signal should move first?", change: "Enable prefix caching", observe: "TTFT and P95 latency", takeaway: "Prefix caching avoids repeated prefill work. Expect time to first token to improve before decode throughput changes." },
  { id: "batching", index: "02", title: "Continuous batching", eyebrow: "THROUGHPUT · 4 MIN", summary: "Keep the GPU fed without losing control of latency.", definition: "A scheduler groups work from active requests. More batching can raise throughput, but queueing and memory pressure can erase the gain.", question: "Does a larger batch clear more token demand for this workload?", change: "Increase batch 1 → 8", observe: "Throughput, queue depth, and P95", takeaway: "Batching is a workload-dependent tradeoff. Measure throughput and tail latency together instead of treating either one as the answer." },
  { id: "kv-cache", index: "03", title: "KV cache", eyebrow: "MEMORY · 4 MIN", summary: "Trade accelerator memory for decoding capacity.", definition: "The KV cache stores attention state for tokens already processed. It competes with model weights and runtime allocations for device memory.", question: "What loses headroom when the cache budget grows?", change: "Grow cache 6 GB → 14 GB", observe: "Peak VRAM and failed requests", takeaway: "Cache capacity is not free. Measure peak device memory under realistic sequence lengths and concurrency." },
  { id: "quantization", index: "04", title: "Quantization", eyebrow: "PRECISION · 4 MIN", summary: "Use fewer bits per weight to change memory and speed.", definition: "Quantization compresses model weights. It can reduce VRAM and improve throughput, while introducing a quality tradeoff that a performance trace alone cannot evaluate.", question: "Can four-bit weights create useful serving headroom?", change: "Switch FP16 → INT4", observe: "VRAM, throughput, latency, then quality separately", takeaway: "A faster trace does not prove acceptable model quality. Performance and evaluation belong in the same decision, but they are separate measurements." },
  { id: "concurrency", index: "05", title: "Concurrency", eyebrow: "SCHEDULING · 3 MIN", summary: "Control how many requests compete at once.", definition: "A concurrency cap limits active sequences. Too low can waste the GPU; too high can increase cache pressure and destabilize tail latency.", question: "How much concurrency keeps this workload moving without a queue spiral?", change: "Raise concurrency 4 → 12", observe: "GPU utilization, queue depth, P95, and VRAM", takeaway: "Concurrency should be tuned with batching, sequence length, and cache capacity, not in isolation." },
  { id: "speculative", index: "06", title: "Speculative decoding", eyebrow: "DECODING · 5 MIN", summary: "Draft tokens cheaply and verify them with the target model.", definition: "Speculative decoding can reduce time per accepted token when the draft path is accurate enough to justify verification overhead.", question: "Does speculation improve this model and workload on this hardware?", change: "Enable speculative decoding", observe: "Accepted tokens, throughput, P95, and power", takeaway: "The gain depends on acceptance rate, implementation, model pair, and workload. This is exactly why the experiment needs a real runtime." },
];

const gpuMemory = (gpu: CloudGpu) => gpu === "T4" ? 16 : 24;
const formatSeconds = (ms?: number) => ms === undefined ? "—" : `${(ms / 1000).toFixed(2)}s`;

const telemetryContext = () => {
  const width = window.innerWidth;
  const device = width < 700 ? "mobile" : width < 1100 ? "tablet" : "desktop";
  const campaign = new URLSearchParams(window.location.search).get("utm_source")?.toLowerCase() ?? "";
  const referrer = document.referrer.toLowerCase();
  const source = campaign.includes("linkedin") || referrer.includes("linkedin.com") ? "linkedin" : campaign === "x" || campaign.includes("twitter") || referrer.includes("t.co") || referrer.includes("twitter.com") ? "x" : campaign.includes("github") || referrer.includes("github.com") ? "github" : campaign || referrer ? "other" : "direct";
  return { device, source } as const;
};

const trackEvent = (event: TelemetryEvent, detail: { label?: string; value?: string } = {}) => {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return;
  try {
    let sessionId = sessionStorage.getItem("p99_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("p99_session_id", sessionId);
    }
    void fetch("/api/telemetry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId, event, ...telemetryContext(), ...detail }), keepalive: true }).catch(() => undefined);
  } catch {
    // Analytics must never interrupt a lab.
  }
};

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [cloudConfigured, setCloudConfigured] = useState(false);

  useEffect(() => {
    fetch("/api/benchmark").then(response => response.json()).then(data => setCloudConfigured(Boolean(data.configured))).catch(() => setCloudConfigured(false));
    if (!sessionStorage.getItem("p99_site_open_tracked")) {
      trackEvent("site_open");
      sessionStorage.setItem("p99_site_open_tracked", "1");
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const event = view === "learn" ? "foundations_open" : view === "playground" ? "playground_open" : view === "incident" ? "incident_started" : null;
    if (event) trackEvent(event);
  }, [view]);

  return <main className="infra-app">
    <header className="infra-nav">
      <button className="infra-brand" onClick={() => setView("home")} aria-label="P99 home"><span>P/</span>P99</button>
      <nav className="nav-center" aria-label="Primary navigation"><button className={view === "learn" ? "active" : ""} onClick={() => setView("learn")}>FOUNDATIONS</button><button className={view === "playground" ? "active" : ""} onClick={() => setView("playground")}>PLAYGROUND</button><button className={view === "incident" ? "active" : ""} onClick={() => setView("incident")}>INCIDENT LAB</button></nav>
      <div className="nav-actions"><span className="runtime-pill"><i/> MEASURED RUNS ONLY</span><button onClick={() => setView("incident")}>LAB 01</button></div>
    </header>

    {view === "home" && <Landing onLearn={() => setView("learn")} onPlay={() => setView("playground")} onIncident={() => setView("incident")} />}
    {view === "learn" && <Foundations onPlay={() => setView("playground")} onIncident={() => setView("incident")} />}
    {view === "playground" && <Playground cloudConfigured={cloudConfigured} onLearn={() => setView("learn")} onIncident={() => setView("incident")} />}
    {view === "incident" && <Incident cloudConfigured={cloudConfigured} onExit={() => setView("home")} />}
  </main>;
}

function Landing({ onLearn, onPlay, onIncident }: { onLearn: () => void; onPlay: () => void; onIncident: () => void }) {
  return <section className="infra-home">
    <div className="home-grid"><div className="home-copy"><div className="home-kicker"><span>THE HANDS-ON PLAYGROUND FOR</span> INFERENCE ENGINEERING</div><h1>Learn the stack.<br/><em>Measure what happens.</em></h1><p>Build intuition, design controlled experiments, and validate them on connected infrastructure. P99 does not invent benchmark results.</p><div className="home-actions"><button onClick={onLearn}>START WITH THE BASICS <span>→</span></button><button className="secondary-action" onClick={onPlay}>BUILD AN EXPERIMENT</button></div><div className="home-proof"><div><b>01</b><span>LEARN</span><small>Build the mental model</small></div><div><b>02</b><span>DESIGN</span><small>Change one variable</small></div><div><b>03</b><span>MEASURE</span><small>Use a real runtime</small></div><div><b>04</b><span>COMPARE</span><small>Inspect the trace</small></div></div></div><div className="home-console" aria-label="Illustrative inference incident"><div className="console-top"><span>ILLUSTRATIVE INCIDENT</span><b>NOT A BENCHMARK</b></div><div className="console-alert"><span>SYSTEM QUESTION</span><strong>?</strong><em>Which change would you test?</em></div><div className="console-chart"><div className="chart-target">MEASURED TRACE GOES HERE</div>{[18,22,20,34,31,45,68,57,82,74,92,86,96,89,94,91].map((height,index)=><i key={index} style={{height:`${height}%`}}/>)}</div><div className="console-pipeline"><span>REQUESTS</span><i>→</i><b>SCHEDULER</b><i>→</i><b>GPU</b><i>→</i><span>TOKENS</span></div><div className="console-rack"><div className="rack-chip"><small>ENVIRONMENT</small><strong>YOUR GPU</strong><span>local or cloud</span></div><div className="rack-memory"><span>RESULT POLICY</span><b>MEASURED ONLY</b><i><em/></i></div><div className="rack-log"><span>01</span> form a hypothesis<br/><span>02</span> change one variable<br/><span>03</span> capture a runtime trace<br/><b>▮</b></div></div></div></div>
    <div className="learning-routes"><div className="route-intro"><span>CHOOSE YOUR ENTRY POINT</span><h2>From “what is a token?”<br/>to “what should I measure?”</h2></div><button onClick={onLearn}><span>01 · GUIDED</span><b>Foundations</b><small>Learn the serving concepts and the signals that reveal them.</small><em>START LEARNING →</em></button><button onClick={onPlay}><span>02 · OPEN</span><b>Experiment builder</b><small>Create a reproducible inference test without fabricated output.</small><em>BUILD A SPEC →</em></button><button onClick={onIncident}><span>03 · MEASURED</span><b>Incident lab</b><small>Run only when connected compute can return a real trace.</small><em>OPEN LAB 01 →</em></button></div>
    <div className="mission-ticker"><span>FUTURE PATH</span><b>BRING YOUR OWN ENVIRONMENT → LEARN FROM REAL TRACES</b><i/> Local llama.cpp <i/> Workstation GPU <i/> Cloud runners <i/> Learned dynamics <button onClick={onIncident}>VIEW CURRENT LAB →</button></div>
  </section>;
}

function Foundations({ onPlay, onIncident }: { onPlay: () => void; onIncident: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const lesson = conceptLessons[activeIndex];
  const chooseLesson = (index: number) => { setActiveIndex(index); setRevealed(false); trackEvent("lesson_selected", { label: conceptLessons[index].id }); };
  const nextLesson = () => { if (activeIndex < conceptLessons.length - 1) chooseLesson(activeIndex + 1); else onPlay(); };
  return <section className="learn-view">
    <div className="learn-head"><div><span>GUIDED PATH · FOUNDATIONS</span><h1>Build the mental model.</h1><p>Learn what a serving change means before you spend compute measuring it.</p></div><div className="course-progress"><span>{activeIndex + 1} / {conceptLessons.length} LABS</span><i><em style={{ width: `${((activeIndex + 1) / conceptLessons.length) * 100}%` }}/></i></div></div>
    <div className="learn-shell">
      <aside className="lesson-list">{conceptLessons.map((item, index) => <button key={item.id} className={index === activeIndex ? "active" : ""} onClick={() => chooseLesson(index)}><span>{item.index}</span><div><b>{item.title}</b><small>{item.summary}</small></div><i>→</i></button>)}</aside>
      <article className="lesson-stage">
        <div className="lesson-copy"><span>{lesson.eyebrow}</span><h2>{lesson.title}</h2><p>{lesson.definition}</p><div className="lesson-question"><small>PREDICT BEFORE YOU MEASURE</small><b>{lesson.question}</b></div></div>
        <div className="concept-system"><div className="concept-top"><span>CONTROLLED EXPERIMENT</span><b>{lesson.change}</b><i>PLAN ONLY</i></div><div className="concept-pipeline"><span>BASELINE</span><i>→</i><b>ONE CHANGE</b><i>→</i><b>REAL RUN</b><i>→</i><span>COMPARE</span></div><div className="concept-metrics"><ExperimentField label="KEEP CONSTANT" value="Model, hardware, prompts"/><ExperimentField label="CHANGE" value={lesson.change}/><ExperimentField label="OBSERVE" value={lesson.observe}/><ExperimentField label="RESULT" value="Recorded by runtime"/></div><div className="queue-viz"><span>RULE</span><div><i className="filled"/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><b>Change one variable</b></div></div>
        {!revealed ? <button className="run-concept" onClick={() => { setRevealed(true); trackEvent("experiment_planned", { label: lesson.id }); }}><span>REVEAL THE EXPERIMENT LOGIC</span><b>{lesson.change}</b><i>→</i></button> : <div className="concept-result"><span>WHAT TO EXPECT, NOT A PREDICTION</span><p>{lesson.takeaway}</p><div><button onClick={() => setRevealed(false)}>REVIEW</button><button onClick={nextLesson}>{activeIndex === conceptLessons.length - 1 ? "BUILD YOUR OWN EXPERIMENT →" : "NEXT CONCEPT →"}</button></div></div>}
      </article>
    </div>
    <div className="learn-footer"><span>READY TO DESIGN A RUN?</span><button onClick={onPlay}>OPEN PLAYGROUND</button><button onClick={onIncident}>OPEN MEASURED LAB →</button></div>
  </section>;
}

function ExperimentField({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong><small>experiment plan</small></div>;
}

function Playground({ cloudConfigured, onLearn, onIncident }: { cloudConfigured: boolean; onLearn: () => void; onIncident: () => void }) {
  const [config, setConfig] = useState<InferenceConfig>({ ...defaultExperimentConfig, precision: "INT8", batchSize: 8 });
  const [copied, setCopied] = useState(false);
  const update = <K extends keyof InferenceConfig>(key: K, value: InferenceConfig[K]) => { setConfig(current => ({ ...current, [key]: value })); setCopied(false); trackEvent("playground_control_changed", { label: String(key), value: String(value) }); };
  const copySpec = async () => {
    const spec = { workload: benchmarkWorkload, config, compareAgainst: "same workload, same model, same hardware" };
    await navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setCopied(true);
    trackEvent("experiment_planned", { label: "custom" });
  };
  return <section className="play-view">
    <div className="play-head"><div><span>EXPERIMENT PLAYGROUND</span><h1>Change one variable.<br/><em>Measure it somewhere real.</em></h1><p>Build a reproducible test plan. P99 shows no performance result until a connected runtime returns a trace.</p></div><div className="model-badge"><span>CURRENT PRODUCT BOUNDARY</span><b>NO SYNTHETIC BENCHMARKS</b><small>Curriculum + experiment specification + measured traces</small></div></div>
    <div className="play-shell">
      <aside className="play-controls"><div className="panel-index">01 / CONFIGURE</div><h2>Your serving experiment</h2><Control label="WEIGHT PRECISION" hint="memory ↔ quality"><Segment values={["FP16", "INT8", "INT4"]} selected={config.precision} onSelect={value => update("precision", value as Precision)}/></Control><Control label="CONTINUOUS BATCH" hint="latency ↔ throughput"><Segment values={[1, 8, 16]} selected={config.batchSize} onSelect={value => update("batchSize", value as BatchSize)} prefix="B"/></Control><Control label="KV CACHE BUDGET" hint="capacity"><Segment values={[6, 10, 14]} selected={config.cacheGb} onSelect={value => update("cacheGb", value as CacheSize)} suffix="GB"/></Control><Control label="CONCURRENCY CAP" hint="queue pressure"><Segment values={[4, 12, 24]} selected={config.concurrency} onSelect={value => update("concurrency", value as Concurrency)} prefix="C"/></Control><Toggle label="PREFIX CACHING" detail="Reuse the shared prompt" checked={config.prefixCache} onChange={value => update("prefixCache", value)}/><Toggle label="SPECULATIVE DECODING" detail="Draft, then verify tokens" checked={config.speculative} onChange={value => update("speculative", value)}/><button className="play-reset" onClick={() => setConfig({ ...defaultExperimentConfig, precision: "INT8", batchSize: 8 })}>RESET CONFIGURATION</button></aside>
      <section className="play-output"><div className="play-output-head"><div><span>02 / EXPERIMENT SPEC</span><h2>Ready to reproduce</h2></div><div className="play-status"><i/> AWAITING RUNTIME</div></div><div className="play-trajectory"><div className="trajectory-head"><span>MEASUREMENT PIPELINE</span><b>No estimated values</b></div><div className="concept-pipeline"><span>CONFIG</span><i>→</i><b>RUNTIME</b><i>→</i><b>TRACE</b><i>→</i><span>COMPARE</span></div></div><div className="play-metrics"><Metric label="MODEL" value="7B" delta={benchmarkWorkload.model}/><Metric label="PROMPT" value={`${benchmarkWorkload.promptTokens}`} suffix="tok" delta={`${benchmarkWorkload.sharedPrefix}% shared prefix`}/><Metric label="OUTPUT" value={`${benchmarkWorkload.outputTokens}`} suffix="tok" delta="per request"/><Metric label="RUN" value="24" suffix="sec" delta="controlled workload"/></div><div className="causal-readout"><span>CONFIGURATION TO TEST</span><h3>{config.precision} · batch {config.batchSize} · {config.cacheGb} GB cache · concurrency {config.concurrency}</h3><p>Prefix caching {config.prefixCache ? "enabled" : "disabled"}. Speculative decoding {config.speculative ? "enabled" : "disabled"}. Keep the workload, model, and hardware fixed when comparing this configuration.</p></div><button className="run-concept" onClick={() => void copySpec()}><span>{copied ? "COPIED" : "COPY EXPERIMENT SPEC"}</span><b>JSON</b><i>→</i></button></section>
      <aside className="play-guide"><div className="panel-index">03 / CHOOSE AN ENVIRONMENT</div><h2>Where the numbers come from</h2><article><span>AVAILABLE WHEN CONFIGURED</span><b>Cloud GPU runner</b><small>{cloudConfigured ? "This deployment is connected. Run a measured trace in the lab." : "The operator has not attached a runner to this deployment."}</small></article><article><span>FUTURE WORK</span><b>Bring your own environment</b><small>Attach local llama.cpp, a workstation GPU, or cloud compute through a trace adapter.</small></article><article><span>FUTURE WORK</span><b>Learned system dynamics</b><small>Train a real next-state model on measured traces across workloads and hardware.</small></article><div className="graduate-card"><span>{cloudConfigured ? "RUNNER READY" : "NO RUNNER ATTACHED"}</span><b>{cloudConfigured ? "Validate this configuration on connected compute." : "The public UI stays honest and shows no fake result."}</b><button onClick={onIncident}>OPEN MEASURED LAB →</button></div><button className="back-foundations" onClick={onLearn}>← REVIEW FOUNDATIONS</button></aside>
    </div>
  </section>;
}

function Incident({ cloudConfigured, onExit }: { cloudConfigured: boolean; onExit: () => void }) {
  const [config, setConfig] = useState<InferenceConfig>({ ...defaultExperimentConfig, precision: "INT8", batchSize: 8 });
  const [prediction, setPrediction] = useState<Prediction>("");
  const [gpu, setGpu] = useState<CloudGpu>("T4");
  const [status, setStatus] = useState<CloudBenchmarkStatus["status"] | "idle">("idle");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MeasuredResult | null>(null);
  const capacity = gpuMemory(gpu);
  const update = <K extends keyof InferenceConfig>(key: K, value: InferenceConfig[K]) => { setConfig(current => ({ ...current, [key]: value })); setResult(null); setError(""); };
  const reset = () => { setConfig({ ...defaultExperimentConfig, precision: "INT8", batchSize: 8 }); setPrediction(""); setStatus("idle"); setRunning(false); setError(""); setResult(null); };
  const run = async () => {
    setRunning(true); setResult(null); setError(""); setStatus("queued");
    try {
      const response = await fetch("/api/benchmark", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ gpu, config, durationSeconds: 24 }) });
      let job = await response.json() as CloudBenchmarkStatus & { error?: string };
      if (!response.ok) throw new Error(job.error || "The benchmark could not start.");
      for (let poll = 0; poll < 260 && !["completed", "failed"].includes(job.status); poll++) {
        await new Promise(resolve => window.setTimeout(resolve, 1500));
        const pollResponse = await fetch(`/api/benchmark?job=${encodeURIComponent(job.jobId)}`);
        job = await pollResponse.json();
        if (!pollResponse.ok) throw new Error(job.error || "The benchmark status could not be read.");
        setStatus(job.status);
      }
      if (job.status !== "completed" || !job.trace) throw new Error(job.error || "The benchmark exceeded its time limit.");
      const lastFrame = job.trace.frames.at(-1);
      const measured: MeasuredResult = { ttftMs: job.trace.summary.ttftMs, p95Ms: job.trace.summary.p95Ms, throughput: Math.round(job.trace.summary.throughput), vramGb: job.trace.summary.peakVramGb, queueDepth: Math.round(lastFrame?.queueDepth ?? 0), utilization: Math.round(Math.max(...job.trace.frames.map(frame => frame.utilization), 0)), powerWatts: Math.round(Math.max(...job.trace.frames.map(frame => frame.powerWatts ?? 0), 0)), costPerMillion: job.trace.summary.costPerMillion, oom: job.trace.summary.peakVramGb >= capacity * .99 };
      setResult(measured); setStatus("completed"); trackEvent("gpu_trace_completed", { label: gpu, value: prediction });
    } catch (caught) {
      setStatus("failed"); setError(caught instanceof Error ? caught.message : "The benchmark failed.");
    } finally {
      setRunning(false);
    }
  };
  const measuredOutcome: Exclude<Prediction, ""> | null = result ? result.oom ? "oom" : result.p95Ms > 4000 ? "latency" : "clear" : null;
  return <section className="incident-view">
    <div className="incident-commandbar"><div><button onClick={onExit}>← EXIT LAB</button><span>MEASURED LAB / 01</span><b>Launch-day latency</b></div><div className="incident-clock"><small>RESULT SOURCE</small><strong>{result ? "GPU" : "NONE"}</strong><span>{result ? " trace" : " yet"}</span></div><button className="reset" onClick={reset}>RESET RUN</button></div>
    <div className="incident-grid">
      <aside className="mission-panel"><div className="panel-index">01 / HYPOTHESIS</div><h1>Diagnose the<br/><em>latency risk.</em></h1><p>Choose an outcome, change the serving stack, then test it on connected compute. Quality is not inferred from a performance trace.</p><div className="slo-list"><Slo label="P95 LATENCY" value="≤ 4.00s" pass={Boolean(result && result.p95Ms <= 4000)} active={Boolean(result)}/><Slo label="THROUGHPUT" value="≥ 230 tok/s" pass={Boolean(result && result.throughput >= 230)} active={Boolean(result)}/><Slo label="VRAM" value={`< ${capacity} GB`} pass={Boolean(result && !result.oom)} active={Boolean(result)}/><Slo label="QUALITY" value="SEPARATE EVAL" pass={false} active={false}/><Slo label="COST" value={result?.costPerMillion === undefined ? "IF PROVIDED" : `≤ $1.50 / 1M`} pass={Boolean(result?.costPerMillion !== undefined && result.costPerMillion <= 1.5)} active={result?.costPerMillion !== undefined}/></div><div className="attempt-strip"><span>TRACE STATUS</span><b>{status.toUpperCase()}</b></div></aside>
      <section className="systems-panel" aria-label="Measured inference trace"><div className="systems-head"><div><span>{result ? "MEASURED GPU TRACE" : "NO RESULT YET"}</span><h2>{result ? `${gpu} benchmark run` : "Connect and run an environment"}</h2></div><div className={`health ${result ? "healthy" : "burning"}`}><i/>{result ? "TRACE CAPTURED" : "AWAITING MEASUREMENT"}</div></div><div className="traffic-ribbon"><span>CONTROLLED WORKLOAD</span><b>{benchmarkWorkload.requestRate} req/s</b><i>{benchmarkWorkload.promptTokens.toLocaleString()} input</i><i>{benchmarkWorkload.outputTokens} output</i><i>{benchmarkWorkload.sharedPrefix}% shared prefix</i></div><div className={`pipeline ${running ? "running" : ""}`}><Node kind="edge" number="01" title="REQUEST QUEUE" metric={result ? `${result.queueDepth} waiting` : "—"} alert={Boolean(result && result.queueDepth > 55)}/><Flow active={running}/><Node kind="scheduler" number="02" title="SCHEDULER" metric={`batch ${config.batchSize}`} alert={false}/><Flow active={running}/><Node kind="gpu" number="03" title={`${gpu} · ${capacity} GB`} metric={result ? `${result.utilization}% util` : "—"} alert={Boolean(result?.oom)}/><Flow active={running}/><Node kind="stream" number="04" title="TOKEN STREAM" metric={result ? `${result.throughput} tok/s` : "—"} alert={Boolean(result && result.throughput < 230)}/></div><div className="gpu-core"><div className="gpu-visual"><div className="die"><span>GPU</span><strong>{result ? `${result.utilization}%` : "—"}</strong><small>{result ? `${result.powerWatts} W` : "not run"}</small></div>{Array.from({ length: 24 }, (_, index) => <i key={index} className={result && index < Math.round(result.vramGb / capacity * 24) ? "filled" : ""}/>)}</div><div className="memory-map"><div className="map-title"><span>PEAK VRAM</span><b>{result ? `${result.vramGb} / ${capacity} GB` : "AWAITING TRACE"}</b></div><div className="memory-bar"><i style={{ width: result ? `${Math.min(100, result.vramGb / capacity * 100)}%` : "0%" }}/></div><div className="memory-legend"><span><i className="weights"/>MEASURED</span><span><i className="cache"/>AT PEAK</span><span><i className="runtime"/>NOT ESTIMATED</span></div></div></div><div className="metric-grid"><Metric label="TIME TO FIRST TOKEN" value={formatSeconds(result?.ttftMs)} delta="measured"/><Metric label="P95 END-TO-END" value={formatSeconds(result?.p95Ms)} danger={Boolean(result && result.p95Ms > 4000)} delta="target ≤ 4.00s"/><Metric label="THROUGHPUT" value={result ? `${result.throughput}` : "—"} suffix={result ? "tok/s" : ""} danger={Boolean(result && result.throughput < 230)} delta="measured"/><Metric label="QUEUE DEPTH" value={result ? `${result.queueDepth}` : "—"} danger={Boolean(result && result.queueDepth > 55)} delta="last sample"/></div>{running && <div className="run-overlay"><div className="scanline"/><span>{status.toUpperCase()} · {gpu} GPU</span><b>Provision → load model → generate → capture</b></div>}{result && <div className={`incident-verdict ${prediction === measuredOutcome ? "contained" : "failed"}`}><span>{prediction === measuredOutcome ? "✓" : "!"}</span><div><small>{prediction === measuredOutcome ? "PREDICTION MATCHED" : "PREDICTION CHALLENGED"}</small><b>The measured outcome was {measuredOutcome === "oom" ? "memory exhaustion" : measuredOutcome === "latency" ? "a latency miss" : "clear SLO headroom"}.</b></div><strong>REAL TRACE</strong></div>}</section>
      <aside className="control-panel"><div className="panel-index">02 / CONFIGURE</div><h2>Choose, then measure.</h2><Control label="CONNECTED GPU" hint="real environment"><Segment values={["T4", "L4", "A10"]} selected={gpu} onSelect={value => { setGpu(value as CloudGpu); setResult(null); }}/></Control><Control label="WEIGHT PRECISION" hint="runtime setting"><Segment values={["FP16", "INT8", "INT4"]} selected={config.precision} onSelect={value => update("precision", value as Precision)}/></Control><Control label="CONTINUOUS BATCH" hint="runtime setting"><Segment values={[1, 8, 16]} selected={config.batchSize} onSelect={value => update("batchSize", value as BatchSize)} prefix="B"/></Control><Control label="KV CACHE" hint="budget"><Segment values={[6, 10, 14]} selected={config.cacheGb} onSelect={value => update("cacheGb", value as CacheSize)} suffix="GB"/></Control><Toggle label="PREFIX CACHING" detail="Reuse shared prefixes" checked={config.prefixCache} onChange={value => update("prefixCache", value)}/><Toggle label="SPECULATIVE DECODING" detail="Draft, then verify" checked={config.speculative} onChange={value => update("speculative", value)}/><div className="prediction-block"><span>COMMIT TO AN OUTCOME</span><div><button className={prediction === "clear" ? "selected" : ""} onClick={() => setPrediction("clear")}>SLOS CLEAR</button><button className={prediction === "latency" ? "selected" : ""} onClick={() => setPrediction("latency")}>LATENCY MISSES</button><button className={prediction === "oom" ? "selected" : ""} onClick={() => setPrediction("oom")}>GPU OOMS</button></div></div>{!cloudConfigured && <p className="cloud-note">No runner is attached to this deployment. P99 will not substitute a simulated result. <a href="https://github.com/syedmujahedalih/learnscape/blob/main/docs/cloud-benchmarks.md" target="_blank" rel="noreferrer">Read the setup guide.</a></p>}{error && <p className="cloud-error">{error}</p>}<div className="run-actions"><button className="deploy-button" disabled={!prediction || !cloudConfigured || running} onClick={() => void run()}><span>{running ? "RUNNING ON CONNECTED GPU" : "RUN MEASURED TRACE"}</span><i>→</i></button></div><small className="deploy-note">The lab records latency, throughput, queue, utilization, power, and memory when the runner provides them.</small></aside>
    </div>
  </section>;
}

function Slo({ label, value, pass, active }: { label: string; value: string; pass: boolean; active: boolean }) { return <div className={`slo ${active ? pass ? "pass" : "fail" : ""}`}><span>{label}</span><b>{value}</b><i>{active ? pass ? "✓" : "×" : "·"}</i></div>; }
function Node({ number, title, metric, alert, kind }: { number: string; title: string; metric: string; alert: boolean; kind: string }) { return <div className={`pipeline-node ${kind} ${alert ? "alert" : ""}`}><span>{number}</span><div className="node-icon">{kind === "gpu" ? "▦" : kind === "scheduler" ? "≋" : kind === "stream" ? "»" : "⇥"}</div><b>{title}</b><small>{metric}</small></div>; }
function Flow({ active }: { active: boolean }) { return <div className={`pipeline-flow ${active ? "active" : ""}`}><i/><i/><i/><span>→</span></div>; }
function Metric({ label, value, suffix, delta, danger }: { label: string; value: string; suffix?: string; delta: string; danger?: boolean }) { return <article className={danger ? "danger" : ""}><span>{label}</span><strong>{value}<small>{suffix}</small></strong><em>{delta}</em></article>; }
function Control({ label, hint, children }: { label: string; hint: string; children: ReactNode }) { return <label className="control-group"><span>{label}<i>{hint}</i></span>{children}</label>; }
function Segment({ values, selected, onSelect, prefix = "", suffix = "" }: { values: (string | number)[]; selected: string | number; onSelect: (value: string | number) => void; prefix?: string; suffix?: string }) { return <div className="segment">{values.map(value => <button key={value} className={selected === value ? "selected" : ""} onClick={() => onSelect(value)}>{prefix}{value}{suffix}</button>)}</div>; }
function Toggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) { return <button className={`infra-toggle ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}><span><b>{label}</b><small>{detail}</small></span><i><em/></i></button>; }
