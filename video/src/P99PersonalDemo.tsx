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
  const resources = spring({frame: frame - 280, fps, config: {damping: 14, stiffness: 100}});
  const wanted = spring({frame: frame - 355, fps, config: {damping: 14, stiffness: 100}});
  const built = spring({frame: frame - 510, fps, config: {damping: 14, stiffness: 100}});
  return <AbsoluteFill style={{background: bg, color: text, opacity: fade(frame,duration), overflow: "hidden"}}>
    <Grid/>
    <div style={{position: "absolute", left: 92, right: 92, top: 58, display: "flex", justifyContent: "space-between", alignItems: "center"}}><Brand/><span style={{color: acid, font: "900 12px ui-monospace,monospace", letterSpacing: 2.3}}>WHY I BUILT THIS</span></div>
    <div style={{position: "absolute", left: 120, right: 120, top: 215, display: "grid", gridTemplateColumns: "1.08fr .92fr", gap: 80}}>
      <section style={{opacity: enter, transform: `translateX(${(1-enter)*-38}px)`}}><span style={{color: cyan, font: "900 13px ui-monospace,monospace", letterSpacing: 3}}>PERSONAL MOTIVATION</span><h2 style={{margin: "24px 0 0", font: "950 73px/.92 Inter,Arial", letterSpacing: -4.5}}>THIS SPACE<br/><i style={{color: acid, fontStyle: "normal"}}>GENUINELY EXCITES ME.</i></h2><p style={{maxWidth: 840, marginTop: 35, color: "#b1bdc4", font: "600 23px/1.55 Inter,Arial"}}>But when I tried to learn inference engineering, I couldn’t find a good interactive platform for building intuition.</p></section>
      <section style={{alignSelf: "center", padding: 33, border: `1px solid ${line}`, borderRadius: 15, background: "#091018"}}>
        <div style={{opacity: resources, transform: `translateY(${(1-resources)*22}px)`}}><span style={{color: muted, font: "850 11px ui-monospace,monospace", letterSpacing: 2}}>MOST RESOURCES</span><b style={{display: "block", marginTop: 18, font: "900 32px/1.15 Inter,Arial"}}>Explain the stack.</b></div>
        <div style={{opacity: wanted, transform: `translateY(${(1-wanted)*22}px)`}}><div style={{height: 1, margin: "30px 0", background: line}}/><span style={{color: acid, font: "850 11px ui-monospace,monospace", letterSpacing: 2}}>WHAT I WANTED</span><b style={{display: "block", marginTop: 18, font: "900 32px/1.15 Inter,Arial"}}>Predict. Tune.<br/>Experiment. Understand.</b></div>
        <div style={{marginTop: 38, padding: "18px 22px", borderRadius: 8, background: acid, color: "#071006", font: "950 19px ui-monospace,monospace", textAlign: "center", opacity: built, transform: `scale(${.96 + built*.04})`}}>SO I BUILT P99.</div>
      </section>
    </div>
  </AbsoluteFill>;
};

export const P99PersonalDemo = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: bg}}>
    <Audio src={staticFile("audio/p99-personal-voiceover.mp3")} playbackRate={1.04} volume={1}/>
    <Audio src={staticFile("audio/p99-ambient.m4a")} loop volume={0.12}/>
    <Progress progress={frame / 2789}/>
    <Sequence from={0} durationInFrames={314}><QuoteScene duration={314}/></Sequence>
    <Sequence from={314} durationInFrames={523}><PersonalMotivation duration={523}/></Sequence>
    <Sequence from={837} durationInFrames={60}><ShotScene shot={shots.landing} duration={60} step="SO I BUILT P99" headline="Concepts become decisions." detail="An inference engineering playground built for active learning."/></Sequence>
    <Sequence from={897} durationInFrames={146}><ShotScene shot={shots.primer} duration={146} step="01 · REQUEST LIFECYCLE" headline="Follow one request." detail="Queue → prefill → decode → stream" cursor={{x: 1348, y: 510, clickAt: 62}}/></Sequence>
    <Sequence from={1043} durationInFrames={47}><ShotScene shot={shots.hypothesis} duration={47} step="02 · PREDICT" headline="Commit before the reveal." detail="Choose the signal that should change first." cursor={{x: 638, y: 676, clickAt: 18}}/></Sequence>
    <Sequence from={1090} durationInFrames={28}><ShotScene shot={shots.committed} duration={28} step="HYPOTHESIS LOCKED" headline="Time to first token." detail="Now there is something to test." cursor={{x: 637, y: 676, clickAt: 7}}/></Sequence>
    <Sequence from={1118} durationInFrames={32}><ShotScene shot={shots.feedback} duration={32} step="03 · CAUSAL FEEDBACK" headline="Explain why." detail="Prefix caching avoids repeated prefill work."/></Sequence>
    <Sequence from={1150} durationInFrames={161}><ShotScene shot={shots.playground} duration={161} step="04 · EXPERIMENT" headline="Change one variable." detail="Precision, batching, cache, concurrency, and decoding." cursor={{x: 202, y: 375, clickAt: 68}}/></Sequence>
    <Sequence from={1311} durationInFrames={147}><ShotScene shot={shots.experiment} duration={147} step="REPRODUCIBLE BY DESIGN" headline="Turn choices into a spec." detail="Hold the model, prompts, workload, and hardware constant." cursor={{x: 198, y: 636, clickAt: 50}}/></Sequence>
    <Sequence from={1458} durationInFrames={89}><ShotScene shot={shots.incident} duration={89} step="05 · MEASURE" headline="Connect compute to measure." detail="Run the experiment on local or cloud hardware." accent={cyan} cursor={{x: 1700, y: 183, clickAt: 40}}/></Sequence>
    <Sequence from={1547} durationInFrames={335}><MeasuredSignals duration={335}/></Sequence>
    <Sequence from={1882} durationInFrames={480}><CodexScene duration={480}/></Sequence>
    <Sequence from={2362} durationInFrames={325}><TodayNext duration={325}/></Sequence>
    <Sequence from={2687} durationInFrames={103}><Close duration={103}/></Sequence>
  </AbsoluteFill>;
};
