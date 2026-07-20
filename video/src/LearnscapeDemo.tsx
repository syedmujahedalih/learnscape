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

const ink = "#101a31";
const paper = "#f5f1e8";
const acid = "#db6746";
const gold = "#f0b867";
const blue = "#79b9db";

type ProductSceneProps = {
  image: string;
  eyebrow: string;
  title: string;
  caption: string;
  accent?: string;
  focus?: { x: number; y: number; label: string };
  duration: number;
  zoomFrom?: number;
  zoomTo?: number;
};

const Brand: React.FC<{ light?: boolean }> = ({ light = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, color: light ? "#fff" : ink }}>
    <div style={{ width: 42, height: 42, borderRadius: 999, background: acid, color: "#fff", display: "grid", placeItems: "center", font: "22px Georgia" }}>L</div>
    <div style={{ font: "700 27px Arial", letterSpacing: -1.3 }}>learnscape</div>
  </div>
);

const Grain: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.045, backgroundImage: "radial-gradient(circle, white 0 1px, transparent 1px)", backgroundSize: "5px 5px", mixBlendMode: "screen", pointerEvents: "none" }} />
);

const Cursor: React.FC<{ x: number; y: number; label: string; progress: number }> = ({ x, y, label, progress }) => {
  const scale = interpolate(progress, [0, 0.45, 1], [0.6, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-18px,-18px) scale(${scale})`, opacity: progress }}>
    <div style={{ width: 38, height: 38, borderRadius: 999, border: `3px solid ${acid}`, boxShadow: "0 0 0 8px rgba(219,103,70,.18)" }} />
    <div style={{ marginTop: 14, marginLeft: 18, whiteSpace: "nowrap", padding: "10px 14px", borderRadius: 999, background: acid, color: "white", font: "700 18px Arial", boxShadow: "0 12px 30px rgba(8,14,28,.28)" }}>{label}</div>
  </div>;
};

const ProductScene: React.FC<ProductSceneProps> = ({ image, eyebrow, title, caption, accent = acid, focus, duration, zoomFrom = 1.035, zoomTo = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const exit = interpolate(frame, [duration - 18, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, duration], [zoomFrom, zoomTo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const focusProgress = focus ? spring({ frame: frame - 38, fps, config: { damping: 15, stiffness: 120 } }) : 0;
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 72% 18%, ${accent}28, transparent 34%), ${ink}`, color: "white", opacity: exit }}>
    <div style={{ position: "absolute", left: 72, top: 50, right: 72, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: enter }}>
      <Brand light />
      <div style={{ font: "800 14px Arial", letterSpacing: 2.3, color: "#aebbd0" }}>{eyebrow.toUpperCase()}</div>
    </div>
    <div style={{ position: "absolute", left: 180, top: 122, width: 1560, height: 975, borderRadius: 30, overflow: "hidden", boxShadow: "0 42px 110px rgba(0,0,0,.42)", transform: `scale(${zoom})`, transformOrigin: focus ? `${focus.x}px ${focus.y}px` : "center", opacity: enter }}>
      <Img src={staticFile(`captures/${image}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: "auto 0 0", minHeight: 154, padding: "26px 42px 30px", display: "grid", gridTemplateColumns: "1.05fr 1.4fr", gap: 44, alignItems: "center", background: "linear-gradient(90deg, rgba(8,14,28,.97), rgba(16,27,50,.92))", borderTop: "1px solid rgba(255,255,255,.12)" }}>
        <div>
          <div style={{ color: accent, font: "800 13px Arial", letterSpacing: 2.3, marginBottom: 10 }}>{eyebrow.toUpperCase()}</div>
          <div style={{ font: "400 36px Georgia", lineHeight: 1.05 }}>{title}</div>
        </div>
        <div style={{ color: "#d7e0e9", font: "400 22px/1.45 Arial" }}>{caption}</div>
      </div>
      {focus && <Cursor x={focus.x} y={focus.y} label={focus.label} progress={focusProgress} />}
    </div>
    <Grain />
  </AbsoluteFill>;
};

const Opening: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const line = interpolate(frame, [22, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(frame, [duration - 18, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 75% 30%, #315071, transparent 35%), ${ink}`, color: "white", opacity: exit }}>
    <div style={{ position: "absolute", left: 110, top: 75 }}><Brand light /></div>
    <div style={{ position: "absolute", left: 150, top: 265, transform: `translateY(${(1 - reveal) * 55}px)`, opacity: reveal }}>
      <div style={{ font: "800 15px Arial", letterSpacing: 4, color: blue, marginBottom: 34 }}>THE PAGE IS STATIC. THE IDEA ISN&apos;T.</div>
      <div style={{ width: 1260, font: "400 90px/0.99 Georgia", letterSpacing: -3.4 }}>What if students could<br/>step <em style={{ color: acid }}>inside</em> the concept?</div>
      <div style={{ width: 760, marginTop: 35, color: "#b9c6d6", font: "400 27px/1.5 Arial" }}>Learnscape turns course material into a world a learner must predict, test, and explain.</div>
    </div>
    <div style={{ position: "absolute", left: 150, right: 150, bottom: 125, height: 2, transform: `scaleX(${line})`, transformOrigin: "left", background: `linear-gradient(90deg, ${acid}, ${gold}, transparent)` }} />
    <Grain />
  </AbsoluteFill>;
};

const TechScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 85 } });
  const exit = interpolate(frame, [duration - 18, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cards = [
    ["01", "Domain model", "Validated physics defines what is true."],
    ["02", "Interactive world", "The learner changes one variable and gathers evidence."],
    ["03", "Learner model", "Predictions and confidence reveal the current belief."],
    ["04", "Adaptive tutor", "The next experiment is chosen from that evidence."],
  ];
  return <AbsoluteFill style={{ background: paper, color: ink, opacity: exit }}>
    <div style={{ position: "absolute", left: 100, top: 62 }}><Brand /></div>
    <div style={{ position: "absolute", left: 125, top: 205, width: 650, opacity: enter, transform: `translateY(${(1 - enter) * 40}px)` }}>
      <div style={{ font: "800 14px Arial", color: acid, letterSpacing: 3 }}>BUILT WITH CODEX + GPT-5.6 TERRA</div>
      <div style={{ font: "400 76px/1 Georgia", letterSpacing: -2.5, marginTop: 25 }}>Four systems.<br/><em style={{ color: acid }}>One learning loop.</em></div>
      <div style={{ font: "400 24px/1.5 Arial", color: "#5d6879", marginTop: 30 }}>Codex helped implement and test the source mapper, Three.js world, learner-state inference, and scientific checks.</div>
    </div>
    <div style={{ position: "absolute", right: 110, top: 155, width: 840, display: "grid", gap: 14 }}>
      {cards.map(([id, title, copy], index) => {
        const cardIn = spring({ frame: frame - 16 * index, fps, config: { damping: 18, stiffness: 90 } });
        return <div key={id} style={{ minHeight: 157, borderRadius: 22, background: "#fffdf8", border: "1px solid #dfddd4", boxShadow: "0 18px 55px rgba(20,29,47,.07)", padding: "25px 30px", display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", opacity: cardIn, transform: `translateX(${(1 - cardIn) * 60}px)` }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, display: "grid", placeItems: "center", background: ink, color: gold, font: "800 14px Arial" }}>{id}</div>
          <div><div style={{ font: "400 30px Georgia" }}>{title}</div><div style={{ marginTop: 8, font: "400 19px/1.4 Arial", color: "#687386" }}>{copy}</div></div>
        </div>;
      })}
    </div>
  </AbsoluteFill>;
};

const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 17, stiffness: 80 } });
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, #2b4567, transparent 37%), ${ink}`, color: "white", display: "grid", placeItems: "center", textAlign: "center" }}>
    <div style={{ transform: `translateY(${(1 - enter) * 45}px)`, opacity: enter }}>
      <div style={{ margin: "0 auto 42px", width: "fit-content" }}><Brand light /></div>
      <div style={{ font: "400 89px/1 Georgia", letterSpacing: -3 }}>Predict. Experiment.<br/><em style={{ color: acid }}>Understand why.</em></div>
      <div style={{ marginTop: 38, color: "#c2cedb", font: "400 27px Arial" }}>Causal understanding is the product.</div>
      <div style={{ marginTop: 68, display: "inline-flex", gap: 14, alignItems: "center", borderRadius: 999, padding: "15px 24px", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.13)", font: "800 15px Arial", letterSpacing: 1.7 }}><span style={{ color: gold }}>OPENAI BUILD WEEK</span><span style={{ color: "#687b95" }}>•</span><span>EDUCATION</span></div>
    </div>
    <Grain />
  </AbsoluteFill>;
};

const scenes = [
  { from: 180, duration: 270, image: "01-home.png", eyebrow: "The problem", title: "Reading isn't reasoning.", caption: "A student can memorize the formula while keeping the wrong causal model.", focus: { x: 1190, y: 510, label: "A belief worth testing" } },
  { from: 450, duration: 360, image: "02-transformation.png", eyebrow: "Source → world", title: "Find the relationship.", caption: "Learnscape grounds a causal question, a misconception, and the right interactive experience in the supplied material.", focus: { x: 775, y: 485, label: "length → period" } },
  { from: 810, duration: 270, image: "03-predict.png", eyebrow: "Step 1 · Predict", title: "Commit before touching the world.", caption: "A wrong call becomes useful evidence when the learner states it before the controls unlock.", focus: { x: 300, y: 530, label: "Prediction + confidence" } },
  { from: 1080, duration: 270, image: "04-adaptive-test.png", eyebrow: "Step 2 · Test", title: "Change one thing.", caption: "The learner model selects a clean mass comparison and holds length and release angle fixed.", accent: gold, focus: { x: 1280, y: 350, label: "Controlled setup" } },
  { from: 1350, duration: 270, image: "05-experiment.png", eyebrow: "Evidence in motion", title: "Reality gets a vote.", caption: "The validated physics reference and learned forecast make the outcome visible instead of merely explaining it.", accent: blue, focus: { x: 880, y: 650, label: "Observed motion" } },
  { from: 1620, duration: 240, image: "06-evidence.png", eyebrow: "Compare", title: "Prediction meets observation.", caption: "The learner sees exactly where the original belief and the evidence disagree.", focus: { x: 315, y: 630, label: "Belief revised" } },
  { from: 1860, duration: 210, image: "07-transfer.png", eyebrow: "Step 3 · Explain", title: "Make the rule portable.", caption: "Progress requires an explanation and a correct transfer to a new situation—not another click.", accent: gold, focus: { x: 310, y: 690, label: "Transfer check" } },
  { from: 2070, duration: 180, image: "08-complete.png", eyebrow: "Mastery earned", title: "You found the rule.", caption: "The completed challenge becomes an inspectable evidence trail for the learner and instructor.", accent: gold, focus: { x: 290, y: 470, label: "+100 insight" } },
] as const;

export const LearnscapeDemo: React.FC = () => (
  <AbsoluteFill style={{ background: ink }}>
    <Audio src={staticFile("audio/voiceover.m4a")} volume={1} />
    <Audio src={staticFile("audio/ambient.m4a")} volume={0.12} loop />
    <Sequence from={0} durationInFrames={180}><Opening duration={180} /></Sequence>
    {scenes.map(scene => <Sequence key={scene.from} from={scene.from} durationInFrames={scene.duration}><ProductScene {...scene} /></Sequence>)}
    <Sequence from={2250} durationInFrames={240}><TechScene duration={240} /></Sequence>
    <Sequence from={2490} durationInFrames={210}><Closing /></Sequence>
  </AbsoluteFill>
);
