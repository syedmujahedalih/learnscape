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
  const bar = interpolate(frame, [32, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 72% 42%, #153f42, transparent 35%), ${bg}`, color: text, opacity: fade(frame, duration), overflow: "hidden" }}>
      <Grid />
      <Chrome label="OPENAI BUILD WEEK · EDUCATION" />
      <div style={{ position: "absolute", left: 120, top: 245, opacity: enter, transform: `translateY(${(1 - enter) * 48}px)` }}>
        <div style={{ color: cyan, font: "800 13px ui-monospace, monospace", letterSpacing: 4.5 }}>THE FLIGHT SIMULATOR FOR</div>
        <div style={{ marginTop: 26, font: "900 104px/.91 Inter, Arial", letterSpacing: -7, maxWidth: 1160 }}>
          INFERENCE<br />
          <span style={{ color: acid }}>ENGINEERS.</span>
        </div>
        <div style={{ marginTop: 34, width: 790, color: "#a6b3bd", font: "400 26px/1.5 Inter, Arial" }}>
          Fight production incidents. Predict the failure. Change the stack. Learn why the system moves.
        </div>
      </div>
      <div style={{ position: "absolute", right: 120, top: 255, width: 490, border: `1px solid ${line}`, borderRadius: 18, padding: 28, background: "rgba(7,11,16,.92)", boxShadow: "0 40px 100px rgba(0,0,0,.45)", opacity: enter }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: muted, font: "700 10px ui-monospace, monospace", letterSpacing: 1.8 }}><span>PRODUCTION / US-WEST-2</span><span style={{ color: red }}>● INCIDENT</span></div>
        <div style={{ marginTop: 34, color: muted, font: "700 11px ui-monospace, monospace", letterSpacing: 1.4 }}>P95 LATENCY</div>
        <div style={{ marginTop: 5, color: text, font: "800 70px ui-monospace, monospace", letterSpacing: -5 }}>14.82<span style={{ color: muted, fontSize: 24 }}>s</span></div>
        <div style={{ marginTop: 16, height: 10, borderRadius: 3, background: "#202b35", overflow: "hidden" }}><div style={{ width: `${bar * 96}%`, height: "100%", background: `linear-gradient(90deg,${amber},${red})`, boxShadow: `0 0 18px ${red}` }} /></div>
        <div style={{ marginTop: 15, color: red, font: "700 11px ui-monospace, monospace" }}>SLO 4.00s · +1,184%</div>
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
        <Img src={staticFile(`p99/${image}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
      <Chrome label="HOW IT WORKS" status="LEARNED DYNAMICS" />
      <div style={{ position: "absolute", left: 110, right: 110, top: 160, textAlign: "center", opacity: enter }}>
        <div style={{ color: cyan, font: "800 12px ui-monospace, monospace", letterSpacing: 3.6 }}>WORLD MODEL ≠ ONE-SHOT SCORE</div>
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

const CodexScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 17, stiffness: 82 } });
  const tasks = ["PRESSURE-TEST THE WEDGE", "PIVOT TO INFERENCE ENGINEERING", "IMPLEMENT WORLD MODEL", "BUILD MODAL TRACE RUNNER", "TEST · DOCUMENT · DEPLOY"];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 24% 48%, #173a37, transparent 34%), ${bg}`, color: text, opacity: fade(frame, duration), overflow: "hidden" }}>
      <Grid />
      <Chrome label="TECHNOLOGICAL IMPLEMENTATION" status="CODEX + GPT-5.6" />
      <div style={{ position: "absolute", left: 120, top: 220, width: 710, opacity: enter }}>
        <div style={{ color: acid, font: "900 13px ui-monospace, monospace", letterSpacing: 3.6 }}>BUILT WITH CODEX + GPT-5.6</div>
        <div style={{ marginTop: 25, font: "850 70px/.96 Inter, Arial", letterSpacing: -4.3 }}>From product pivot<br/>to deployed system.</div>
        <div style={{ marginTop: 32, width: 650, color: "#a5b2bc", font: "450 22px/1.55 Inter, Arial" }}>Codex was the engineering collaborator across architecture, implementation, scientific boundaries, testing, and deployment.</div>
      </div>
      <div style={{ position: "absolute", left: 990, right: 120, top: 185, padding: 29, border: `1px solid ${line}`, borderRadius: 15, background: "rgba(7,12,17,.92)", boxShadow: "0 35px 100px rgba(0,0,0,.45)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 26 }}><i style={{ width: 9, height: 9, borderRadius: 99, background: red }}/><i style={{ width: 9, height: 9, borderRadius: 99, background: amber }}/><i style={{ width: 9, height: 9, borderRadius: 99, background: acid }}/></div>
        {tasks.map((task, index) => {
          const item = spring({ frame: frame - index * 11, fps, config: { damping: 17, stiffness: 100 } });
          return <div key={task} style={{ minHeight: 91, display: "grid", gridTemplateColumns: "38px 1fr auto", gap: 15, alignItems: "center", borderTop: index ? "1px solid #1d2932" : undefined, opacity: item, transform: `translateX(${(1-item)*30}px)` }}><span style={{ color: "#3f515e", font: "700 11px ui-monospace, monospace" }}>{String(index+1).padStart(2,"0")}</span><b style={{ font: "800 13px ui-monospace, monospace", letterSpacing: 1.2 }}>{task}</b><span style={{ color: acid, font: "900 12px ui-monospace, monospace" }}>✓</span></div>;
        })}
        <div style={{ marginTop: 22, padding: "14px 16px", borderRadius: 7, background: "#101a22", color: cyan, font: "700 11px ui-monospace, monospace", letterSpacing: 1 }}>6 TESTS PASSING · PRODUCTION BUILD · CODEX SITE LIVE</div>
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
        <div style={{ font: "900 86px/.92 Inter, Arial", letterSpacing: -5.5 }}>BREAK THE STACK.<br/><span style={{ color: acid }}>LEARN WHY.</span></div>
        <div style={{ marginTop: 33, color: "#aab8c2", font: "450 24px Inter, Arial" }}>Predict · Intervene · Roll out · Validate</div>
        <div style={{ marginTop: 62, display: "inline-flex", alignItems: "center", gap: 15, padding: "16px 23px", border: `1px solid ${line}`, borderRadius: 8, background: "rgba(7,12,17,.85)", color: cyan, font: "800 13px ui-monospace, monospace", letterSpacing: 1.2 }}><span style={{ width: 7, height: 7, borderRadius: 99, background: acid, boxShadow: `0 0 14px ${acid}` }}/> LIVE DEMO · learnscape-education.syedmujahedalih.chatgpt.site</div>
      </div>
      <Scanlines />
    </AbsoluteFill>
  );
};

export const P99Demo: React.FC = () => (
  <AbsoluteFill style={{ background: bg }}>
    <Audio src={staticFile("audio/p99-voiceover.m4a")} volume={1} />
    <Audio src={staticFile("audio/p99-ambient.m4a")} volume={0.7} />
    <Sequence from={0} durationInFrames={270}><Opening duration={270}/></Sequence>
    <Sequence from={270} durationInFrames={510}><ProductScene duration={510} image="01-home.png" step="THE PROBLEM" title="Production is a brutal classroom." copy="Inference engineers need causal intuition before a real launch turns into an expensive lesson." accent={red} focus={{x:1385,y:330,label:"P95 · 14.82s"}}/></Sequence>
    <Sequence from={780} durationInFrames={510}><ProductScene duration={510} image="02-incident.png" step="MISSION 01" title="Five constraints. One intervention." copy="Latency, throughput, VRAM, quality, and cost move together. The learner must protect all five." accent={amber} focus={{x:195,y:410,label:"THE SLO ENVELOPE"}}/></Sequence>
    <Sequence from={1290} durationInFrames={570}><WorldModelScene duration={570}/></Sequence>
    <Sequence from={1860} durationInFrames={390}><ProductScene duration={390} image="03-baseline-rollout.png" step="PREDICT" title="The baseline collapses." copy="Incoming token demand outruns decode capacity. Queue growth becomes the lesson—not a tooltip." accent={red} focus={{x:810,y:260,label:"389 QUEUED"}}/></Sequence>
    <Sequence from={2250} durationInFrames={510}><ProductScene duration={510} image="04-intervention.png" step="INTERVENE" title="Change the serving stack." copy="INT4, continuous batching, prefix reuse, and speculative decoding reshape the system dynamics." accent={cyan} focus={{x:1600,y:455,label:"TUNE THE STACK"}}/></Sequence>
    <Sequence from={2760} durationInFrames={450}><ProductScene duration={450} image="05-success-forecast.png" step="ROLL OUT" title="Forecast before validation." copy="The learned model predicts a stable state. Its answer is visible—but it does not grade itself." accent={acid} focus={{x:840,y:810,label:"WORLD MODEL"}}/></Sequence>
    <Sequence from={3210} durationInFrames={390}><ProductScene duration={390} image="07-contained.png" step="VALIDATE" title="Reality gets the final vote." copy="An independent reference trace clears every SLO: 2.66-second p95, 274 tokens per second, 100 out of 100." accent={acid} focus={{x:1040,y:855,label:"INCIDENT CONTAINED"}}/></Sequence>
    <Sequence from={3600} durationInFrames={360}><CloudScene duration={360}/></Sequence>
    <Sequence from={3960} durationInFrames={300}><CodexScene duration={300}/></Sequence>
    <Sequence from={4260} durationInFrames={150}><Closing duration={150}/></Sequence>
  </AbsoluteFill>
);
