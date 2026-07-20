"use client";

import { useMemo, useState } from "react";
import { initialConfig, launchWorkload, modelForecast, simulateInference, type BatchSize, type CacheSize, type Concurrency, type InferenceConfig, type Precision } from "@/lib/inference/engine";

type View = "home" | "incident";
type Prediction = "clear" | "latency" | "oom" | "";

const formatSeconds = (ms: number) => ms ? `${(ms / 1000).toFixed(2)}s` : "—";

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [config, setConfig] = useState<InferenceConfig>(initialConfig);
  const [prediction, setPrediction] = useState<Prediction>("");
  const [forecasted, setForecasted] = useState(false);
  const [running, setRunning] = useState(false);
  const [observed, setObserved] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const forecast = useMemo(() => modelForecast(config), [config]);
  const result = useMemo(() => simulateInference(config), [config]);
  const shown = observed ? result : forecasted ? forecast : simulateInference(initialConfig);

  const update = <K extends keyof InferenceConfig>(key: K, value: InferenceConfig[K]) => {
    setConfig(current => ({ ...current, [key]: value }));
    setForecasted(false);
    setObserved(false);
  };

  const runReplay = () => {
    setRunning(true);
    setObserved(false);
    window.setTimeout(() => { setRunning(false); setObserved(true); }, 1350);
  };

  const reset = () => {
    setConfig(initialConfig); setPrediction(""); setForecasted(false); setObserved(false); setRunning(false); setAttempt(1);
  };

  return <main className="infra-app">
    <header className="infra-nav">
      <button className="infra-brand" onClick={() => setView("home")} aria-label="P99 home"><span>P/</span>P99</button>
      <div className="nav-center"><i/> INFERENCE SYSTEMS LAB</div>
      <div className="nav-actions"><span className="runtime-pill"><i/> TRACE ENGINE ONLINE</span><button onClick={() => setView("incident")}>MISSION 01</button></div>
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
            <Slo label="VRAM" value="< 24 GB" pass={!observed || !result.oom} active={observed}/>
            <Slo label="QUALITY" value="≥ 95%" pass={!observed || result.quality >= 95} active={observed}/>
            <Slo label="COST" value="≤ $1.50 / 1M" pass={!observed || result.costPerMillion <= 1.5} active={observed}/>
          </div>
          <div className="attempt-strip"><span>ATTEMPT {attempt.toString().padStart(2,"0")}</span><b>{observed ? `${result.score}/100` : "UNSCORED"}</b></div>
        </aside>

        <section className="systems-panel" aria-label="Inference serving system">
          <div className="systems-head"><div><span>LIVE SYSTEM TOPOLOGY</span><h2>inference-prod-usw2</h2></div><div className={`health ${observed && result.passed ? "healthy" : "burning"}`}><i/>{observed && result.passed ? "SLO HEALTHY" : "SLO VIOLATION"}</div></div>

          <div className="traffic-ribbon"><span>LIVE TRAFFIC</span><b>{launchWorkload.requestRate} req/s</b><i>1,200 input</i><i>96 output</i><i>67% shared prefix</i></div>

          <div className={`pipeline ${running ? "running" : ""}`}>
            <Node kind="edge" number="01" title="API GATEWAY" metric={`${shown.queueDepth} queued`} alert={shown.queueDepth > 55}/>
            <Flow active={running}/>
            <Node kind="scheduler" number="02" title="SCHEDULER" metric={`batch ${config.batchSize}`} alert={false}/>
            <Flow active={running}/>
            <Node kind="gpu" number="03" title="A10G · 24 GB" metric={`${shown.utilization}% util`} alert={shown.oom}/>
            <Flow active={running}/>
            <Node kind="stream" number="04" title="TOKEN STREAM" metric={`${shown.throughput} tok/s`} alert={shown.throughput < 230}/>
          </div>

          <div className="gpu-core">
            <div className="gpu-visual"><div className="die"><span>CUDA</span><strong>{shown.utilization}%</strong><small>{shown.powerWatts} W</small></div>{Array.from({length:24},(_,index)=><i key={index} className={index < Math.round(shown.vramGb) ? "filled" : ""}/>)}</div>
            <div className="memory-map"><div className="map-title"><span>VRAM ALLOCATION</span><b>{shown.vramGb} / 24 GB</b></div><div className="memory-bar"><i style={{width:`${Math.min(100, shown.vramGb / 24 * 100)}%`}}/></div><div className="memory-legend"><span><i className="weights"/>WEIGHTS</span><span><i className="cache"/>KV CACHE</span><span><i className="runtime"/>RUNTIME</span></div></div>
          </div>

          <div className="metric-grid">
            <Metric label="TIME TO FIRST TOKEN" value={formatSeconds(shown.ttftMs)} delta={observed ? `${Math.abs(result.ttftMs-forecast.ttftMs)}ms model error` : "model forecast"}/>
            <Metric label="P95 END-TO-END" value={formatSeconds(shown.p95Ms)} danger={shown.p95Ms > 4000} delta="target ≤ 4.00s"/>
            <Metric label="THROUGHPUT" value={`${shown.throughput}`} suffix="tok/s" danger={shown.throughput < 230} delta="demand 230 tok/s"/>
            <Metric label="QUEUE DEPTH" value={`${shown.queueDepth}`} danger={shown.queueDepth > 55} delta="requests waiting"/>
          </div>

          {running && <div className="run-overlay"><div className="scanline"/><span>REPLAYING PRODUCTION TRACE</span><b>Prefill → decode → stream</b></div>}
          {observed && <div className={`incident-verdict ${result.passed ? "contained" : "failed"}`}><span>{result.passed ? "✓" : "!"}</span><div><small>{result.passed ? "INCIDENT CONTAINED" : "SLO STILL BURNING"}</small><b>{result.passed ? "The queue is draining with quality intact." : result.bottleneck}</b></div><strong>{result.score}/100</strong></div>}
        </section>

        <aside className="control-panel">
          <div className="panel-index">02 / INTERVENE</div>
          <h2>Change the serving stack.</h2>
          <Control label="WEIGHT PRECISION" hint="memory ↔ quality"><Segment values={["FP16","INT8","INT4"]} selected={config.precision} onSelect={value=>update("precision",value as Precision)}/></Control>
          <Control label="CONTINUOUS BATCH" hint="latency ↔ throughput"><Segment values={[1,8,16]} selected={config.batchSize} onSelect={value=>update("batchSize",value as BatchSize)} prefix="B"/></Control>
          <Control label="KV CACHE BUDGET" hint="capacity"><Segment values={[6,10,14]} selected={config.cacheGb} onSelect={value=>update("cacheGb",value as CacheSize)} suffix="GB"/></Control>
          <Control label="CONCURRENCY CAP" hint="queue pressure"><Segment values={[4,12,24]} selected={config.concurrency} onSelect={value=>update("concurrency",value as Concurrency)} prefix="C"/></Control>
          <Toggle label="PREFIX CACHING" detail="Reuse the shared system prompt" checked={config.prefixCache} onChange={value=>update("prefixCache",value)}/>
          <Toggle label="SPECULATIVE DECODING" detail="Draft tokens, verify in parallel" checked={config.speculative} onChange={value=>update("speculative",value)}/>

          <div className="prediction-block"><span>COMMIT YOUR PREDICTION</span><div><button className={prediction==="clear"?"selected":""} onClick={()=>setPrediction("clear")}>Queue clears</button><button className={prediction==="latency"?"selected":""} onClick={()=>setPrediction("latency")}>Latency fails</button><button className={prediction==="oom"?"selected":""} onClick={()=>setPrediction("oom")}>GPU OOMs</button></div></div>

          <div className="run-actions"><button className="forecast-button" disabled={!prediction || running} onClick={()=>{setForecasted(true);setObserved(false)}}>{forecasted ? "REFRESH SYSTEM MODEL" : "SIMULATE OUTCOME"}</button><button className="deploy-button" disabled={!forecasted || running} onClick={()=>{runReplay();setAttempt(current=>current+1)}}>{running ? "REPLAYING TRACE…" : "RUN TRAFFIC REPLAY →"}</button></div>
          <p className="truth-note"><i/> The system model forecasts first. The trace engine grades it against the workload.</p>
        </aside>
      </div>
    </section>}
  </main>;
}

function Landing({onEnter}:{onEnter:()=>void}) {
  return <section className="infra-home">
    <div className="home-grid">
      <div className="home-copy"><div className="home-kicker"><span>THE FLIGHT SIMULATOR FOR</span> AI INFRASTRUCTURE</div><h1>Break the stack.<br/><em>Learn why.</em></h1><p>Master LLM inference by fighting production incidents—not watching another architecture lecture.</p><div className="home-actions"><button onClick={onEnter}>ENTER THE INCIDENT <span>↗</span></button><small><i/> NO GPU REQUIRED · LIVE SYSTEM MODEL</small></div><div className="home-proof"><div><b>01</b><span>PREDICT</span><small>Commit to the failure mode</small></div><div><b>02</b><span>INTERVENE</span><small>Tune the serving stack</small></div><div><b>03</b><span>REPLAY</span><small>Watch the system respond</small></div><div><b>04</b><span>DIAGNOSE</span><small>Explain the bottleneck</small></div></div></div>
      <div className="home-console" aria-label="Live AI inference infrastructure incident"><div className="console-top"><span>PRODUCTION / US-WEST-2</span><b><i/> INCIDENT ACTIVE</b></div><div className="console-alert"><span>P95 LATENCY</span><strong>14.82<small>s</small></strong><em>+1,184%</em></div><div className="console-chart"><div className="chart-target">SLO 4.00s</div>{[18,22,20,34,31,45,68,57,82,74,92,86,96,89,94,91].map((height,index)=><i key={index} style={{height:`${height}%`}}/> )}</div><div className="console-pipeline"><span>2.4 req/s</span><i>→</i><b>QUEUE <em>389</em></b><i>→</i><b>GPU <em>97%</em></b><i>→</i><span>79 tok/s</span></div><div className="console-rack"><div className="rack-chip"><small>NVIDIA</small><strong>A10G</strong><span>24 GB</span></div><div className="rack-memory"><span>VRAM</span><b>23.6 / 24 GB</b><i><em/></i></div><div className="rack-log"><span>12:04:18</span> decode capacity saturated<br/><span>12:04:19</span> queue depth +47<br/><span>12:04:21</span> p95 budget exceeded<br/><b>▮</b></div></div></div>
    </div>
    <div className="mission-ticker"><span>MISSION 01</span><b>THE LAUNCH-DAY INCIDENT</b><i/> Quantization <i/> Continuous batching <i/> KV cache <i/> Speculative decoding <button onClick={onEnter}>START →</button></div>
  </section>;
}

function Slo({label,value,pass,active}:{label:string;value:string;pass:boolean;active:boolean}) { return <div className={`slo ${active?(pass?"pass":"fail"):""}`}><span>{label}</span><b>{value}</b><i>{active?(pass?"✓":"×"):"·"}</i></div>; }
function Node({number,title,metric,alert,kind}:{number:string;title:string;metric:string;alert:boolean;kind:string}) { return <div className={`pipeline-node ${kind} ${alert?"alert":""}`}><span>{number}</span><div className="node-icon">{kind==="gpu"?"▦":kind==="scheduler"?"≋":kind==="stream"?"»":"⇥"}</div><b>{title}</b><small>{metric}</small></div>; }
function Flow({active}:{active:boolean}) { return <div className={`pipeline-flow ${active?"active":""}`}><i/><i/><i/><span>→</span></div>; }
function Metric({label,value,suffix,delta,danger}:{label:string;value:string;suffix?:string;delta:string;danger?:boolean}) { return <article className={danger?"danger":""}><span>{label}</span><strong>{value}<small>{suffix}</small></strong><em>{delta}</em></article>; }
function Control({label,hint,children}:{label:string;hint:string;children:React.ReactNode}) { return <label className="control-group"><span>{label}<i>{hint}</i></span>{children}</label>; }
function Segment({values,selected,onSelect,prefix="",suffix=""}:{values:(string|number)[];selected:string|number;onSelect:(value:string|number)=>void;prefix?:string;suffix?:string}) { return <div className="segment">{values.map(value=><button key={value} className={selected===value?"selected":""} onClick={()=>onSelect(value)}>{prefix}{value}{suffix}</button>)}</div>; }
function Toggle({label,detail,checked,onChange}:{label:string;detail:string;checked:boolean;onChange:(value:boolean)=>void}) { return <button className={`infra-toggle ${checked?"on":""}`} onClick={()=>onChange(!checked)}><span><b>{label}</b><small>{detail}</small></span><i><em/></i></button>; }
