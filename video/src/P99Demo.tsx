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

const bg = "#05080d";
const panel = "#0b1118";
const line = "#26333e";
const text = "#e7eef2";
const muted = "#7d8b98";
const acid = "#b7ff5e";
const cyan = "#58d9ff";
const red = "#ff596e";
const amber = "#ffba61";

const fade = (frame: number, duration: number) =>
  interpolate(frame, [0, 14, duration - 14, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const Grid: React.FC = () => (
  <AbsoluteFill
    style={{
      opacity: 0.42,
      backgroundImage:
        "linear-gradient(rgba(88,217,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(88,217,255,.045) 1px,transparent 1px)",
      backgroundSize: "42px 42px",
      maskImage: "radial-gradient(circle at 50% 42%, black, transparent 76%)",
    }}
  />
);

const Scanlines: React.FC = () => (
  <AbsoluteFill
    style={{
      opacity: 0.035,
      backgroundImage: "linear-gradient(transparent 50%, rgba(255,255,255,.65) 50%)",
      backgroundSize: "100% 4px",
      mixBlendMode: "overlay",
    }}
  />
);

const P99Mark: React.FC<{ small?: boolean }> = ({ small = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: small ? 12 : 18 }}>
    <div
      style={{
        width: small ? 35 : 54,
        height: small ? 35 : 54,
        borderRadius: 7,
        display: "grid",
        placeItems: "center",
        color: bg,
        background: acid,
        font: `${small ? 900 : 900} ${small ? 15 : 22}px ui-monospace, SFMono-Regular, Menlo, monospace`,
        boxShadow: `0 0 36px ${acid}35`,
      }}
    >
      P/
    </div>
    <div style={{ color: text, font: `900 ${small ? 22 : 34}px Inter, Arial`, letterSpacing: -1.2 }}>P99</div>
  </div>
);

const Chrome: React.FC<{ label: string; status?: string }> = ({ label, status = "WORLD MODEL ONLINE" }) => (
  <div
    style={{
      position: "absolute",
      zIndex: 20,
      left: 66,
      right: 66,
      top: 42,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <P99Mark small />
    <div style={{ display: "flex", alignItems: "center", gap: 23, color: muted, font: "700 11px ui-monospace, monospace", letterSpacing: 2.4 }}>
      <span>{label}</span>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: acid, boxShadow: `0 0 12px ${acid}` }} />
      <span style={{ color: "#b9c5cd" }}>{status}</span>
    </div>
  </div>
);

const Opening: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 17, stiffness: 82 } });
  const flash = interpolate(frame, [0, 5, 11], [1, 0.3, 0], { extrapolateRight: "clamp" });
  const stages = [["01", "LEARN", "Build the mental model"], ["02", "EXPERIMENT", "Change the serving stack"], ["03", "DIAGNOSE", "Read cause and effect"], ["04", "OPERATE", "Contain an incident"]];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 72% 42%, #153f42, transparent 35%), ${bg}`, color: text, opacity: fade(frame, duration), overflow: "hidden" }}>
      <Grid />
      <Chrome label="OPENAI BUILD WEEK · EDUCATION" status="LEARNED SURROGATE READY" />
      <div style={{ position: "absolute", left: 120, top: 245, opacity: enter, transform: `translateY(${(1 - enter) * 48}px)` }}>
        <div style={{ color: cyan, font: "800 13px ui-monospace, monospace", letterSpacing: 4.5 }}>THE INTERACTIVE PLAYGROUND FOR LLM SYSTEMS</div>
        <div style={{ marginTop: 26, font: "900 104px/.91 Inter, Arial", letterSpacing: -7, maxWidth: 1160 }}>
          LEARN INFERENCE<br />
          <span style={{ color: acid }}>BY RUNNING IT.</span>
        </div>
        <div style={{ marginTop: 34, width: 790, color: "#a6b3bd", font: "400 26px/1.5 Inter, Arial" }}>
          Start with first principles. Explore the serving stack freely. Graduate to production pressure.
        </div>
      </div>
      <div style={{ position: "absolute", right: 120, top: 230, width: 500, border: `1px solid ${line}`, borderRadius: 18, padding: 28, background: "rgba(7,11,16,.92)", boxShadow: "0 40px 100px rgba(0,0,0,.45)", opacity: enter }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: muted, font: "700 10px ui-monospace, monospace", letterSpacing: 1.8 }}><span>LEARNING PATH</span><span style={{ color: acid }}>● READY</span></div>
        <div style={{ display: "grid", gap: 1, marginTop: 25, background: line }}>
          {stages.map(([id, title, copy], index) => <div key={id} style={{ minHeight: 103, padding: "17px 18px", display: "grid", gridTemplateColumns: "45px 1fr", alignItems: "center", background: "#0a1016" }}><span style={{ color: index === 3 ? acid : "#52616d", font: "800 10px ui-monospace, monospace" }}>{id}</span><div><b style={{ display: "block", color: index === 3 ? acid : text, font: "850 15px ui-monospace, monospace", letterSpacing: 1 }}>{title}</b><small style={{ display: "block", marginTop: 7, color: muted, font: "500 13px Inter, Arial" }}>{copy}</small></div></div>)}
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${flash})`, pointerEvents: "none" }} />
      <Scanlines />
    </AbsoluteFill>
  );
};

type ProductSceneProps = {
  duration: number;
  image: string;
  step: string;
  title: string;
  copy: string;
  accent?: string;
  focus?: { x: number; y: number; label: string };
  zoom?: number;
};

const ProductScene: React.FC<ProductSceneProps> = ({ duration, image, step, title, copy, accent = acid, focus, zoom = 1.025 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 88 } });
  const camera = interpolate(frame, [0, duration], [zoom, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const callout = spring({ frame: frame - 32, fps, config: { damping: 15, stiffness: 115 } });
  return (
    <AbsoluteFill style={{ background: bg, color: text, opacity: fade(frame, duration), overflow: "hidden" }}>
      <Grid />
      <Chrome label={step} />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 105,
          height: 930,
          border: `1px solid ${line}`,
          borderRadius: 17,
          overflow: "hidden",
          background: panel,
          boxShadow: "0 45px 120px rgba(0,0,0,.52)",
          opacity: enter,
          transform: `translateY(${(1 - enter) * 25}px) scale(${camera})`,
        }}
      >
        <Img src={staticFile(`p99-v2/${image}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 235, background: "linear-gradient(transparent, rgba(4,7,11,.96) 44%)" }} />
        <div style={{ position: "absolute", left: 44, right: 44, bottom: 34, display: "grid", gridTemplateColumns: "1.1fr 1fr", alignItems: "end", gap: 70 }}>
          <div>
            <div style={{ color: accent, font: "800 11px ui-monospace, monospace", letterSpacing: 3 }}>{step}</div>
            <div style={{ marginTop: 10, color: text, font: "850 42px/1 Inter, Arial", letterSpacing: -2 }}>{title}</div>
          </div>
          <div style={{ color: "#aebbc4", font: "450 20px/1.45 Inter, Arial" }}>{copy}</div>
        </div>
        {focus && (
          <div style={{ position: "absolute", left: focus.x, top: focus.y, transform: `translate(-50%,-50%) scale(${callout})`, opacity: callout }}>
            <div style={{ width: 70, height: 70, borderRadius: 99, border: `2px solid ${accent}`, boxShadow: `0 0 0 12px ${accent}22, 0 0 35px ${accent}55` }} />
            <div style={{ marginTop: 16, marginLeft: 35, padding: "10px 14px", borderRadius: 6, whiteSpace: "nowrap", background: accent, color: bg, font: "900 11px ui-monospace, monospace", letterSpacing: 1 }}>{focus.label}</div>
          </div>
        )}
      </div>
      <Scanlines />
    </AbsoluteFill>
  );
};

const WorldModelScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 17, stiffness: 85 } });
  const pulse = 0.55 + Math.sin(frame / 8) * 0.35;
  const states = ["QUEUE", "ACTIVE", "VRAM", "UTIL", "TOK/S", "P95"];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #123538, transparent 38%), ${bg}`, color: text, opacity: fade(frame, duration), overflow: "hidden" }}>
      <Grid />
      <Chrome label="HOW IT WORKS" status="LEARNED SURROGATE" />
      <div style={{ position: "absolute", left: 110, right: 110, top: 160, textAlign: "center", opacity: enter }}>
        <div style={{ color: cyan, font: "800 12px ui-monospace, monospace", letterSpacing: 3.6 }}>LEARNED DYNAMICS ≠ ONE-SHOT SCORE</div>
        <div style={{ marginTop: 18, font: "850 59px/.98 Inter, Arial", letterSpacing: -3.5 }}>The prediction becomes the next state.</div>
      </div>
      <div style={{ position: "absolute", left: 125, right: 125, top: 385, display: "grid", gridTemplateColumns: "1fr 120px 1fr 120px 1fr", alignItems: "center", opacity: enter }}>
        <StateBox title="STATE · t" accent={cyan} states={states} values={["389","12","23.6","99%","80","14.7s"]} />
        <Arrow progress={interpolate(frame % 60, [0, 60], [0, 1])} />
        <div style={{ height: 285, border: `1px solid ${acid}77`, borderRadius: 17, background: "rgba(16,28,20,.92)", display: "grid", placeItems: "center", textAlign: "center", boxShadow: `0 0 ${45 * pulse}px ${acid}20` }}>
          <div><div style={{ color: acid, font: "900 13px ui-monospace, monospace", letterSpacing: 2 }}>NEXT-STATE MLP</div><div style={{ marginTop: 22, font: "900 47px ui-monospace, monospace", letterSpacing: -3 }}>19→24→6</div><div style={{ marginTop: 20, color: muted, font: "600 12px ui-monospace, monospace", lineHeight: 1.7 }}>CONFIG + WORKLOAD<br/>+ PREVIOUS STATE</div></div>
        </div>
        <Arrow progress={interpolate((frame + 30) % 60, [0, 60], [0, 1])} />
        <StateBox title="STATE · t+1" accent={acid} states={states} values={["341","12","23.7","98%","86","13.2s"]} />
      </div>
      <div style={{ position: "absolute", left: 410, right: 410, bottom: 80, display: "flex", justifyContent: "center", gap: 12 }}>
        {["630 PARAMETERS", "10,800 TRANSITIONS", "12-STEP ROLLOUT", "PROVENANCE VISIBLE"].map((item, index) => <div key={item} style={{ padding: "12px 17px", border: `1px solid ${index === 3 ? acid : line}`, borderRadius: 999, color: index === 3 ? acid : "#8997a3", background: "rgba(8,12,17,.86)", font: "800 9px ui-monospace, monospace", letterSpacing: 1.2 }}>{item}</div>)}
      </div>
      <Scanlines />
    </AbsoluteFill>
  );
};

const StateBox: React.FC<{ title: string; accent: string; states: string[]; values: string[] }> = ({ title, accent, states, values }) => (
  <div style={{ height: 285, border: `1px solid ${line}`, borderRadius: 17, padding: 22, background: "rgba(8,13,19,.94)" }}>
    <div style={{ color: accent, font: "900 11px ui-monospace, monospace", letterSpacing: 2.2 }}>{title}</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 20 }}>
      {states.map((state, index) => <div key={state} style={{ minHeight: 88, padding: 12, border: "1px solid #22303b", borderRadius: 7, background: "#0b1219" }}><div style={{ color: muted, font: "700 8px ui-monospace, monospace", letterSpacing: 1 }}>{state}</div><div style={{ marginTop: 12, color: text, font: "800 21px ui-monospace, monospace" }}>{values[index]}</div></div>)}
    </div>
  </div>
);

const Arrow: React.FC<{ progress: number }> = ({ progress }) => (
  <div style={{ position: "relative", height: 4, margin: "0 15px", background: "#20313a" }}>
    <div style={{ width: `${progress * 100}%`, height: "100%", background: `linear-gradient(90deg,${cyan},${acid})`, boxShadow: `0 0 14px ${acid}` }} />
    <div style={{ position: "absolute", right: -2, top: -8, color: acid, fontSize: 18 }}>▶</div>
  </div>
);

const CloudScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 17, stiffness: 80 } });
  const nodes = [
    ["01", "AUTHENTICATED JOB", "server-only key"],
    ["02", "EPHEMERAL GPU", "T4 · L4 · A10G"],
    ["03", "LLAMA.CPP", "Qwen2.5-7B"],
    ["04", "TRACE", "server + NVIDIA telemetry"],
  ];
  return (
    <AbsoluteFill style={{ background: bg, color: text, opacity: fade(frame, duration), overflow: "hidden" }}>
      <Grid />
      <Chrome label="MEASURED TRACE PATH" status="OPTIONAL · METERED" />
      <div style={{ position: "absolute", left: 85, top: 142, width: 920, height: 800, border: `1px solid ${line}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,.5)", opacity: enter, transform: `translateX(${(1 - enter) * -35}px)` }}>
        <Img src={staticFile("p99/08-cloud.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "right center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 62%, rgba(5,8,13,.62))" }} />
      </div>
      <div style={{ position: "absolute", left: 1080, right: 95, top: 160, opacity: enter }}>
        <div style={{ color: cyan, font: "800 12px ui-monospace, monospace", letterSpacing: 3 }}>FORECASTS CAN BE CHALLENGED</div>
        <div style={{ marginTop: 21, font: "850 54px/1 Inter, Arial", letterSpacing: -3 }}>Spin up a GPU.<br/><span style={{ color: acid }}>Capture reality.</span></div>
        <div style={{ display: "grid", gap: 10, marginTop: 38 }}>
          {nodes.map(([id, title, copy], index) => {
            const item = spring({ frame: frame - index * 10, fps, config: { damping: 18, stiffness: 90 } });
            return <div key={id} style={{ minHeight: 94, padding: "17px 19px", display: "grid", gridTemplateColumns: "55px 1fr", alignItems: "center", border: `1px solid ${line}`, borderRadius: 9, background: "rgba(9,14,20,.92)", opacity: item, transform: `translateX(${(1-item)*35}px)` }}><div style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 5, background: index === 3 ? acid : "#13202a", color: index === 3 ? bg : cyan, font: "900 9px ui-monospace, monospace" }}>{id}</div><div><div style={{ font: "850 16px ui-monospace, monospace", letterSpacing: .5 }}>{title}</div><div style={{ marginTop: 6, color: muted, font: "500 13px Inter, Arial" }}>{copy}</div></div></div>;
          })}
        </div>
        <div style={{ marginTop: 22, color: amber, font: "800 10px ui-monospace, monospace", letterSpacing: 1.4 }}>ALLOW-LISTED · HARD TIMEOUT · VISIBLE COST CAP</div>
      </div>
      <Scanlines />
    </AbsoluteFill>
  );
};

const BoundaryScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 17, stiffness: 84 } });
  const cards = [
    ["01", "REAL LEARNED MODEL", "A compact recursive next-state network predicts six serving-system variables.", acid],
    ["02", "BOOTSTRAP TRACES", "The current training corpus comes from internally consistent reference dynamics.", amber],
    ["03", "MEASURED DATA PATH", "An optional Modal and llama.cpp runner can capture real GPU traces for retraining.", cyan],
  ] as const;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%, #163633, transparent 40%), ${bg}`, color: text, opacity: fade(frame, duration), overflow: "hidden" }}>
      <Grid />
      <Chrome label="SCIENTIFIC BOUNDARY" status="PROVENANCE VISIBLE" />
      <div style={{ position: "absolute", left: 120, right: 120, top: 180, opacity: enter }}>
        <div style={{ color: amber, font: "900 12px ui-monospace, monospace", letterSpacing: 3.5 }}>NO BLACK-BOX CLAIMS</div>
        <div style={{ marginTop: 22, maxWidth: 1300, font: "850 64px/.98 Inter, Arial", letterSpacing: -3.8 }}>A real learned surrogate.<br/><span style={{ color: acid }}>An honest data boundary.</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 15, marginTop: 68 }}>
          {cards.map(([id, title, copy, color], index) => {
            const item = spring({ frame: frame - index * 13, fps, config: { damping: 17, stiffness: 96 } });
            return <article key={id} style={{ minHeight: 300, padding: 30, border: `1px solid ${color}55`, borderRadius: 15, background: "rgba(8,13,19,.92)", opacity: item, transform: `translateY(${(1-item)*30}px)` }}><span style={{ display: "block", color, font: "900 11px ui-monospace, monospace", letterSpacing: 2 }}>{id}</span><b style={{ display: "block", marginTop: 48, font: "850 24px/1.1 Inter, Arial" }}>{title}</b><p style={{ margin: "22px 0 0", color: "#98a6b0", font: "450 18px/1.55 Inter, Arial" }}>{copy}</p></article>;
          })}
        </div>
        <div style={{ marginTop: 38, color: "#85939e", font: "750 12px ui-monospace, monospace", letterSpacing: 1.4 }}>FORECAST → INDEPENDENT TRACE → FUTURE MEASURED CORPUS</div>
      </div>
      <Scanlines />
    </AbsoluteFill>
  );
};

const CodexScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 17, stiffness: 82 } });
  const tasks = ["PRESSURE-TEST THE ORIGINAL IDEA", "PIVOT TO INFERENCE EDUCATION", "IMPLEMENT THE LEARNED ROLLOUT", "BUILD THE INTERACTIVE PLATFORM", "TEST · DOCUMENT · DEPLOY", "KEEP BUILDING FROM MY PHONE"];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 24% 48%, #173a37, transparent 34%), ${bg}`, color: text, opacity: fade(frame, duration), overflow: "hidden" }}>
      <Grid />
      <Chrome label="BUILT WITH CODEX + GPT-5.6" status="DESKTOP + PHONE" />
      <div style={{ position: "absolute", left: 120, top: 220, width: 710, opacity: enter }}>
        <div style={{ color: acid, font: "900 13px ui-monospace, monospace", letterSpacing: 3.6 }}>OPENAI BUILD WEEK</div>
        <div style={{ marginTop: 25, font: "850 70px/.96 Inter, Arial", letterSpacing: -4.3 }}>Built wherever<br/>the work moved.</div>
        <div style={{ marginTop: 32, width: 650, color: "#a5b2bc", font: "450 22px/1.55 Inter, Arial" }}>Codex with GPT-5.6 helped shape the product, implement the system, test it, and deploy it. I continued the same build from desktop and phone.</div>
      </div>
      <div style={{ position: "absolute", left: 990, right: 120, top: 185, padding: 29, border: `1px solid ${line}`, borderRadius: 15, background: "rgba(7,12,17,.92)", boxShadow: "0 35px 100px rgba(0,0,0,.45)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 26 }}><i style={{ width: 9, height: 9, borderRadius: 99, background: red }}/><i style={{ width: 9, height: 9, borderRadius: 99, background: amber }}/><i style={{ width: 9, height: 9, borderRadius: 99, background: acid }}/></div>
        {tasks.map((task, index) => {
          const item = spring({ frame: frame - index * 11, fps, config: { damping: 17, stiffness: 100 } });
          return <div key={task} style={{ minHeight: 91, display: "grid", gridTemplateColumns: "38px 1fr auto", gap: 15, alignItems: "center", borderTop: index ? "1px solid #1d2932" : undefined, opacity: item, transform: `translateX(${(1-item)*30}px)` }}><span style={{ color: "#3f515e", font: "700 11px ui-monospace, monospace" }}>{String(index+1).padStart(2,"0")}</span><b style={{ font: "800 13px ui-monospace, monospace", letterSpacing: 1.2 }}>{task}</b><span style={{ color: acid, font: "900 12px ui-monospace, monospace" }}>✓</span></div>;
        })}
        <div style={{ marginTop: 22, padding: "14px 16px", borderRadius: 7, background: "#101a22", color: cyan, font: "700 11px ui-monospace, monospace", letterSpacing: 1 }}>GPT-5.6 FOR CORE PRODUCT + ENGINEERING WORK · NOT JUST COPY</div>
      </div>
      <Scanlines />
    </AbsoluteFill>
  );
};

const Closing: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 78 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, #173e3c, transparent 36%), ${bg}`, color: text, display: "grid", placeItems: "center", textAlign: "center", opacity: fade(frame, duration) }}>
      <Grid />
      <div style={{ opacity: enter, transform: `translateY(${(1-enter)*42}px)` }}>
        <div style={{ width: "fit-content", margin: "0 auto 38px" }}><P99Mark /></div>
        <div style={{ font: "900 86px/.92 Inter, Arial", letterSpacing: -5.5 }}>LEARN INFERENCE.<br/><span style={{ color: acid }}>BY RUNNING IT.</span></div>
        <div style={{ marginTop: 33, color: "#aab8c2", font: "450 24px Inter, Arial" }}>Foundations · Playground · Production incidents</div>
        <div style={{ marginTop: 62, display: "inline-flex", alignItems: "center", gap: 15, padding: "16px 23px", border: `1px solid ${line}`, borderRadius: 8, background: "rgba(7,12,17,.85)", color: cyan, font: "800 13px ui-monospace, monospace", letterSpacing: 1.2 }}><span style={{ width: 7, height: 7, borderRadius: 99, background: acid, boxShadow: `0 0 14px ${acid}` }}/> LIVE DEMO · learnscape-education.syedmujahedalih.chatgpt.site</div>
      </div>
      <Scanlines />
    </AbsoluteFill>
  );
};

type Caption = { from: number; duration: number; text: string; hot: string[]; accent?: string };

const captions: Caption[] = [
  { from: 18, duration: 150, text: "LEARN INFERENCE BY RUNNING IT", hot: ["RUNNING", "IT"] },
  { from: 220, duration: 170, text: "FROM FIRST PRINCIPLES TO PRODUCTION", hot: ["FIRST", "PRODUCTION"], accent: cyan },
  { from: 585, duration: 185, text: "SIX FOCUSED FOUNDATION LABS", hot: ["SIX", "FOUNDATION"] },
  { from: 790, duration: 180, text: "PREDICT. CHANGE ONE VARIABLE. EXPLAIN WHY.", hot: ["PREDICT.", "WHY."] },
  { from: 1010, duration: 210, text: "FEEDBACK BUILDS THE MENTAL MODEL", hot: ["MENTAL", "MODEL"] },
  { from: 1280, duration: 195, text: "FREE PLAYGROUND. NO PRESCRIBED ANSWER.", hot: ["FREE", "PLAYGROUND."] },
  { from: 1490, duration: 195, text: "CHANGE THE STACK. WATCH CAUSE BECOME EFFECT.", hot: ["CAUSE", "EFFECT."] },
  { from: 1730, duration: 195, text: "CURRENT STATE → NEXT STATE", hot: ["NEXT", "STATE"], accent: cyan },
  { from: 1940, duration: 190, text: "RECURSIVE THIRTY-SECOND ROLLOUT", hot: ["RECURSIVE", "ROLLOUT"], accent: cyan },
  { from: 2180, duration: 170, text: "THEN PRODUCTION PRESSURE", hot: ["PRODUCTION", "PRESSURE"], accent: red },
  { from: 2360, duration: 145, text: "PROTECT FIVE SLOs AT ONCE", hot: ["FIVE", "SLOs"], accent: amber },
  { from: 2540, duration: 170, text: "COMMIT A PREDICTION", hot: ["PREDICTION"] },
  { from: 2720, duration: 195, text: "CHANGE THE SERVING STACK", hot: ["SERVING", "STACK"], accent: cyan },
  { from: 2960, duration: 185, text: "LEARNED FORECAST FIRST", hot: ["FORECAST", "FIRST"] },
  { from: 3160, duration: 185, text: "THE MODEL DOES NOT GRADE ITSELF", hot: ["NOT", "ITSELF"], accent: amber },
  { from: 3380, duration: 180, text: "INDEPENDENT REFERENCE TRACE", hot: ["INDEPENDENT", "TRACE"] },
  { from: 3570, duration: 180, text: "100 / 100 · INCIDENT CONTAINED", hot: ["100", "CONTAINED"] },
  { from: 3800, duration: 180, text: "REAL SURROGATE. VISIBLE BOUNDARY.", hot: ["REAL", "VISIBLE"], accent: amber },
  { from: 3990, duration: 170, text: "OPTIONAL PATH TO MEASURED GPU TRACES", hot: ["MEASURED", "GPU", "TRACES"], accent: cyan },
  { from: 4220, duration: 175, text: "BUILT WITH CODEX + GPT-5.6", hot: ["CODEX", "GPT-5.6"] },
  { from: 4410, duration: 165, text: "DESKTOP OR PHONE. KEEP BUILDING.", hot: ["PHONE.", "BUILDING."] },
  { from: 4610, duration: 175, text: "TRY P99 LIVE", hot: ["P99", "LIVE"] },
];

const KineticCaption: React.FC<Omit<Caption, "from">> = ({ duration, text: caption, hot, accent = acid }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = caption.split(" ");
  const opacity = interpolate(frame, [0, 7, duration - 8, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", zIndex: 80, left: 0, right: 0, top: 105, display: "flex", justifyContent: "center", opacity, pointerEvents: "none" }}>
      <div style={{ maxWidth: 1530, padding: "14px 24px 16px", display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 16, rowGap: 4, border: "1px solid rgba(255,255,255,.14)", borderRadius: 12, background: "rgba(3,6,10,.82)", boxShadow: "0 18px 60px rgba(0,0,0,.48)", backdropFilter: "blur(14px)" }}>
        {words.map((word, index) => {
          const pop = spring({ frame: frame - index * 1.6, fps, config: { damping: 15, stiffness: 190, mass: .65 } });
          const normalized = word.replace(/[,:]/g, "");
          const highlighted = hot.includes(word) || hot.includes(normalized);
          return <span key={`${word}-${index}`} style={{ display: "inline-block", color: highlighted ? accent : text, font: "950 38px/.98 Inter, Arial", letterSpacing: -1.4, textShadow: highlighted ? `0 0 24px ${accent}55` : "0 3px 18px rgba(0,0,0,.8)", transform: `translateY(${(1-pop)*18}px) scale(${.82 + pop*.18})`, opacity: pop }}>{word}</span>;
        })}
      </div>
    </div>
  );
};

const CaptionTrack: React.FC = () => <>{captions.map(caption => <Sequence key={caption.from} from={caption.from} durationInFrames={caption.duration}><KineticCaption {...caption}/></Sequence>)}</>;

export const P99Demo: React.FC = () => (
  <AbsoluteFill style={{ background: bg }}>
    <Audio src={staticFile("audio/p99-voiceover.m4a")} volume={1} />
    <Audio src={staticFile("audio/p99-ambient.m4a")} loop volume={0.45} />
    <Sequence from={0} durationInFrames={210}><Opening duration={210}/></Sequence>
    <Sequence from={210} durationInFrames={360}><ProductScene duration={360} image="01-home.png" step="THE PLATFORM" title="One path from basics to production." copy="Foundations build the vocabulary. The playground builds intuition. Incidents test whether it transfers." accent={cyan} focus={{x:500,y:330,label:"LEARN BY RUNNING"}}/></Sequence>
    <Sequence from={570} durationInFrames={420}><ProductScene duration={420} image="02-foundations.png" step="FOUNDATIONS" title="Build the mental model." copy="Six short, visual labs isolate tail latency, batching, KV cache, quantization, concurrency, and speculative decoding." accent={acid} focus={{x:1350,y:560,label:"PREDICT FIRST"}}/></Sequence>
    <Sequence from={990} durationInFrames={270}><ProductScene duration={270} image="03-foundation-result.png" step="ACTIVE LEARNING" title="Change one variable. Explain why." copy="Immediate causal feedback connects the intervention to the system response." accent={acid} focus={{x:1180,y:670,label:"WHAT CHANGED"}}/></Sequence>
    <Sequence from={1260} durationInFrames={450}><ProductScene duration={450} image="04-playground.png" step="FREE PLAYGROUND" title="Explore without a prescribed answer." copy="Every serving control updates the queue trajectory, SLO readout, and a plain-language causal explanation." accent={cyan} focus={{x:1060,y:500,label:"30-SECOND ROLLOUT"}}/></Sequence>
    <Sequence from={1710} durationInFrames={450}><WorldModelScene duration={450}/></Sequence>
    <Sequence from={2160} durationInFrames={360}><ProductScene duration={360} image="06-incident.png" step="PRODUCTION INCIDENT" title="Now protect five constraints at once." copy="Latency, throughput, VRAM, quality, and cost turn the mental model into an operational challenge." accent={red} focus={{x:180,y:510,label:"THE SLO ENVELOPE"}}/></Sequence>
    <Sequence from={2520} durationInFrames={420}><ProductScene duration={420} image="07-incident-configured.png" step="PREDICT + INTERVENE" title="Commit before seeing the answer." copy="INT4, continuous batching, prefix reuse, and speculative decoding reshape the serving dynamics." accent={cyan} focus={{x:1580,y:560,label:"CHANGE THE STACK"}}/></Sequence>
    <Sequence from={2940} durationInFrames={420}><ProductScene duration={420} image="08-world-model-forecast.png" step="LEARNED FORECAST" title="The queue is predicted to clear." copy="The recursive rollout clears the SLO envelope, but the learned model still does not grade itself." accent={acid} focus={{x:820,y:430,label:"FORECAST FIRST"}}/></Sequence>
    <Sequence from={3360} durationInFrames={420}><ProductScene duration={420} image="09-reference-validated.png" step="VALIDATE" title="An independent trace checks the claim." copy="The reference engine reaches 2.66-second p95, 274 tokens per second, and a 100 out of 100 score." accent={acid} focus={{x:920,y:760,label:"INCIDENT CONTAINED"}}/></Sequence>
    <Sequence from={3780} durationInFrames={420}><BoundaryScene duration={420}/></Sequence>
    <Sequence from={4200} durationInFrames={390}><CodexScene duration={390}/></Sequence>
    <Sequence from={4590} durationInFrames={210}><Closing duration={210}/></Sequence>
    <CaptionTrack/>
  </AbsoluteFill>
);
