import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const bg = "#05080d";
const panel = "#0b1118";
const line = "#26333e";
const text = "#e7eef2";
const muted = "#7d8b98";
const acid = "#b7ff5e";
const cyan = "#58d9ff";
const amber = "#ffba61";

const fade = (frame: number, duration: number) => interpolate(frame, [0, 14, duration - 14, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Grid = () => <AbsoluteFill style={{ opacity: .45, backgroundImage: "linear-gradient(rgba(88,217,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(88,217,255,.045) 1px,transparent 1px)", backgroundSize: "42px 42px", maskImage: "radial-gradient(circle at 50% 45%,black,transparent 78%)" }}/>;

const Mark = () => <div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 42, height: 42, borderRadius: 7, display: "grid", placeItems: "center", background: acid, color: bg, font: "900 17px ui-monospace,monospace" }}>P/</div><b style={{ color: text, font: "900 27px Inter,Arial" }}>P99</b></div>;

const Chrome = ({ label, status = "MEASURED RUNS ONLY" }: { label: string; status?: string }) => <div style={{ position: "absolute", zIndex: 20, left: 70, right: 70, top: 43, display: "flex", justifyContent: "space-between", alignItems: "center" }}><Mark/><div style={{ display: "flex", alignItems: "center", gap: 12, color: muted, font: "800 11px ui-monospace,monospace", letterSpacing: 2.2 }}><span>{label}</span><i style={{ width: 6, height: 6, borderRadius: 99, background: acid, boxShadow: `0 0 14px ${acid}` }}/><span style={{ color: text }}>{status}</span></div></div>;

const Frame = ({ children, duration, label, status }: { children: React.ReactNode; duration: number; label: string; status?: string }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 70% 35%,#12363a,transparent 38%),${bg}`, color: text, opacity: fade(frame, duration), overflow: "hidden" }}><Grid/><Chrome label={label} status={status}/>{children}</AbsoluteFill>;
};

const Opening = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 17, stiffness: 80 } });
  return <Frame duration={duration} label="OPENAI BUILD WEEK · EDUCATION"><div style={{ position: "absolute", left: 120, right: 120, top: 250, opacity: enter, transform: `translateY(${(1-enter)*45}px)` }}><div style={{ color: cyan, font: "850 14px ui-monospace,monospace", letterSpacing: 4 }}>THE HANDS-ON PLAYGROUND FOR INFERENCE ENGINEERING</div><h1 style={{ margin: "28px 0 0", maxWidth: 1500, font: "900 108px/.88 Inter,Arial", letterSpacing: -7 }}>LEARN THE STACK.<br/><span style={{ color: acid }}>MEASURE WHAT HAPPENS.</span></h1><p style={{ width: 950, marginTop: 40, color: "#aab7c0", font: "450 28px/1.5 Inter,Arial" }}>Concepts become controlled experiments. Results come from connected compute.</p></div></Frame>;
};

const Foundations = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const concepts = ["TAIL LATENCY", "BATCHING", "KV CACHE", "QUANTIZATION", "CONCURRENCY", "SPECULATIVE DECODING"];
  return <Frame duration={duration} label="01 · FOUNDATIONS" status="BEGINNER FRIENDLY"><div style={{ position: "absolute", left: 110, right: 110, top: 165 }}><div style={{ color: cyan, font: "850 13px ui-monospace,monospace", letterSpacing: 3 }}>BUILD THE MENTAL MODEL</div><h2 style={{ margin: "18px 0 0", font: "900 66px/.96 Inter,Arial", letterSpacing: -4 }}>One concept. One change.<br/><span style={{ color: acid }}>The right signals to observe.</span></h2><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 15, marginTop: 62 }}>{concepts.map((concept,index) => { const item = spring({ frame: frame-index*7, fps, config: { damping: 17, stiffness: 95 } }); return <article key={concept} style={{ height: 205, padding: 27, border: `1px solid ${line}`, borderRadius: 13, background: panel, opacity: item, transform: `translateY(${(1-item)*28}px)` }}><span style={{ color: index === 0 ? acid : "#53626f", font: "900 11px ui-monospace,monospace" }}>{String(index+1).padStart(2,"0")}</span><b style={{ display: "block", marginTop: 50, font: "850 21px ui-monospace,monospace" }}>{concept}</b><small style={{ display: "block", marginTop: 13, color: muted, font: "500 15px Inter,Arial" }}>predict → change → measure</small></article>; })}</div></div></Frame>;
};

const Experiment = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 17, stiffness: 85 } });
  const controls = [["PRECISION","INT8"],["BATCH","8"],["KV CACHE","10 GB"],["CONCURRENCY","12"],["PREFIX CACHE","ON"],["SPECULATIVE","ON"]];
  return <Frame duration={duration} label="02 · EXPERIMENT BUILDER" status="NO SYNTHETIC OUTPUT"><div style={{ position: "absolute", left: 105, right: 105, top: 160, display: "grid", gridTemplateColumns: ".85fr 1.15fr", gap: 28, opacity: enter }}><section><div style={{ color: cyan, font: "850 13px ui-monospace,monospace", letterSpacing: 3 }}>CHANGE ONE VARIABLE</div><h2 style={{ margin: "20px 0 35px", font: "900 62px/.95 Inter,Arial", letterSpacing: -4 }}>Build a test<br/><span style={{ color: acid }}>someone can repeat.</span></h2><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>{controls.map(([name,value]) => <div key={name} style={{ padding: 21, border: `1px solid ${line}`, borderRadius: 9, background: panel }}><span style={{ display: "block", color: muted, font: "800 10px ui-monospace,monospace", letterSpacing: 1.4 }}>{name}</span><b style={{ display: "block", marginTop: 13, color: acid, font: "900 24px ui-monospace,monospace" }}>{value}</b></div>)}</div></section><section style={{ padding: 35, border: `1px solid ${line}`, borderRadius: 16, background: "rgba(8,13,19,.94)" }}><div style={{ display: "flex", justifyContent: "space-between", color: muted, font: "800 11px ui-monospace,monospace", letterSpacing: 1.6 }}><span>EXPERIMENT SPEC</span><b style={{ color: amber }}>AWAITING RUNTIME</b></div><div style={{ height: 155, marginTop: 35, display: "flex", alignItems: "center", justifyContent: "space-around", border: `1px solid ${line}`, borderRadius: 10, color: text, font: "850 13px ui-monospace,monospace" }}><span>CONFIG</span><i style={{ color: muted }}>→</i><span>RUNTIME</span><i style={{ color: muted }}>→</i><span>TRACE</span><i style={{ color: muted }}>→</i><span>COMPARE</span></div><div style={{ marginTop: 22, padding: 27, borderLeft: `3px solid ${acid}`, background: "#0e161c" }}><span style={{ color: acid, font: "850 11px ui-monospace,monospace", letterSpacing: 2 }}>THE PRODUCT RULE</span><strong style={{ display: "block", marginTop: 18, font: "850 36px/1.1 Inter,Arial", letterSpacing: -1.5 }}>No runtime means<br/>no benchmark number.</strong><p style={{ marginTop: 20, color: muted, font: "450 20px/1.5 Inter,Arial" }}>The playground exports a reproducible specification. It does not fabricate the result.</p></div></section></div></Frame>;
};

const Runtime = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nodes = [["01","HYPOTHESIS","Commit to an outcome"],["02","GPU RUNNER","T4 · L4 · A10G"],["03","LLAMA.CPP","Fixed workload"],["04","MEASURED TRACE","Latency · tokens · VRAM"]];
  return <Frame duration={duration} label="03 · MEASURED INCIDENT LAB" status="OPTIONAL RUNNER"><div style={{ position: "absolute", left: 115, right: 115, top: 180 }}><div style={{ color: cyan, font: "850 13px ui-monospace,monospace", letterSpacing: 3 }}>WHEN COMPUTE IS CONNECTED</div><h2 style={{ margin: "20px 0 0", font: "900 70px/.94 Inter,Arial", letterSpacing: -4 }}>Commit. Run. Inspect.<br/><span style={{ color: acid }}>Reality grades the hypothesis.</span></h2><div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginTop: 70 }}>{nodes.map(([id,title,copy],index) => { const item = spring({ frame: frame-index*9, fps, config: { damping: 17, stiffness: 92 } }); return <article key={id} style={{ minHeight: 260, padding: 28, border: `1px solid ${index===3 ? acid : line}`, borderRadius: 14, background: panel, opacity: item, transform: `translateX(${(1-item)*30}px)` }}><span style={{ color: index===3 ? acid : cyan, font: "900 12px ui-monospace,monospace" }}>{id}</span><b style={{ display: "block", marginTop: 70, font: "900 22px ui-monospace,monospace" }}>{title}</b><p style={{ marginTop: 16, color: muted, font: "450 17px/1.5 Inter,Arial" }}>{copy}</p></article>; })}</div><div style={{ marginTop: 34, padding: "19px 25px", border: `1px solid ${amber}66`, borderRadius: 9, color: amber, font: "800 13px ui-monospace,monospace", letterSpacing: 1.4 }}>QUALITY IS A SEPARATE EVALUATION · PERFORMANCE TRACES DO NOT PROVE MODEL QUALITY</div></div></Frame>;
};

const Future = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const paths = [["LOCAL","llama.cpp on a Mac or workstation"],["CLOUD","GPU providers and university clusters"],["LATER","A world model trained on measured transitions"]];
  return <Frame duration={duration} label="FUTURE WORK" status="EXPLICITLY NOT SHIPPED"><div style={{ position: "absolute", left: 120, right: 120, top: 185 }}><div style={{ color: amber, font: "900 13px ui-monospace,monospace", letterSpacing: 3 }}>THE NEXT PRODUCT MOAT</div><h2 style={{ margin: "22px 0 0", font: "900 72px/.94 Inter,Arial", letterSpacing: -4 }}>Bring your own environment.<br/><span style={{ color: acid }}>Learn from measured traces.</span></h2><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 70 }}>{paths.map(([title,copy],index) => { const item = spring({ frame: frame-index*11, fps, config: { damping: 17, stiffness: 95 } }); return <article key={title} style={{ minHeight: 285, padding: 31, border: `1px solid ${index===2 ? acid : line}`, borderRadius: 15, background: panel, opacity: item, transform: `translateY(${(1-item)*32}px)` }}><span style={{ color: index===2 ? acid : cyan, font: "900 12px ui-monospace,monospace", letterSpacing: 2 }}>{String(index+1).padStart(2,"0")}</span><b style={{ display: "block", marginTop: 56, font: "900 28px ui-monospace,monospace" }}>{title}</b><p style={{ marginTop: 22, color: "#9aa8b2", font: "450 20px/1.5 Inter,Arial" }}>{copy}</p></article>; })}</div></div></Frame>;
};

const Codex = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tasks = ["PRESSURE-TEST IDEA", "PIVOT PRODUCT", "IMPLEMENT", "TEST", "DOCUMENT", "DEPLOY FROM DESKTOP + PHONE"];
  return <Frame duration={duration} label="BUILT WITH CODEX + GPT-5.6" status="OPENAI BUILD WEEK"><div style={{ position: "absolute", left: 120, right: 120, top: 180, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 90 }}><section><div style={{ color: acid, font: "900 13px ui-monospace,monospace", letterSpacing: 3 }}>THE BUILD PROCESS</div><h2 style={{ margin: "24px 0 0", font: "900 72px/.94 Inter,Arial", letterSpacing: -4 }}>From rough idea<br/>to honest product.</h2><p style={{ width: 700, marginTop: 34, color: "#a4b1ba", font: "450 24px/1.55 Inter,Arial" }}>Codex with GPT-5.6 helped shape the pivot, implement the experience, test the boundary, document the limits, and deploy it.</p></section><section style={{ padding: 25, border: `1px solid ${line}`, borderRadius: 15, background: panel }}>{tasks.map((task,index) => { const item = spring({ frame: frame-index*8, fps, config: { damping: 17, stiffness: 100 } }); return <div key={task} style={{ height: 103, display: "grid", gridTemplateColumns: "45px 1fr auto", alignItems: "center", borderTop: index ? `1px solid ${line}` : undefined, opacity: item, transform: `translateX(${(1-item)*25}px)` }}><span style={{ color: muted, font: "800 11px ui-monospace,monospace" }}>{String(index+1).padStart(2,"0")}</span><b style={{ font: "850 14px ui-monospace,monospace", letterSpacing: 1.2 }}>{task}</b><span style={{ color: acid, font: "900 17px ui-monospace,monospace" }}>✓</span></div>; })}</section></div></Frame>;
};

const Closing = ({ duration }: { duration: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 78 } });
  return <Frame duration={duration} label="P99"><div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", opacity: enter }}><div><h2 style={{ margin: 0, font: "900 92px/.9 Inter,Arial", letterSpacing: -6 }}>LEARN THE STACK.<br/><span style={{ color: acid }}>MEASURE WHAT HAPPENS.</span></h2><p style={{ marginTop: 40, color: "#aab7c0", font: "450 24px Inter,Arial" }}>Foundations · Experiment builder · Measured incident lab</p><div style={{ display: "inline-block", marginTop: 55, padding: "17px 24px", border: `1px solid ${line}`, borderRadius: 9, color: cyan, font: "850 13px ui-monospace,monospace" }}>learnscape-education.syedmujahedalih.chatgpt.site</div></div></div></Frame>;
};

const captions = [
  [20, 250, "LEARN THE INFERENCE STACK"],
  [390, 360, "ONE CONCEPT · ONE CONTROLLED CHANGE"],
  [970, 390, "NO RUNTIME · NO BENCHMARK NUMBER"],
  [1540, 390, "REAL COMPUTE GRADES THE HYPOTHESIS"],
  [2140, 300, "BRING YOUR OWN LOCAL OR CLOUD ENVIRONMENT"],
  [2580, 300, "BUILT WITH CODEX + GPT-5.6"],
] as const;

const Caption = ({ text: caption, duration }: { text: string; duration: number }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, duration-8, duration], [0,1,1,0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", zIndex: 80, left: 0, right: 0, top: 105, display: "flex", justifyContent: "center", opacity }}><div style={{ padding: "13px 22px", border: "1px solid rgba(255,255,255,.14)", borderRadius: 10, background: "rgba(3,6,10,.84)", color: text, font: "950 32px Inter,Arial", letterSpacing: -1 }}>{caption}</div></div>;
};

export const P99Demo = () => <AbsoluteFill style={{ background: bg }}>
  <Audio src={staticFile("audio/p99-voiceover.mp3")} volume={1}/>
  <Audio src={staticFile("audio/p99-ambient.m4a")} loop volume={.18}/>
  <Sequence from={0} durationInFrames={360}><Opening duration={360}/></Sequence>
  <Sequence from={360} durationInFrames={570}><Foundations duration={570}/></Sequence>
  <Sequence from={930} durationInFrames={570}><Experiment duration={570}/></Sequence>
  <Sequence from={1500} durationInFrames={600}><Runtime duration={600}/></Sequence>
  <Sequence from={2100} durationInFrames={450}><Future duration={450}/></Sequence>
  <Sequence from={2550} durationInFrames={500}><Codex duration={500}/></Sequence>
  <Sequence from={3050} durationInFrames={250}><Closing duration={250}/></Sequence>
  {captions.map(([from,duration,caption]) => <Sequence key={from} from={from} durationInFrames={duration}><Caption text={caption} duration={duration}/></Sequence>)}
</AbsoluteFill>;
