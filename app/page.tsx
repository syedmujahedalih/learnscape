"use client";

import { useEffect, useMemo, useState } from "react";
import { initialConfig, launchWorkload, simulateInference, type BatchSize, type CacheSize, type Concurrency, type InferenceConfig, type InferenceMetrics, type Precision } from "@/lib/inference/engine";
import type { CloudBenchmarkStatus } from "@/lib/inference/trace";
import { forecastWorld, worldModelInfo } from "@/lib/inference/world-model";

type View = "home" | "incident";
type Prediction = "clear" | "latency" | "oom" | "";
type ExecutionMode = "reference" | "cloud";
type CloudGpu = "T4" | "L4" | "A10";

const formatSeconds = (ms: number) => ms ? `${(ms / 1000).toFixed(2)}s` : "—";
const gpuMemory = (gpu: CloudGpu) => gpu === "T4" ? 16 : 24;
const maxCost = { T4: .12, L4: .16, A10: .22 } as const;

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

  const rollout = useMemo(() => forecastWorld(config), [config]);
  const forecast = rollout.metrics;
  const referenceResult = useMemo(() => simulateInference(config), [config]);
  const result = executionMode === "cloud" && cloudResult ? cloudResult : referenceResult;
  const shown = observed ? result : forecasted ? forecast : simulateInference(initialConfig);
  const capacityGb = executionMode === "cloud" ? gpuMemory(cloudGpu) : 24;

  useEffect(() => {
    fetch("/api/benchmark").then(response => response.json()).then(data => setCloudConfigured(Boolean(data.configured))).catch(() => setCloudConfigured(false));
  }, []);

  const update = <K extends keyof InferenceConfig>(key: K, value: InferenceConfig[K]) => {
    setConfig(current => ({ ...current, [key]: value }));
    setForecasted(false); setObserved(false); setCloudResult(null); setCloudError("");
  };

  const runReference = () => {
    setRunning(true); setObserved(false); setCloudError(""); setCloudStatus("running");
    window.setTimeout(() => { setRunning(false); setObserved(true); setCloudStatus("completed"); }, 1350);
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
      <div className="nav-center"><i/> INFERENCE SYSTEMS LAB</div>
      <div className="nav-actions"><span className="runtime-pill"><i/> WORLD MODEL ONLINE</span><button onClick={() => setView("incident")}>MISSION 01</button></div>
    </header>

    {view === "home" ? <Landing onEnter={() => setView("incident")} /> : <section className="incident-view">
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
            <Metric label="TIME TO FIRST TOKEN" value={formatSeconds(shown.ttftMs)} delta={observed ? `${Math.abs(result.ttftMs-forecast.ttftMs)}ms forecast error` : "world model forecast"}/>
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
          <div className="run-actions"><button className="forecast-button" disabled={!prediction || running} onClick={()=>{setForecasted(true);setObserved(false)}}>{forecasted ? "ROLL OUT AGAIN" : "ROLL OUT WORLD MODEL"}</button><button className="deploy-button" disabled={!forecasted || running || (executionMode === "cloud" && !cloudConfigured)} onClick={run}>{running ? executionMode === "cloud" ? "BENCHMARK RUNNING…" : "REPLAYING TRACE…" : executionMode === "cloud" ? `LAUNCH ${cloudGpu} BENCHMARK →` : "REPLAY REFERENCE TRACE →"}</button></div>
          {cloudError && <p className="cloud-error">{cloudError}</p>}
          <div className="model-provenance"><span>NEXT-STATE MODEL</span><b>{worldModelInfo.architecture}</b><small>{worldModelInfo.parameters} parameters · {worldModelInfo.transitions.toLocaleString()} transitions · RMSE {worldModelInfo.validationRmse}</small><em>{worldModelInfo.source === "bootstrap_synthetic" ? "BOOTSTRAP TRACE CORPUS" : "MEASURED TRACE CORPUS"}</em></div>
          <p className="truth-note"><i/> The learned model forecasts first. A labeled reference trace or an optional real GPU run grades it.</p>
        </aside>
      </div>
    </section>}
  </main>;
}

function Landing({onEnter}:{onEnter:()=>void}) { return <section className="infra-home"><div className="home-grid"><div className="home-copy"><div className="home-kicker"><span>THE FLIGHT SIMULATOR FOR</span> AI INFRASTRUCTURE</div><h1>Break the stack.<br/><em>Learn why.</em></h1><p>Master LLM inference by fighting production incidents—not watching another architecture lecture.</p><div className="home-actions"><button onClick={onEnter}>ENTER THE INCIDENT <span>↗</span></button><small><i/> LEARNED DYNAMICS · GPU TRACES OPTIONAL</small></div><div className="home-proof"><div><b>01</b><span>PREDICT</span><small>Commit to the failure mode</small></div><div><b>02</b><span>INTERVENE</span><small>Tune the serving stack</small></div><div><b>03</b><span>ROLL OUT</span><small>Watch the state evolve</small></div><div><b>04</b><span>VALIDATE</span><small>Challenge it with a trace</small></div></div></div><div className="home-console" aria-label="Live AI inference infrastructure incident"><div className="console-top"><span>PRODUCTION / US-WEST-2</span><b><i/> INCIDENT ACTIVE</b></div><div className="console-alert"><span>P95 LATENCY</span><strong>14.82<small>s</small></strong><em>+1,184%</em></div><div className="console-chart"><div className="chart-target">SLO 4.00s</div>{[18,22,20,34,31,45,68,57,82,74,92,86,96,89,94,91].map((height,index)=><i key={index} style={{height:`${height}%`}}/> )}</div><div className="console-pipeline"><span>2.4 req/s</span><i>→</i><b>QUEUE <em>389</em></b><i>→</i><b>GPU <em>97%</em></b><i>→</i><span>79 tok/s</span></div><div className="console-rack"><div className="rack-chip"><small>NVIDIA</small><strong>A10G</strong><span>24 GB</span></div><div className="rack-memory"><span>VRAM</span><b>23.6 / 24 GB</b><i><em/></i></div><div className="rack-log"><span>12:04:18</span> decode capacity saturated<br/><span>12:04:19</span> queue depth +47<br/><span>12:04:21</span> p95 budget exceeded<br/><b>▮</b></div></div></div></div><div className="mission-ticker"><span>MISSION 01</span><b>THE LAUNCH-DAY INCIDENT</b><i/> Quantization <i/> Continuous batching <i/> KV cache <i/> Speculative decoding <button onClick={onEnter}>START →</button></div></section>; }
function Slo({label,value,pass,active}:{label:string;value:string;pass:boolean;active:boolean}) { return <div className={`slo ${active?(pass?"pass":"fail"):""}`}><span>{label}</span><b>{value}</b><i>{active?(pass?"✓":"×"):"·"}</i></div>; }
function Node({number,title,metric,alert,kind}:{number:string;title:string;metric:string;alert:boolean;kind:string}) { return <div className={`pipeline-node ${kind} ${alert?"alert":""}`}><span>{number}</span><div className="node-icon">{kind==="gpu"?"▦":kind==="scheduler"?"≋":kind==="stream"?"»":"⇥"}</div><b>{title}</b><small>{metric}</small></div>; }
function Flow({active}:{active:boolean}) { return <div className={`pipeline-flow ${active?"active":""}`}><i/><i/><i/><span>→</span></div>; }
function Metric({label,value,suffix,delta,danger}:{label:string;value:string;suffix?:string;delta:string;danger?:boolean}) { return <article className={danger?"danger":""}><span>{label}</span><strong>{value}<small>{suffix}</small></strong><em>{delta}</em></article>; }
function Control({label,hint,children}:{label:string;hint:string;children:React.ReactNode}) { return <label className="control-group"><span>{label}<i>{hint}</i></span>{children}</label>; }
function Segment({values,selected,onSelect,prefix="",suffix=""}:{values:(string|number)[];selected:string|number;onSelect:(value:string|number)=>void;prefix?:string;suffix?:string}) { return <div className="segment">{values.map(value=><button key={value} className={selected===value?"selected":""} onClick={()=>onSelect(value)}>{prefix}{value}{suffix}</button>)}</div>; }
function Toggle({label,detail,checked,onChange}:{label:string;detail:string;checked:boolean;onChange:(value:boolean)=>void}) { return <button className={`infra-toggle ${checked?"on":""}`} onClick={()=>onChange(!checked)}><span><b>{label}</b><small>{detail}</small></span><i><em/></i></button>; }
