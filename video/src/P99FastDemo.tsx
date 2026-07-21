import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const bg = "#04070b";
const text = "#edf3f5";
const muted = "#82909a";
export const acid = "#b7ff5e";
export const cyan = "#58d9ff";
export const red = "#ff596e";
export const line = "#26333e";

export const shots = {
  landing: "p99-fast/01-landing.jpg",
  primer: "p99-fast/02-primer.jpg",
  hypothesis: "p99-fast/03-hypothesis.jpg",
  committed: "p99-fast/04-committed.jpg",
  feedback: "p99-fast/05-feedback.jpg",
  playground: "p99-fast/06-playground.jpg",
  experiment: "p99-fast/07-experiment.jpg",
  incident: "p99-fast/08-incident.jpg",
} as const;

const sceneFade = (frame: number, duration: number) => interpolate(
  frame,
  [0, 7, duration - 7, duration],
  [0, 1, 1, 0],
  {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
);

export const Grid = () => <AbsoluteFill style={{
  opacity: 0.38,
  backgroundImage: "linear-gradient(rgba(88,217,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(88,217,255,.055) 1px,transparent 1px)",
  backgroundSize: "44px 44px",
  maskImage: "radial-gradient(circle at 50% 45%,black,transparent 82%)",
}}/>;

export const Brand = () => <div style={{display: "flex", alignItems: "center", gap: 13}}>
  <div style={{width: 42, height: 42, border: `1px solid ${acid}`, borderRadius: 7, display: "grid", placeItems: "center", color: acid, font: "900 15px ui-monospace,monospace"}}>P/</div>
  <b style={{font: "900 25px Inter,Arial"}}>P99</b>
</div>;

export const Progress = ({progress}: {progress: number}) => <div style={{position: "absolute", zIndex: 90, left: 0, right: 0, top: 0, height: 5, background: "#101820"}}>
  <div style={{height: "100%", width: `${progress * 100}%`, background: `linear-gradient(90deg,${cyan},${acid})`, boxShadow: `0 0 18px ${acid}88`}}/>
</div>;

const Cursor = ({x, y, clickAt = 30}: {x: number; y: number; clickAt?: number}) => {
  const frame = useCurrentFrame();
  const click = interpolate(frame, [clickAt - 4, clickAt, clickAt + 10], [0, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const enter = spring({frame, fps: 30, config: {damping: 16, stiffness: 130}});
  return <div style={{position: "absolute", zIndex: 70, left: x, top: y, opacity: enter, transform: `translate(-50%,-50%) scale(${0.65 + enter * 0.35})`}}>
    <div style={{position: "absolute", left: -30, top: -30, width: 60, height: 60, borderRadius: 999, border: `3px solid ${acid}`, opacity: click, transform: `scale(${0.55 + click * 0.9})`}}/>
    <div style={{width: 18, height: 18, borderRadius: 999, background: acid, border: "4px solid #071006", boxShadow: `0 0 22px ${acid}`}}/>
  </div>;
};

type ShotSceneProps = {
  shot: string;
  duration: number;
  step: string;
  headline: string;
  detail: string;
  accent?: string;
  cursor?: {x: number; y: number; clickAt?: number};
};

export const ShotScene = ({shot, duration, step, headline, detail, accent = acid, cursor}: ShotSceneProps) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, duration], [1.015, 1.055], {extrapolateRight: "clamp"});
  const caption = spring({frame: frame - 4, fps: 30, config: {damping: 16, stiffness: 115}});
  return <AbsoluteFill style={{background: bg, color: text, opacity: sceneFade(frame, duration), overflow: "hidden"}}>
    <Img src={staticFile(shot)} style={{position: "absolute", inset: -70, width: 2060, height: 1220, objectFit: "cover", filter: "blur(42px) brightness(.34)", opacity: .62}}/>
    <Grid/>
    <div style={{position: "absolute", left: 44, right: 44, top: 62, bottom: 70, border: `1px solid ${line}`, borderRadius: 16, overflow: "hidden", background: "#05080c", boxShadow: "0 32px 90px rgba(0,0,0,.48)", transform: `scale(${zoom})`}}>
      <Img src={staticFile(shot)} style={{width: "100%", height: "100%", objectFit: "cover"}}/>
      <div style={{position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 52%,rgba(2,5,8,.83) 100%)"}}/>
    </div>
    <div style={{position: "absolute", zIndex: 60, left: 85, bottom: 78, width: 1160, opacity: caption, transform: `translateY(${(1-caption) * 28}px)`}}>
      <span style={{color: accent, font: "900 13px ui-monospace,monospace", letterSpacing: 3}}>{step}</span>
      <h2 style={{margin: "10px 0 0", font: "950 61px/.92 Inter,Arial", letterSpacing: -3.5, textShadow: "0 3px 24px #000"}}>{headline}</h2>
      <p style={{margin: "15px 0 0", color: "#c5d0d6", font: "650 21px/1.35 Inter,Arial", textShadow: "0 2px 15px #000"}}>{detail}</p>
    </div>
    <div style={{position: "absolute", zIndex: 60, right: 85, bottom: 82, display: "flex", alignItems: "center", gap: 12, color: muted, font: "800 10px ui-monospace,monospace", letterSpacing: 1.7}}><i style={{width: 7, height: 7, borderRadius: 99, background: accent, boxShadow: `0 0 13px ${accent}`}}/> LIVE PRODUCT</div>
    {cursor && <Cursor {...cursor}/>} 
  </AbsoluteFill>;
};

export const Hook = ({duration}: {duration: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 13, stiffness: 105}});
  const split = interpolate(frame, [20, 45], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return <AbsoluteFill style={{background: bg, color: text, opacity: sceneFade(frame, duration), overflow: "hidden"}}><Grid/><div style={{position: "absolute", left: 92, right: 92, top: 56, display: "flex", alignItems: "center", justifyContent: "space-between"}}><Brand/><span style={{color: cyan, font: "850 12px ui-monospace,monospace", letterSpacing: 2.5}}>OPENAI BUILD WEEK</span></div><div style={{position: "absolute", left: 115, top: 300, opacity: enter, transform: `translateY(${(1-enter)*42}px)`}}><span style={{color: red, font: "900 14px ui-monospace,monospace", letterSpacing: 4}}>INFERENCE EDUCATION NEEDS A BETTER LOOP</span><h1 style={{margin: "24px 0 0", font: "950 104px/.88 Inter,Arial", letterSpacing: -7}}>STOP WATCHING.<br/><span style={{color: acid, opacity: split}}>START TUNING.</span></h1></div></AbsoluteFill>;
};

export const CodexScene = ({duration}: {duration: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tasks = ["PIVOT THE IDEA", "SHIP THE UI", "TEST THE LEARNING LOOP", "DEPLOY FROM DESKTOP + PHONE"];
  return <AbsoluteFill style={{background: `radial-gradient(circle at 76% 42%,#173a35,transparent 32%),${bg}`, color: text, opacity: sceneFade(frame, duration)}}><Grid/><div style={{position: "absolute", left: 95, right: 95, top: 68, display: "flex", justifyContent: "space-between"}}><Brand/><span style={{color: acid, font: "900 12px ui-monospace,monospace", letterSpacing: 2}}>CODEX + GPT-5.6</span></div><div style={{position: "absolute", left: 120, right: 120, top: 230, display: "grid", gridTemplateColumns: "1fr .95fr", gap: 100}}><section><span style={{color: cyan, font: "900 13px ui-monospace,monospace", letterSpacing: 3}}>BUILT THROUGH CONVERSATION</span><h2 style={{margin: "24px 0 0", font: "950 78px/.9 Inter,Arial", letterSpacing: -5}}>FROM DESK<br/>TO PHONE.<br/><i style={{color: acid, fontStyle: "normal"}}>KEEP SHIPPING.</i></h2></section><section style={{border: `1px solid ${line}`, borderRadius: 15, background: "#091018", padding: 26}}>{tasks.map((task,index) => {const item = spring({frame: frame-index*9, fps, config: {damping: 15, stiffness: 120}}); return <div key={task} style={{height: 118, borderTop: index ? `1px solid ${line}` : undefined, display: "grid", gridTemplateColumns: "52px 1fr auto", alignItems: "center", opacity: item, transform: `translateX(${(1-item)*34}px)`}}><span style={{color: muted, font: "800 12px ui-monospace,monospace"}}>{String(index+1).padStart(2,"0")}</span><b style={{font: "900 16px ui-monospace,monospace", letterSpacing: 1.2}}>{task}</b><strong style={{color: acid, font: "900 22px ui-monospace,monospace"}}>✓</strong></div>})}</section></div></AbsoluteFill>;
};

export const Close = ({duration}: {duration: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 14, stiffness: 90}});
  return <AbsoluteFill style={{background: bg, color: text, opacity: sceneFade(frame, duration)}}><Grid/><div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", opacity: enter, transform: `scale(${0.9 + enter*.1})`}}><div><Brand/><h2 style={{margin: "48px 0 0", font: "950 92px/.88 Inter,Arial", letterSpacing: -6}}>LEARN THE STACK.<br/><span style={{color: acid}}>MEASURE WHAT HAPPENS.</span></h2><p style={{marginTop: 34, color: "#a8b5bd", font: "600 23px Inter,Arial"}}>Foundations → experiments → real traces</p><div style={{display: "inline-block", marginTop: 45, padding: "17px 24px", border: `1px solid ${cyan}66`, borderRadius: 9, color: cyan, font: "850 13px ui-monospace,monospace", letterSpacing: 1}}>learnscape-education.syedmujahedalih.chatgpt.site</div></div></div></AbsoluteFill>;
};

export const P99FastDemo = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: bg}}>
    <Audio src={staticFile("audio/p99-fast-voiceover.mp3")} volume={1}/>
    <Audio src={staticFile("audio/p99-ambient.m4a")} loop volume={0.12}/>
    <Progress progress={frame / 1349}/>
    <Sequence from={0} durationInFrames={75}><Hook duration={75}/></Sequence>
    <Sequence from={75} durationInFrames={105}><ShotScene shot={shots.landing} duration={105} step="P99" headline="Decisions, not diagrams." detail="Learn inference engineering by changing the system."/></Sequence>
    <Sequence from={180} durationInFrames={150}><ShotScene shot={shots.primer} duration={150} step="01 · REQUEST LIFECYCLE" headline="Follow one request." detail="Queue → prefill → decode → stream" cursor={{x: 1348, y: 510, clickAt: 55}}/></Sequence>
    <Sequence from={330} durationInFrames={120}><ShotScene shot={shots.hypothesis} duration={120} step="02 · PREDICT" headline="Commit before the reveal." detail="Make the learner choose what should change." cursor={{x: 638, y: 676, clickAt: 55}}/></Sequence>
    <Sequence from={450} durationInFrames={60}><ShotScene shot={shots.committed} duration={60} step="MAKE A CALL" headline="Time to first token." detail="The hypothesis is locked in." cursor={{x: 637, y: 676, clickAt: 14}}/></Sequence>
    <Sequence from={510} durationInFrames={90}><ShotScene shot={shots.feedback} duration={90} step="03 · UNDERSTAND WHY" headline="Feedback, not confetti." detail="Explain the causal mechanism behind the result."/></Sequence>
    <Sequence from={600} durationInFrames={150}><ShotScene shot={shots.playground} duration={150} step="04 · EXPERIMENT" headline="Change one variable." detail="Precision, batching, cache, concurrency, decoding." cursor={{x: 202, y: 375, clickAt: 62}}/></Sequence>
    <Sequence from={750} durationInFrames={120}><ShotScene shot={shots.experiment} duration={120} step="REPRODUCIBLE BY DESIGN" headline="Turn choices into a spec." detail="Hold the model, prompts, hardware, and workload constant." cursor={{x: 198, y: 636, clickAt: 46}}/></Sequence>
    <Sequence from={870} durationInFrames={150}><ShotScene shot={shots.incident} duration={150} step="THE HONEST BOUNDARY" headline="No GPU. No fake number." detail="Connect local or cloud compute before claiming a benchmark." accent={red} cursor={{x: 1700, y: 183, clickAt: 58}}/></Sequence>
    <Sequence from={1020} durationInFrames={150}><CodexScene duration={150}/></Sequence>
    <Sequence from={1170} durationInFrames={180}><Close duration={180}/></Sequence>
  </AbsoluteFill>;
};
