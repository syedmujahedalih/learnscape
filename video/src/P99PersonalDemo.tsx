import React from "react";
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Brand, Close, CodexScene, Grid, Progress, ShotScene, acid, cyan, line, red, shots} from "./P99FastDemo";
import {MeasuredSignals, TodayNext} from "./P99JudgeDemo";

const bg = "#04070b";
const text = "#edf3f5";
const muted = "#82909a";

const fade = (frame: number, duration: number) => interpolate(
  frame,
  [0, 8, duration - 8, duration],
  [0, 1, 1, 0],
  {extrapolateLeft: "clamp", extrapolateRight: "clamp"},
);

const QuoteScene = ({duration}: {duration: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 16, stiffness: 82}});
  return <AbsoluteFill style={{background: `radial-gradient(circle at 73% 40%,#183632,transparent 36%),${bg}`, color: text, opacity: fade(frame,duration)}}>
    <Grid/>
    <div style={{position: "absolute", left: 90, right: 90, top: 55, display: "flex", justifyContent: "space-between", alignItems: "center"}}><Brand/><span style={{color: cyan, font: "850 12px ui-monospace,monospace", letterSpacing: 2.4}}>OPENAI BUILD WEEK · EDUCATION</span></div>
    <div style={{position: "absolute", left: 150, right: 150, top: 245, opacity: enter, transform: `translateY(${(1-enter)*38}px)`}}>
      <span style={{color: acid, font: "900 88px/1 Georgia,serif"}}>“</span>
      <blockquote style={{margin: "-20px 0 0", maxWidth: 1580, font: "800 60px/1.1 Inter,Arial", letterSpacing: -3}}>Inference is the most valuable category in AI, but inference engineering is still in its infancy.</blockquote>
      <div style={{display: "flex", alignItems: "center", gap: 18, marginTop: 55}}><i style={{width: 68, height: 2, background: acid}}/><div><b style={{display: "block", font: "900 18px ui-monospace,monospace", letterSpacing: 1.6}}>PHILIP KIELY</b><span style={{display: "block", marginTop: 8, color: muted, font: "700 14px ui-monospace,monospace", letterSpacing: 1}}>AUTHOR OF INFERENCE ENGINEERING · PHILIPKIELY.COM/BOOKS</span></div></div>
    </div>
  </AbsoluteFill>;
};

const PersonalMotivation = ({duration}: {duration: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 15, stiffness: 92}});
  const answer = spring({frame: frame - 85, fps, config: {damping: 14, stiffness: 100}});
  return <AbsoluteFill style={{background: bg, color: text, opacity: fade(frame,duration), overflow: "hidden"}}>
    <Grid/>
    <div style={{position: "absolute", left: 92, right: 92, top: 58, display: "flex", justifyContent: "space-between", alignItems: "center"}}><Brand/><span style={{color: acid, font: "900 12px ui-monospace,monospace", letterSpacing: 2.3}}>WHY I BUILT THIS</span></div>
    <div style={{position: "absolute", left: 120, right: 120, top: 215, display: "grid", gridTemplateColumns: "1.08fr .92fr", gap: 80}}>
      <section style={{opacity: enter, transform: `translateX(${(1-enter)*-38}px)`}}><span style={{color: cyan, font: "900 13px ui-monospace,monospace", letterSpacing: 3}}>PERSONAL MOTIVATION</span><h2 style={{margin: "24px 0 0", font: "950 73px/.92 Inter,Arial", letterSpacing: -4.5}}>THIS SPACE<br/><i style={{color: acid, fontStyle: "normal"}}>GENUINELY EXCITES ME.</i></h2><p style={{maxWidth: 840, marginTop: 35, color: "#b1bdc4", font: "600 23px/1.55 Inter,Arial"}}>But when I tried to learn inference engineering, I couldn’t find a good interactive platform for building intuition.</p></section>
      <section style={{alignSelf: "center", padding: 33, border: `1px solid ${line}`, borderRadius: 15, background: "#091018", opacity: answer, transform: `translateY(${(1-answer)*35}px)`}}><span style={{color: muted, font: "850 11px ui-monospace,monospace", letterSpacing: 2}}>MOST RESOURCES</span><b style={{display: "block", marginTop: 18, font: "900 32px/1.15 Inter,Arial"}}>Explain the stack.</b><div style={{height: 1, margin: "30px 0", background: line}}/><span style={{color: acid, font: "850 11px ui-monospace,monospace", letterSpacing: 2}}>WHAT I WANTED</span><b style={{display: "block", marginTop: 18, font: "900 32px/1.15 Inter,Arial"}}>Predict. Tune.<br/>Experiment. Understand.</b><div style={{marginTop: 38, padding: "18px 22px", borderRadius: 8, background: acid, color: "#071006", font: "950 19px ui-monospace,monospace", textAlign: "center"}}>SO I BUILT P99.</div></section>
    </div>
  </AbsoluteFill>;
};

export const P99PersonalDemo = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: bg}}>
    <Audio src={staticFile("audio/p99-personal-voiceover.mp3")} playbackRate={1.04} volume={1}/>
    <Audio src={staticFile("audio/p99-ambient.m4a")} loop volume={0.12}/>
    <Progress progress={frame / 2699}/>
    <Sequence from={0} durationInFrames={120}><QuoteScene duration={120}/></Sequence>
    <Sequence from={120} durationInFrames={240}><PersonalMotivation duration={240}/></Sequence>
    <Sequence from={360} durationInFrames={120}><ShotScene shot={shots.landing} duration={120} step="SO I BUILT P99" headline="Concepts become decisions." detail="An inference engineering playground built for active learning."/></Sequence>
    <Sequence from={480} durationInFrames={180}><ShotScene shot={shots.primer} duration={180} step="01 · REQUEST LIFECYCLE" headline="Follow one request." detail="Queue → prefill → decode → stream" cursor={{x: 1348, y: 510, clickAt: 68}}/></Sequence>
    <Sequence from={660} durationInFrames={150}><ShotScene shot={shots.hypothesis} duration={150} step="02 · PREDICT" headline="Commit before the reveal." detail="Choose the signal that should change first." cursor={{x: 638, y: 676, clickAt: 63}}/></Sequence>
    <Sequence from={810} durationInFrames={60}><ShotScene shot={shots.committed} duration={60} step="HYPOTHESIS LOCKED" headline="Time to first token." detail="Now there is something to test." cursor={{x: 637, y: 676, clickAt: 13}}/></Sequence>
    <Sequence from={870} durationInFrames={90}><ShotScene shot={shots.feedback} duration={90} step="03 · CAUSAL FEEDBACK" headline="Explain why." detail="Prefix caching avoids repeated prefill work."/></Sequence>
    <Sequence from={960} durationInFrames={180}><ShotScene shot={shots.playground} duration={180} step="04 · EXPERIMENT" headline="Change one variable." detail="Precision, batching, cache, concurrency, and decoding." cursor={{x: 202, y: 375, clickAt: 76}}/></Sequence>
    <Sequence from={1140} durationInFrames={150}><ShotScene shot={shots.experiment} duration={150} step="REPRODUCIBLE BY DESIGN" headline="Turn choices into a spec." detail="Hold the model, prompts, workload, and hardware constant." cursor={{x: 198, y: 636, clickAt: 54}}/></Sequence>
    <Sequence from={1290} durationInFrames={270}><ShotScene shot={shots.incident} duration={270} step="THE HONEST BOUNDARY" headline="No runtime. No benchmark." detail="P99 never substitutes a synthetic performance result." accent={red} cursor={{x: 1700, y: 183, clickAt: 85}}/></Sequence>
    <Sequence from={1560} durationInFrames={240}><MeasuredSignals duration={240}/></Sequence>
    <Sequence from={1800} durationInFrames={360}><CodexScene duration={360}/></Sequence>
    <Sequence from={2160} durationInFrames={360}><TodayNext duration={360}/></Sequence>
    <Sequence from={2520} durationInFrames={180}><Close duration={180}/></Sequence>
  </AbsoluteFill>;
};
