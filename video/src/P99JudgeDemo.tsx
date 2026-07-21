import React from "react";
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Brand, Close, CodexScene, Grid, Hook, Progress, ShotScene, acid, cyan, line, red, shots} from "./P99FastDemo";

const bg = "#04070b";
const text = "#edf3f5";
const muted = "#82909a";

const panelFade = (frame: number, duration: number) => interpolate(
  frame,
  [0, 8, duration - 8, duration],
  [0, 1, 1, 0],
  {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
);

export const MeasuredSignals = ({duration}: {duration: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const metrics = [
    ["TTFT", "first token"],
    ["P95", "tail latency"],
    ["TOKENS/S", "throughput"],
    ["QUEUE", "pressure"],
    ["VRAM", "memory"],
    ["POWER", "watts"],
  ];
  return <AbsoluteFill style={{background: `radial-gradient(circle at 72% 38%,#163b37,transparent 36%),${bg}`, color: text, opacity: panelFade(frame, duration)}}>
    <Grid/>
    <div style={{position: "absolute", left: 92, right: 92, top: 58, display: "flex", justifyContent: "space-between", alignItems: "center"}}><Brand/><span style={{color: cyan, font: "900 12px ui-monospace,monospace", letterSpacing: 2.5}}>OPTIONAL MEASURED RUNNER</span></div>
    <div style={{position: "absolute", left: 115, right: 115, top: 200}}>
      <span style={{color: acid, font: "900 13px ui-monospace,monospace", letterSpacing: 3}}>WHEN COMPUTE IS CONNECTED</span>
      <h2 style={{margin: "22px 0 0", font: "950 72px/.91 Inter,Arial", letterSpacing: -4.5}}>READ THE RESULTS<br/><i style={{fontStyle: "normal", color: acid}}>FROM THE HARDWARE.</i></h2>
      <div style={{display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginTop: 65}}>{metrics.map(([metric,detail],index) => {const item=spring({frame:frame-index*7,fps,config:{damping:15,stiffness:115}}); return <article key={metric} style={{minHeight: 185, padding: 23, border: `1px solid ${line}`, borderRadius: 12, background: "#091018", opacity:item, transform:`translateY(${(1-item)*28}px)`}}><span style={{color: index < 2 ? acid : cyan, font: "900 13px ui-monospace,monospace"}}>{String(index+1).padStart(2,"0")}</span><b style={{display: "block", marginTop: 50, font: "950 18px ui-monospace,monospace"}}>{metric}</b><small style={{display: "block", marginTop: 12, color: muted, font: "600 14px Inter,Arial"}}>{detail}</small></article>})}</div>
      <div style={{marginTop: 24, padding: "17px 22px", border: `1px solid ${red}77`, borderRadius: 9, color: red, font: "850 13px ui-monospace,monospace", letterSpacing: 1.4}}>MODEL QUALITY REMAINS A SEPARATE EVALUATION</div>
    </div>
  </AbsoluteFill>;
};

export const TodayNext = ({duration}: {duration: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const today = ["6 guided foundations", "Committed prediction loop", "Experiment specification", "Optional measured runner path"];
  const next = ["Bring your own local compute", "Cloud and university runners", "Learned dynamics from diverse traces"];
  const Column = ({label, items, accent}: {label: string; items: string[]; accent: string}) => <section style={{padding: 34, border: `1px solid ${accent}66`, borderRadius: 15, background: "#091018"}}><span style={{color: accent, font: "900 13px ui-monospace,monospace", letterSpacing: 2.5}}>{label}</span><div style={{marginTop: 28}}>{items.map((item,index) => {const enter=spring({frame:frame-index*8,fps,config:{damping:15,stiffness:115}}); return <div key={item} style={{minHeight: 82, display: "grid", gridTemplateColumns: "38px 1fr", alignItems: "center", borderTop: index ? `1px solid ${line}` : undefined, opacity:enter, transform:`translateX(${(1-enter)*26}px)`}}><b style={{color: accent, font: "900 17px ui-monospace,monospace"}}>{label === "WORKING TODAY" ? "✓" : "→"}</b><span style={{font: "800 18px Inter,Arial"}}>{item}</span></div>})}</div></section>;
  return <AbsoluteFill style={{background: `radial-gradient(circle at 52% 46%,#143332,transparent 40%),${bg}`, color: text, opacity: panelFade(frame,duration)}}><Grid/><div style={{position: "absolute", left: 92, right: 92, top: 58, display: "flex", justifyContent: "space-between", alignItems: "center"}}><Brand/><span style={{color: muted, font: "850 12px ui-monospace,monospace", letterSpacing: 2}}>CURRENT PRODUCT BOUNDARY</span></div><div style={{position: "absolute", left: 115, right: 115, top: 165}}><h2 style={{margin: 0, font: "950 68px/.94 Inter,Arial", letterSpacing: -4}}>WHAT IS REAL NOW.<br/><i style={{color: acid, fontStyle: "normal"}}>WHAT COMES NEXT.</i></h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginTop:48}}><Column label="WORKING TODAY" items={today} accent={acid}/><Column label="NEXT" items={next} accent={cyan}/></div></div></AbsoluteFill>;
};

export const P99JudgeDemo = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: bg}}>
    <Audio src={staticFile("audio/p99-judge-voiceover.mp3")} playbackRate={1.04} volume={1}/>
    <Audio src={staticFile("audio/p99-ambient.m4a")} loop volume={0.12}/>
    <Progress progress={frame / 2699}/>
    <Sequence from={0} durationInFrames={90}><Hook duration={90}/></Sequence>
    <Sequence from={90} durationInFrames={180}><ShotScene shot={shots.landing} duration={180} step="P99" headline="Concepts become decisions." detail="An inference engineering playground built for active learning."/></Sequence>
    <Sequence from={270} durationInFrames={210}><ShotScene shot={shots.primer} duration={210} step="01 · REQUEST LIFECYCLE" headline="Follow one request." detail="Queue → prefill → decode → stream" cursor={{x: 1348, y: 510, clickAt: 72}}/></Sequence>
    <Sequence from={480} durationInFrames={180}><ShotScene shot={shots.hypothesis} duration={180} step="02 · PREDICT" headline="Commit before the reveal." detail="Choose the signal that should change first." cursor={{x: 638, y: 676, clickAt: 76}}/></Sequence>
    <Sequence from={660} durationInFrames={90}><ShotScene shot={shots.committed} duration={90} step="HYPOTHESIS LOCKED" headline="Time to first token." detail="Now the learner has something to test." cursor={{x: 637, y: 676, clickAt: 20}}/></Sequence>
    <Sequence from={750} durationInFrames={120}><ShotScene shot={shots.feedback} duration={120} step="03 · CAUSAL FEEDBACK" headline="Explain why." detail="Prefix caching avoids repeated prefill work."/></Sequence>
    <Sequence from={870} durationInFrames={240}><ShotScene shot={shots.playground} duration={240} step="04 · EXPERIMENT" headline="Change one variable." detail="Precision, batching, cache, concurrency, and decoding." cursor={{x: 202, y: 375, clickAt: 95}}/></Sequence>
    <Sequence from={1110} durationInFrames={180}><ShotScene shot={shots.experiment} duration={180} step="REPRODUCIBLE BY DESIGN" headline="Turn choices into a spec." detail="Hold the model, prompts, workload, and hardware constant." cursor={{x: 198, y: 636, clickAt: 64}}/></Sequence>
    <Sequence from={1290} durationInFrames={270}><ShotScene shot={shots.incident} duration={270} step="05 · MEASURE" headline="Connect compute to measure." detail="Run the experiment on local or cloud hardware." accent={cyan} cursor={{x: 1700, y: 183, clickAt: 85}}/></Sequence>
    <Sequence from={1560} durationInFrames={240}><MeasuredSignals duration={240}/></Sequence>
    <Sequence from={1800} durationInFrames={360}><CodexScene duration={360}/></Sequence>
    <Sequence from={2160} durationInFrames={360}><TodayNext duration={360}/></Sequence>
    <Sequence from={2520} durationInFrames={180}><Close duration={180}/></Sequence>
  </AbsoluteFill>;
};
