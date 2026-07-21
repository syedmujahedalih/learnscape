"use client";

import { useEffect, useMemo, useState } from "react";
import { initialConfig, launchWorkload, simulateInference, type BatchSize, type CacheSize, type Concurrency, type InferenceConfig, type InferenceMetrics, type Precision } from "@/lib/inference/engine";
import type { CloudBenchmarkStatus } from "@/lib/inference/trace";
import { forecastDynamics, learnedDynamicsInfo } from "@/lib/inference/learned-dynamics";

type View = "home" | "learn" | "playground" | "incident";
type Prediction = "clear" | "latency" | "oom" | "";
type ExecutionMode = "reference" | "cloud";
type CloudGpu = "T4" | "L4" | "A10";
type TelemetryEvent = "site_open" | "foundations_open" | "lesson_selected" | "experiment_completed" | "playground_open" | "playground_control_changed" | "playground_preset_loaded" | "incident_started" | "forecast_generated" | "reference_trace_completed" | "gpu_trace_completed" | "incident_completed";

type ConceptLesson = {
  id: string;
  index: string;
  title: string;
  eyebrow: string;
  summary: string;
  definition: string;
  question: string;
  changeLabel: string;
  takeaway: string;
  baseline: InferenceConfig;
  experiment: InferenceConfig;
};

const conceptLessons: ConceptLesson[] = [
  {
    id: "tail-latency", index: "01", title: "Tail latency", eyebrow: "START HERE · 3 MIN",
    summary: "Why an average can look healthy while real users are still waiting.",
    definition: "P95 is the response time that 95% of requests finish within. P99 watches the slow edge because that is where queues and bad user experiences hide.",
    question: "If the shared prompt is reused, which part of latency should fall first?",
    changeLabel: "Enable prefix caching",
    takeaway: "Prefix caching skips repeated prefill work, so time to first token falls before decode speed changes.",
    baseline: initialConfig,
    experiment: { ...initialConfig, prefixCache: true },
  },
  {
    id: "batching", index: "02", title: "Continuous batching", eyebrow: "THROUGHPUT · 4 MIN",
    summary: "Keep the GPU fed by admitting new requests between decode steps.",
    definition: "A scheduler combines work from multiple requests so the GPU spends less time under-filled. Larger batches usually raise throughput, but can increase waiting and memory pressure.",
    question: "Will batch eight clear more token demand than batch one?",
    changeLabel: "Increase batch 1 → 8",
    takeaway: "Batching raises useful GPU work per step. It improves throughput until queueing or memory becomes the new bottleneck.",
    baseline: { ...initialConfig, precision: "INT8" },
    experiment: { ...initialConfig, precision: "INT8", batchSize: 8 },
  },
  {
    id: "kv-cache", index: "03", title: "KV cache", eyebrow: "MEMORY · 4 MIN",
    summary: "Trade accelerator memory for faster autoregressive decoding.",
    definition: "The KV cache stores attention state for tokens already processed. More cache supports more or longer sequences, but it competes with model weights for VRAM.",
    question: "What happens to memory headroom when the cache budget grows?",
    changeLabel: "Grow cache 6 GB → 14 GB",
    takeaway: "Cache capacity is not free. A seemingly safe serving change can exhaust VRAM before the first token is generated.",
    baseline: { ...initialConfig, precision: "INT8", batchSize: 8 },
    experiment: { ...initialConfig, precision: "INT8", batchSize: 8, cacheGb: 14 },
  },
  {
    id: "quantization", index: "04", title: "Quantization", eyebrow: "PRECISION · 4 MIN",
    summary: "Use fewer bits per weight to exchange precision for speed and memory.",
    definition: "Quantization compresses model weights. Lower precision reduces VRAM and often increases decode throughput, while introducing a quality tradeoff that must be measured.",
    question: "Can four-bit weights create enough memory and throughput headroom?",
    changeLabel: "Switch FP16 → INT4",
    takeaway: "INT4 creates substantial capacity, but the right precision is an SLO decision—not a universally better setting.",
    baseline: initialConfig,
    experiment: { ...initialConfig, precision: "INT4" },
  },
  {
    id: "concurrency", index: "05", title: "Concurrency", eyebrow: "SCHEDULING · 3 MIN",
    summary: "Choose how many requests may compete for the accelerator at once.",
    definition: "A concurrency cap limits active sequences. Too low wastes GPU capacity; too high increases cache pressure and can make tail latency unstable.",
    question: "Is four active sequences enough to keep up with this workload?",
    changeLabel: "Raise concurrency 4 → 12",
    takeaway: "Concurrency is a pressure valve. It should be tuned with batching and cache capacity, not in isolation.",
    baseline: { ...initialConfig, precision: "INT8", batchSize: 8, concurrency: 4 },
    experiment: { ...initialConfig, precision: "INT8", batchSize: 8, concurrency: 12 },
  },
  {
    id: "speculative", index: "06", title: "Speculative decoding", eyebrow: "DECODING · 5 MIN",
    summary: "Draft multiple tokens cheaply, then verify them with the target model.",
    definition: "A smaller draft model proposes tokens while the target model verifies them in parallel. When acceptance is high, users receive tokens faster without replacing the target model.",
    question: "Will drafting tokens clear the queue without changing weight precision?",
    changeLabel: "Enable speculative decoding",
    takeaway: "Speculation accelerates decode, but its gain depends on draft quality, verification cost, and the workload.",
    baseline: { ...initialConfig, precision: "INT8", batchSize: 8 },
    experiment: { ...initialConfig, precision: "INT8", batchSize: 8, speculative: true },
  },
];

const formatSeconds = (ms: number) => ms ? `${(ms / 1000).toFixed(2)}s` : "—";
const gpuMemory = (gpu: CloudGpu) => gpu === "T4" ? 16 : 24;
const maxCost = { T4: .12, L4: .16, A10: .22 } as const;

const telemetryContext = () => {
  const width = window.innerWidth;
  const device = width < 700 ? "mobile" : width < 1100 ? "tablet" : "desktop";
  const campaign = new URLSearchParams(window.location.search).get("utm_source")?.toLowerCase() ?? "";
  const referrer = document.referrer.toLowerCase();
  const source = campaign.includes("linkedin") || referrer.includes("linkedin.com") ? "linkedin" : campaign === "x" || campaign.includes("twitter") || referrer.includes("t.co") || referrer.includes("twitter.com") ? "x" : campaign.includes("github") || referrer.includes("github.com") ? "github" : campaign || referrer ? "other" : "direct";
  return { device, source } as const;
};

const trackEvent = (event: TelemetryEvent, detail: { label?: string; value?: string; score?: number } = {}) => {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return;
  try {
    let sessionId = sessionStorage.getItem("p99_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("p99_session_id", sessionId);
    }
    void fetch("/api/telemetry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, event, ...telemetryContext(), ...detail }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Storage or analytics failures must not interrupt the playground.
  }
};

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [config, setConfig] = useState<InferenceConfig>(initialConfig);
  const [prediction, setPrediction] = useState<Prediction>("");
  const [forecasted, setForecasted] = useState(false);
  const [running, setRunning] = useState(false);
  const [observed, setObserved] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("reference");
  const [cloudGpu, setCloudGpu] = useState<CloudGpu>("T4");
  const [cloudConfigured, setCloudConfigured] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<CloudBenchmarkStatus["status"] | "idle">("idle");
  const [cloudError, setCloudError] = useState("");
  const [cloudResult, setCloudResult] = useState<InferenceMetrics | null>(null);

  const rollout = useMemo(() => forecastDynamics(config), [config]);
  const forecast = rollout.metrics;
  const referenceResult = useMemo(() => simulateInference(config), [config]);
  const result = executionMode === "cloud" && cloudResult ? cloudResult : referenceResult;
  const shown = observed ? result : forecasted ? forecast : simulateInference(initialConfig);
  const capacityGb = executionMode === "cloud" ? gpuMemory(cloudGpu) : 24;

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
    if (event && !sessionStorage.getItem(`p99_${event}_tracked`)) {
      trackEvent(event);
      sessionStorage.setItem(`p99_${event}_tracked`, "1");
    }
  }, [view]);

  const update = <K extends keyof InferenceConfig>(key: K, value: InferenceConfig[K]) => {
    setConfig(current => ({ ...current, [key]: value }));
    trackEvent("playground_control_changed", { label: String(key), value: String(value) });
    setForecasted(false); setObserved(false); setCloudResult(null); setCloudError("");
  };

  const runReference = () => {
    setRunning(true); setObserved(false); setCloudError(""); setCloudStatus("running");
    window.setTimeout(() => {
      setRunning(false); setObserved(true); setCloudStatus("completed");
      trackEvent("reference_trace_completed", { score: referenceResult.score, value: referenceResult.passed ? "contained" : "failed" });
      if (referenceResult.passed) trackEvent("incident_completed", { score: referenceResult.score });
    }, 1350);
  };

  const runCloud = async () => {
    setRunning(true); setObserved(false); setCloudError(""); setCloudStatus("queued");
    try {
      const createResponse = await fetch("/api/benchmark", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ gpu: cloudGpu, config, durationSeconds: 24 }) });
      const created = await createResponse.json() as CloudBenchmarkStatus & { error?: string };
      if (!createResponse.ok) throw new Error(created.error || "Cloud benchmark could not start.");
      let job = created;
      for (let poll = 0; poll < 260 && !["completed", "failed"].includes(job.status); poll++) {
        await new Promise(resolve => window.setTimeout(resolve, 1500));
        const response = await fetch(`/api/benchmark?job=${encodeURIComponent(job.jobId)}`);
        job = await response.json();
        if (!response.ok) throw new Error(job.error || "Cloud benchmark status could not be read.");
        setCloudStatus(job.status);
      }
      if (job.status !== "completed" || !job.trace) throw new Error(job.error || "Cloud benchmark exceeded its time limit.");
      const summary = job.trace.summary;
      const base = simulateInference(config);
      const oom = summary.peakVramGb >= gpuMemory(cloudGpu) * .99;
      const costPerMillion = summary.costPerMillion ?? base.costPerMillion;
      const checks = [!oom, summary.p95Ms <= 4000, summary.throughput >= 230, base.quality >= 95, costPerMillion <= 1.5];
      const metrics: InferenceMetrics = {
        ...base,
        ttftMs: summary.ttftMs,
        p95Ms: summary.p95Ms,
        throughput: Math.round(summary.throughput),
        vramGb: summary.peakVramGb,
        queueDepth: Math.round(job.trace.frames.at(-1)?.queueDepth ?? 0),
        utilization: Math.round(Math.max(...job.trace.frames.map(frame => frame.utilization), 0)),
        powerWatts: Math.round(Math.max(...job.trace.frames.map(frame => frame.powerWatts ?? 0), 0)),
        costPerMillion,
        oom,
        score: checks.filter(Boolean).length * 20,
        passed: checks.every(Boolean),
        bottleneck: oom ? "The measured run exhausted usable VRAM." : summary.throughput < 230 ? "Measured decode capacity stayed below token demand." : summary.p95Ms > 4000 ? "Measured tail latency missed the 4 second SLO." : "No active bottleneck. The measured run has SLO headroom.",
      };
      setCloudResult(metrics); setObserved(true); setCloudStatus("completed");
      trackEvent("gpu_trace_completed", { label: cloudGpu, score: metrics.score, value: metrics.passed ? "contained" : "failed" });
      if (metrics.passed) trackEvent("incident_completed", { label: cloudGpu, score: metrics.score });
    } catch (error) {
      setCloudStatus("failed"); setCloudError(error instanceof Error ? error.message : "Cloud benchmark failed.");
    } finally {
      setRunning(false);
    }
  };

  const run = () => {
    setAttempt(current => current + 1);
    if (executionMode === "cloud") void runCloud();
    else runReference();
  };
  const reset = () => {
    setConfig(initialConfig); setPrediction(""); setForecasted(false); setObserved(false); setRunning(false); setAttempt(1); setCloudResult(null); setCloudError(""); setCloudStatus("idle");
  };

  return <main className="infra-app">
    <header className="infra-nav">
      <button className="infra-brand" onClick={() => setView("home")} aria-label="P99 home"><span>P/</span>P99</button>
      <nav className="nav-center" aria-label="Primary navigation"><button className={view === "learn" ? "active" : ""} onClick={() => setView("learn")}>FOUNDATIONS</button><button className={view === "playground" ? "active" : ""} onClick={() => setView("playground")}>PLAYGROUND</button><button className={view === "incident" ? "active" : ""} onClick={() => setView("incident")}>INCIDENTS</button></nav>
      <div className="nav-actions"><span className="runtime-pill"><i/> LEARNED SURROGATE READY</span><button onClick={() => setView("incident")}>MISSION 01</button></div>
    </header>

    {view === "home" ? <Landing onLearn={() => setView("learn")} onPlay={() => setView("playground")} onIncident={() => setView("incident")} /> : view === "learn" ? <Foundations onPlay={() => setView("playground")} onIncident={() => setView("incident")} /> : view === "playground" ? <Playground onLearn={() => setView("learn")} onIncident={() => setView("incident")} /> : <section className="incident-view">
      <div className="incident-commandbar">
        <div><button onClick={() => setView("home")}>← EXIT LAB</button><span>INCIDENT / 01</span><b>Launch-day latency spiral</b></div>
        <div className="incident-clock"><small>REVENUE AT RISK</small><strong>$12,480</strong><span>/ min</span></div>
        <button className="reset" onClick={reset}>RESET RUN</button>
      </div>

      <div className="incident-grid">
        <aside className="mission-panel">
          <div className="panel-index">01 / CONFIGURE</div>
          <h1>Stop the<br/><em>latency spiral.</em></h1>
          <p>Traffic jumped 6× after launch. Keep the 8B model online without breaking latency, quality, memory, or cost.</p>
          <div className="slo-list">
            <Slo label="P95 LATENCY" value="≤ 4.00s" pass={!observed || result.p95Ms <= 4000} active={observed}/>
            <Slo label="THROUGHPUT" value="≥ 230 tok/s" pass={!observed || result.throughput >= 230} active={observed}/>
            <Slo label="VRAM" value={`< ${capacityGb} GB`} pass={!observed || !result.oom} active={observed}/>
            <Slo label="QUALITY" value="≥ 95%" pass={!observed || result.quality >= 95} active={observed}/>
            <Slo label="COST" value="≤ $1.50 / 1M" pass={!observed || result.costPerMillion <= 1.5} active={observed}/>
          </div>
          <div className="attempt-strip"><span>ATTEMPT {attempt.toString().padStart(2,"0")}</span><b>{observed ? `${result.score}/100` : "UNSCORED"}</b></div>
        </aside>

        <section className="systems-panel" aria-label="Inference serving system">
          <div className="systems-head"><div><span>{observed ? executionMode === "cloud" ? "MEASURED GPU TRACE" : "REFERENCE TRACE" : "LEARNED STATE ROLLOUT"}</span><h2>inference-prod-usw2</h2></div><div className={`health ${observed && result.passed ? "healthy" : "burning"}`}><i/>{observed && result.passed ? "SLO HEALTHY" : "SLO VIOLATION"}</div></div>
          <div className="traffic-ribbon"><span>LIVE TRAFFIC</span><b>{launchWorkload.requestRate} req/s</b><i>1,200 input</i><i>96 output</i><i>67% shared prefix</i></div>
          <div className={`pipeline ${running ? "running" : ""}`}>
            <Node kind="edge" number="01" title="API GATEWAY" metric={`${shown.queueDepth} queued`} alert={shown.queueDepth > 55}/><Flow active={running}/>
            <Node kind="scheduler" number="02" title="SCHEDULER" metric={`batch ${config.batchSize}`} alert={false}/><Flow active={running}/>
            <Node kind="gpu" number="03" title={executionMode === "cloud" ? `${cloudGpu} · ${capacityGb} GB` : "A10G · 24 GB"} metric={`${shown.utilization}% util`} alert={shown.oom}/><Flow active={running}/>
            <Node kind="stream" number="04" title="TOKEN STREAM" metric={`${shown.throughput} tok/s`} alert={shown.throughput < 230}/>
          </div>
          <div className="gpu-core">
            <div className="gpu-visual"><div className="die"><span>CUDA</span><strong>{shown.utilization}%</strong><small>{shown.powerWatts} W</small></div>{Array.from({length:24},(_,index)=><i key={index} className={index < Math.round(shown.vramGb / capacityGb * 24) ? "filled" : ""}/>)}</div>
            <div className="memory-map"><div className="map-title"><span>VRAM ALLOCATION</span><b>{shown.vramGb} / {capacityGb} GB</b></div><div className="memory-bar"><i style={{width:`${Math.min(100, shown.vramGb / capacityGb * 100)}%`}}/></div><div className="memory-legend"><span><i className="weights"/>WEIGHTS</span><span><i className="cache"/>KV CACHE</span><span><i className="runtime"/>RUNTIME</span></div></div>
          </div>
          <div className="metric-grid">
            <Metric label="TIME TO FIRST TOKEN" value={formatSeconds(shown.ttftMs)} delta={observed ? `${Math.abs(result.ttftMs-forecast.ttftMs)}ms forecast error` : "learned forecast"}/>
            <Metric label="P95 END-TO-END" value={formatSeconds(shown.p95Ms)} danger={shown.p95Ms > 4000} delta="target ≤ 4.00s"/>
            <Metric label="THROUGHPUT" value={`${shown.throughput}`} suffix="tok/s" danger={shown.throughput < 230} delta="demand 230 tok/s"/>
            <Metric label="QUEUE DEPTH" value={`${shown.queueDepth}`} danger={shown.queueDepth > 55} delta="requests waiting"/>
          </div>
          {running && <div className="run-overlay"><div className="scanline"/><span>{executionMode === "cloud" ? `${cloudStatus.toUpperCase()} · ${cloudGpu} GPU` : "REPLAYING REFERENCE TRACE"}</span><b>{executionMode === "cloud" ? "Provision → load model → generate → capture" : "Prefill → decode → stream"}</b></div>}
          {observed && <div className={`incident-verdict ${result.passed ? "contained" : "failed"}`}><span>{result.passed ? "✓" : "!"}</span><div><small>{result.passed ? "INCIDENT CONTAINED" : "SLO STILL BURNING"}</small><b>{result.passed ? "The queue is draining with quality intact." : result.bottleneck}</b></div><strong>{result.score}/100</strong></div>}
        </section>

        <aside className="control-panel">
          <div className="panel-index">02 / INTERVENE</div>
          <h2>Change the serving stack.</h2>
          <div className="execution-mode"><span>VALIDATE WITH</span><div><button className={executionMode === "reference" ? "selected" : ""} onClick={() => { setExecutionMode("reference"); setObserved(false); }}>REFERENCE TRACE<small>instant · deterministic</small></button><button className={executionMode === "cloud" ? "selected" : ""} onClick={() => { setExecutionMode("cloud"); setObserved(false); }}>CLOUD GPU<small>{cloudConfigured ? "ready · metered" : "setup required"}</small></button></div></div>
          {executionMode === "cloud" && <Control label="EPHEMERAL GPU" hint={`hard cap $${maxCost[cloudGpu].toFixed(2)}`}><Segment values={["T4","L4","A10"]} selected={cloudGpu} onSelect={value=>setCloudGpu(value as CloudGpu)}/></Control>}
          <Control label="WEIGHT PRECISION" hint="memory ↔ quality"><Segment values={["FP16","INT8","INT4"]} selected={config.precision} onSelect={value=>update("precision",value as Precision)}/></Control>
          <Control label="CONTINUOUS BATCH" hint="latency ↔ throughput"><Segment values={[1,8,16]} selected={config.batchSize} onSelect={value=>update("batchSize",value as BatchSize)} prefix="B"/></Control>
          <Control label="KV CACHE BUDGET" hint="capacity"><Segment values={[6,10,14]} selected={config.cacheGb} onSelect={value=>update("cacheGb",value as CacheSize)} suffix="GB"/></Control>
          <Control label="CONCURRENCY CAP" hint="queue pressure"><Segment values={[4,12,24]} selected={config.concurrency} onSelect={value=>update("concurrency",value as Concurrency)} prefix="C"/></Control>
          <Toggle label="PREFIX CACHING" detail="Reuse the shared system prompt" checked={config.prefixCache} onChange={value=>update("prefixCache",value)}/>
          <Toggle label="SPECULATIVE DECODING" detail="Draft tokens, verify in parallel" checked={config.speculative} onChange={value=>update("speculative",value)}/>
          <div className="prediction-block"><span>COMMIT YOUR PREDICTION</span><div><button className={prediction==="clear"?"selected":""} onClick={()=>setPrediction("clear")}>Queue clears</button><button className={prediction==="latency"?"selected":""} onClick={()=>setPrediction("latency")}>Latency fails</button><button className={prediction==="oom"?"selected":""} onClick={()=>setPrediction("oom")}>GPU OOMs</button></div></div>
          <div className="run-actions"><button className="forecast-button" disabled={!prediction || running} onClick={()=>{setForecasted(true);setObserved(false);trackEvent("forecast_generated",{value:prediction})}}>{forecasted ? "ROLL OUT AGAIN" : "ROLL OUT LEARNED DYNAMICS"}</button><button className="deploy-button" disabled={!forecasted || running || (executionMode === "cloud" && !cloudConfigured)} onClick={run}>{running ? executionMode === "cloud" ? "BENCHMARK RUNNING…" : "REPLAYING TRACE…" : executionMode === "cloud" ? `LAUNCH ${cloudGpu} BENCHMARK →` : "REPLAY REFERENCE TRACE →"}</button></div>
          {cloudError && <p className="cloud-error">{cloudError}</p>}
          <div className="model-provenance"><span>LEARNED DYNAMICS SURROGATE</span><b>{learnedDynamicsInfo.architecture}</b><small>{learnedDynamicsInfo.parameters} parameters · {learnedDynamicsInfo.transitions.toLocaleString()} transitions · training-fit RMSE {learnedDynamicsInfo.validationRmse}</small><em>{learnedDynamicsInfo.source === "simulator_synthetic" ? "SYNTHETIC SIMULATOR TRACES" : "MEASURED GPU TRACES"}</em></div>
          <p className="truth-note"><i/> The learned model forecasts first. A labeled reference trace or an optional real GPU run grades it.</p>
        </aside>
      </div>
    </section>}
    <footer className="privacy-strip"><span><i/> PRIVACY-LIGHT ANALYTICS</span><p>Anonymous interaction events only · this app stores no names, email addresses, raw IPs, or cross-site identifiers · 30-day retention · Do Not Track respected</p></footer>
  </main>;
}

function Landing({onLearn,onPlay,onIncident}:{onLearn:()=>void;onPlay:()=>void;onIncident:()=>void}) { return <section className="infra-home">
  <div className="home-grid"><div className="home-copy"><div className="home-kicker"><span>THE INTERACTIVE PLAYGROUND FOR</span> LLM SYSTEMS</div><h1>Learn inference<br/><em>by running it.</em></h1><p>Explore how fast LLM serving actually works. Change the stack, watch the system respond, and graduate from first principles to production incidents.</p><div className="home-actions"><button onClick={onLearn}>START WITH THE BASICS <span>→</span></button><button className="secondary-action" onClick={onPlay}>OPEN PLAYGROUND</button></div><div className="home-proof"><div><b>01</b><span>LEARN</span><small>Build the mental model</small></div><div><b>02</b><span>EXPERIMENT</span><small>Change one variable</small></div><div><b>03</b><span>DIAGNOSE</span><small>Read the system response</small></div><div><b>04</b><span>OPERATE</span><small>Contain an incident</small></div></div></div><div className="home-console" aria-label="Live AI inference infrastructure incident"><div className="console-top"><span>PLAYGROUND / GUIDED PREVIEW</span><b><i/> SYSTEM LIVE</b></div><div className="console-alert"><span>P95 LATENCY</span><strong>14.82<small>s</small></strong><em>+1,184%</em></div><div className="console-chart"><div className="chart-target">SLO 4.00s</div>{[18,22,20,34,31,45,68,57,82,74,92,86,96,89,94,91].map((height,index)=><i key={index} style={{height:`${height}%`}}/> )}</div><div className="console-pipeline"><span>2.4 req/s</span><i>→</i><b>QUEUE <em>389</em></b><i>→</i><b>GPU <em>97%</em></b><i>→</i><span>79 tok/s</span></div><div className="console-rack"><div className="rack-chip"><small>NVIDIA</small><strong>A10G</strong><span>24 GB</span></div><div className="rack-memory"><span>VRAM</span><b>23.6 / 24 GB</b><i><em/></i></div><div className="rack-log"><span>12:04:18</span> decode capacity saturated<br/><span>12:04:19</span> queue depth +47<br/><span>12:04:21</span> p95 budget exceeded<br/><b>▮</b></div></div></div></div>
  <div className="learning-routes"><div className="route-intro"><span>CHOOSE YOUR ENTRY POINT</span><h2>From “what is a token?”<br/>to “why is p99 on fire?”</h2></div><button onClick={onLearn}><span>01 · GUIDED</span><b>Foundations</b><small>Six visual, one-variable labs. No systems background required.</small><em>START LEARNING →</em></button><button onClick={onPlay}><span>02 · OPEN</span><b>Free playground</b><small>Tune the serving stack and watch the learned forecast react.</small><em>START EXPLORING →</em></button><button onClick={onIncident}><span>03 · CHALLENGE</span><b>Production incidents</b><small>Balance latency, throughput, memory, quality, and cost.</small><em>ENTER MISSION 01 →</em></button></div>
  <div className="mission-ticker"><span>LEARNING PATH</span><b>FOUNDATIONS → PLAYGROUND → INCIDENTS</b><i/> Tail latency <i/> Batching <i/> KV cache <i/> Quantization <button onClick={onLearn}>BEGIN →</button></div>
</section>; }

function Foundations({onPlay,onIncident}:{onPlay:()=>void;onIncident:()=>void}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ran, setRan] = useState(false);
  const lesson = conceptLessons[activeIndex];
  const before = useMemo(() => simulateInference(lesson.baseline), [lesson]);
  const after = useMemo(() => simulateInference(lesson.experiment), [lesson]);
  const shown = ran ? after : before;
  const chooseLesson = (index:number) => { setActiveIndex(index); setRan(false); trackEvent("lesson_selected", { label: conceptLessons[index].id }); };
  const nextLesson = () => { if (activeIndex < conceptLessons.length - 1) chooseLesson(activeIndex + 1); else onPlay(); };
  return <section className="learn-view">
    <div className="learn-head"><div><span>GUIDED PATH · FOUNDATIONS</span><h1>Build the mental model.</h1><p>One concept. One controlled change. Immediate system feedback.</p></div><div className="course-progress"><span>{activeIndex + 1} / {conceptLessons.length} LABS</span><i><em style={{width:`${((activeIndex + 1) / conceptLessons.length) * 100}%`}}/></i></div></div>
    <div className="learn-shell">
      <aside className="lesson-list">{conceptLessons.map((item,index)=><button key={item.id} className={index === activeIndex ? "active" : ""} onClick={()=>chooseLesson(index)}><span>{item.index}</span><div><b>{item.title}</b><small>{item.summary}</small></div><i>{index < activeIndex ? "✓" : "→"}</i></button>)}</aside>
      <article className="lesson-stage">
        <div className="lesson-copy"><span>{lesson.eyebrow}</span><h2>{lesson.title}</h2><p>{lesson.definition}</p><div className="lesson-question"><small>PREDICT BEFORE YOU RUN IT</small><b>{lesson.question}</b></div></div>
        <div className="concept-system"><div className="concept-top"><span>{ran ? "AFTER CHANGE" : "BASELINE"}</span><b>{ran ? lesson.changeLabel : "Current serving state"}</b><i className={shown.oom ? "bad" : shown.passed ? "good" : ""}>{shown.oom ? "MEMORY FAILURE" : shown.passed ? "HEALTHY" : "BOTTLENECK ACTIVE"}</i></div><div className="concept-pipeline"><span>REQUESTS</span><i>→</i><b>SCHEDULER</b><i>→</i><b>GPU</b><i>→</i><span>TOKENS</span></div><div className="concept-metrics"><LearnMetric label="TIME TO FIRST TOKEN" before={before.ttftMs} after={after.ttftMs} value={`${Math.round(shown.ttftMs)} ms`} ran={ran}/><LearnMetric label="P95 LATENCY" before={before.p95Ms} after={after.p95Ms} value={formatSeconds(shown.p95Ms)} ran={ran}/><LearnMetric label="THROUGHPUT" before={before.throughput} after={after.throughput} value={`${shown.throughput} tok/s`} ran={ran}/><LearnMetric label="VRAM" before={before.vramGb} after={after.vramGb} value={`${shown.vramGb} GB`} ran={ran}/></div><div className="queue-viz"><span>QUEUE</span><div>{Array.from({length:12},(_,index)=><i key={index} className={index < Math.min(12, Math.ceil(shown.queueDepth / 25)) ? "filled" : ""}/>)}</div><b>{shown.queueDepth} waiting</b></div></div>
        {!ran ? <button className="run-concept" onClick={()=>{setRan(true);trackEvent("experiment_completed",{label:lesson.id})}}><span>RUN THE EXPERIMENT</span><b>{lesson.changeLabel}</b><i>→</i></button> : <div className="concept-result"><span>WHAT CHANGED</span><p>{lesson.takeaway}</p><div><button onClick={()=>setRan(false)}>REPLAY</button><button onClick={nextLesson}>{activeIndex === conceptLessons.length - 1 ? "OPEN FREE PLAYGROUND →" : "NEXT CONCEPT →"}</button></div></div>}
      </article>
    </div>
    <div className="learn-footer"><span>READY FOR MORE VARIABLES?</span><button onClick={onPlay}>OPEN FREE PLAYGROUND</button><button onClick={onIncident}>SKIP TO INCIDENT 01 →</button></div>
  </section>;
}

function LearnMetric({label,before,after,value,ran}:{label:string;before:number;after:number;value:string;ran:boolean}) {
  const delta = before ? Math.round((after - before) / before * 100) : 0;
  return <div><span>{label}</span><strong>{value}</strong><small className={ran ? delta < 0 ? "improved" : delta > 0 ? "worse" : "" : ""}>{ran ? `${delta > 0 ? "+" : ""}${delta}% from baseline` : "before change"}</small></div>;
}

function Playground({onLearn,onIncident}:{onLearn:()=>void;onIncident:()=>void}) {
  const [playConfig, setPlayConfig] = useState<InferenceConfig>({ ...initialConfig, precision: "INT8", batchSize: 8 });
  const rollout = useMemo(() => forecastDynamics(playConfig), [playConfig]);
  const metrics = rollout.metrics;
  const updatePlay = <K extends keyof InferenceConfig>(key:K,value:InferenceConfig[K]) => { setPlayConfig(current=>({...current,[key]:value})); trackEvent("playground_control_changed", { label: String(key), value: String(value) }); };
  const loadPreset = (label:string, preset:InferenceConfig) => { setPlayConfig(preset); trackEvent("playground_preset_loaded", { label }); };
  const maxQueue = Math.max(...rollout.trajectory.map(frame=>frame.queueDepth),1);
  return <section className="play-view">
    <div className="play-head"><div><span>FREE PLAYGROUND</span><h1>Change the stack.<br/><em>Watch cause become effect.</em></h1><p>No score and no prescribed answer. Build a serving configuration and inspect its predicted behavior.</p></div><div className="model-badge"><span>LEARNED DYNAMICS</span><b>{learnedDynamicsInfo.architecture}</b><small>Simulator-trained surrogate · every forecast is labeled</small></div></div>
    <div className="play-shell">
      <aside className="play-controls"><div className="panel-index">01 / CONFIGURE</div><h2>Your serving stack</h2><Control label="WEIGHT PRECISION" hint="memory ↔ quality"><Segment values={["FP16","INT8","INT4"]} selected={playConfig.precision} onSelect={value=>updatePlay("precision",value as Precision)}/></Control><Control label="CONTINUOUS BATCH" hint="latency ↔ throughput"><Segment values={[1,8,16]} selected={playConfig.batchSize} onSelect={value=>updatePlay("batchSize",value as BatchSize)} prefix="B"/></Control><Control label="KV CACHE BUDGET" hint="capacity"><Segment values={[6,10,14]} selected={playConfig.cacheGb} onSelect={value=>updatePlay("cacheGb",value as CacheSize)} suffix="GB"/></Control><Control label="CONCURRENCY CAP" hint="queue pressure"><Segment values={[4,12,24]} selected={playConfig.concurrency} onSelect={value=>updatePlay("concurrency",value as Concurrency)} prefix="C"/></Control><Toggle label="PREFIX CACHING" detail="Reuse the shared system prompt" checked={playConfig.prefixCache} onChange={value=>updatePlay("prefixCache",value)}/><Toggle label="SPECULATIVE DECODING" detail="Draft tokens, verify in parallel" checked={playConfig.speculative} onChange={value=>updatePlay("speculative",value)}/><button className="play-reset" onClick={()=>setPlayConfig({...initialConfig,precision:"INT8",batchSize:8})}>RESET CONFIGURATION</button></aside>
      <section className="play-output"><div className="play-output-head"><div><span>02 / LEARNED FORECAST</span><h2>Thirty-second rollout</h2></div><div className={metrics.oom ? "play-status fail" : metrics.passed ? "play-status pass" : "play-status"}><i/>{metrics.oom ? "OOM PREDICTED" : metrics.passed ? "SLO HEADROOM" : "BOTTLENECK ACTIVE"}</div></div><div className="play-trajectory"><div className="trajectory-head"><span>QUEUE DEPTH OVER TIME</span><b>{metrics.queueDepth} requests at horizon</b></div><div className="trajectory-chart">{rollout.trajectory.map((frame,index)=><i key={index} style={{height:`${Math.max(4,frame.queueDepth/maxQueue*100)}%`}}><span>{index * 2.5}s</span></i>)}</div></div><div className="play-metrics"><Metric label="TIME TO FIRST TOKEN" value={formatSeconds(metrics.ttftMs)} delta="first visible output"/><Metric label="P95 END-TO-END" value={formatSeconds(metrics.p95Ms)} danger={metrics.p95Ms > 4000} delta="target ≤ 4.00s"/><Metric label="THROUGHPUT" value={`${metrics.throughput}`} suffix="tok/s" danger={metrics.throughput < 230} delta="demand 230 tok/s"/><Metric label="VRAM" value={`${metrics.vramGb}`} suffix="GB" danger={metrics.oom} delta="capacity 24 GB"/></div><div className="causal-readout"><span>WHY THE SYSTEM MOVED</span><h3>{metrics.oom ? "The runtime runs out of memory before serving begins." : metrics.bottleneck}</h3><p>{playConfig.precision === "INT4" ? "Four-bit weights free VRAM and increase decode capacity. " : playConfig.precision === "FP16" ? "Full-precision weights consume most of the device before the cache is allocated. " : "Eight-bit weights balance quality and memory headroom. "}{playConfig.batchSize > 1 ? `Batch ${playConfig.batchSize} keeps more GPU lanes occupied. ` : "Batch one leaves throughput on the table. "}{playConfig.prefixCache ? "Prefix reuse reduces repeated prefill work." : "Repeated prefixes are still being recomputed."}</p></div></section>
      <aside className="play-guide"><div className="panel-index">03 / MAKE SENSE OF IT</div><h2>Try these experiments</h2><button onClick={()=>loadPreset("memory-cliff",{...initialConfig,precision:"FP16",cacheGb:14})}><span>MEMORY CLIFF</span><b>Can a larger KV cache cause an OOM?</b><i>LOAD →</i></button><button onClick={()=>loadPreset("empty-gpu",{...initialConfig,precision:"INT8",batchSize:1,concurrency:4})}><span>EMPTY GPU</span><b>What does under-batching do to the queue?</b><i>LOAD →</i></button><button onClick={()=>loadPreset("slo-headroom",{precision:"INT4",batchSize:8,cacheGb:10,concurrency:12,prefixCache:true,speculative:true})}><span>SLO HEADROOM</span><b>How do several optimizations compound?</b><i>LOAD →</i></button><div className="graduate-card"><span>READY FOR PRESSURE?</span><b>Take this mental model into a production incident.</b><button onClick={onIncident}>ENTER MISSION 01 →</button></div><button className="back-foundations" onClick={onLearn}>← REVIEW FOUNDATIONS</button></aside>
    </div>
  </section>;
}
function Slo({label,value,pass,active}:{label:string;value:string;pass:boolean;active:boolean}) { return <div className={`slo ${active?(pass?"pass":"fail"):""}`}><span>{label}</span><b>{value}</b><i>{active?(pass?"✓":"×"):"·"}</i></div>; }
function Node({number,title,metric,alert,kind}:{number:string;title:string;metric:string;alert:boolean;kind:string}) { return <div className={`pipeline-node ${kind} ${alert?"alert":""}`}><span>{number}</span><div className="node-icon">{kind==="gpu"?"▦":kind==="scheduler"?"≋":kind==="stream"?"»":"⇥"}</div><b>{title}</b><small>{metric}</small></div>; }
function Flow({active}:{active:boolean}) { return <div className={`pipeline-flow ${active?"active":""}`}><i/><i/><i/><span>→</span></div>; }
function Metric({label,value,suffix,delta,danger}:{label:string;value:string;suffix?:string;delta:string;danger?:boolean}) { return <article className={danger?"danger":""}><span>{label}</span><strong>{value}<small>{suffix}</small></strong><em>{delta}</em></article>; }
function Control({label,hint,children}:{label:string;hint:string;children:React.ReactNode}) { return <label className="control-group"><span>{label}<i>{hint}</i></span>{children}</label>; }
function Segment({values,selected,onSelect,prefix="",suffix=""}:{values:(string|number)[];selected:string|number;onSelect:(value:string|number)=>void;prefix?:string;suffix?:string}) { return <div className="segment">{values.map(value=><button key={value} className={selected===value?"selected":""} onClick={()=>onSelect(value)}>{prefix}{value}{suffix}</button>)}</div>; }
function Toggle({label,detail,checked,onChange}:{label:string;detail:string;checked:boolean;onChange:(value:boolean)=>void}) { return <button className={`infra-toggle ${checked?"on":""}`} onClick={()=>onChange(!checked)}><span><b>{label}</b><small>{detail}</small></span><i><em/></i></button>; }
