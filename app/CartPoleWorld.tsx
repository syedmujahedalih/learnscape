"use client";

import { useEffect, useState } from "react";
import { cartPoleScore, cartPoleStart, isRecovered, nominalCartPole, stepCartPole, type CartPoleState } from "@/lib/cartpole/engine";
import { cartPoleLatentError, cartPoleWorldModelInfo, encodeCartPole, planCartPole, type LatentPlan } from "@/lib/cartpole/model";

type Scenario = "known" | "hidden-friction";

const degrees = (value: number) => value * 180 / Math.PI;
const priorObservation = (state: CartPoleState): CartPoleState => ({ ...state, x: state.x - state.xVelocity * .04, angle: state.angle - state.angularVelocity * .04 });

export default function CartPoleWorld({ onBack }: { onBack: () => void }) {
  const [initial] = useState(() => cartPoleStart());
  const [previous, setPrevious] = useState<CartPoleState>(() => priorObservation(initial));
  const [state, setState] = useState<CartPoleState>(initial);
  const [scenario, setScenario] = useState<Scenario>("known");
  const [prediction, setPrediction] = useState("");
  const [plan, setPlan] = useState<LatentPlan | null>(null);
  const [actualRollout, setActualRollout] = useState<CartPoleState[]>([]);
  const [modelRollout, setModelRollout] = useState<CartPoleState[]>([]);
  const [errors, setErrors] = useState<number[]>([]);
  const [frame, setFrame] = useState(0);
  const [running, setRunning] = useState(false);

  const visibleState = actualRollout[frame] ?? state;
  const imaginedState = modelRollout[frame] ?? plan?.imagined[Math.min(frame, plan.imagined.length - 1)];
  const latent = encodeCartPole(previous, visibleState);
  const averageError = errors.length ? errors.reduce((sum, value) => sum + value, 0) / errors.length : 0;
  const recovered = actualRollout.length > 0 && isRecovered(actualRollout.at(-1)!);
  const surprise = averageError < .018 ? "low" : averageError < .03 ? "noticeable" : "high";

  useEffect(() => {
    if (!running || actualRollout.length === 0) return;
    const timer = window.setInterval(() => {
      setFrame(current => {
        if (current >= actualRollout.length - 1) {
          window.clearInterval(timer);
          setRunning(false);
          return current;
        }
        return current + 1;
      });
    }, 55);
    return () => window.clearInterval(timer);
  }, [actualRollout, running]);

  const reset = (nextScenario = scenario) => {
    const start = cartPoleStart();
    setScenario(nextScenario);
    setPrevious(priorObservation(start));
    setState(start);
    setPrediction("");
    setPlan(null);
    setActualRollout([]);
    setModelRollout([]);
    setErrors([]);
    setFrame(0);
    setRunning(false);
  };

  const imagine = () => {
    setPlan(planCartPole(previous, state));
    setActualRollout([]);
    setModelRollout([]);
    setErrors([]);
    setFrame(0);
  };

  const execute = () => {
    if (!plan) return;
    const parameters = scenario === "hidden-friction" ? { ...nominalCartPole, cartFriction: 4 } : nominalCartPole;
    const rollout: CartPoleState[] = [];
    const imagined: CartPoleState[] = [];
    const nextErrors: number[] = [];
    let prior = previous;
    let current = state;
    for (let step = 0; step < 20; step += 1) {
      const livePlan = planCartPole(prior, current);
      const action = livePlan.actions[0];
      imagined.push(livePlan.imagined[0]);
      const nextState = stepCartPole(current, action, parameters);
      nextErrors.push(cartPoleLatentError(prior, current, nextState, action));
      rollout.push(nextState);
      prior = current;
      current = nextState;
    }
    setActualRollout(rollout);
    setModelRollout(imagined);
    setErrors(nextErrors);
    setFrame(0);
    setRunning(true);
    setPrevious(prior);
    setState(current);
  };

  const cartLeft = 50 + Math.max(-2.4, Math.min(2.4, visibleState.x)) / 2.4 * 34;
  const ghostLeft = imaginedState ? 50 + Math.max(-2.4, Math.min(2.4, imaginedState.x)) / 2.4 * 34 : cartLeft;

  return <section className="wm-view">
    <header className="wm-header"><button className="back" onClick={onBack}>← Learnscape</button><div><span>WORLD MODEL LAB · CARTPOLE</span><h1>Can a model catch a falling pole?</h1></div><button className="reset-button" onClick={() => reset()}>↺ Reset</button></header>
    <div className="wm-grid">
      <aside className="wm-lesson">
        <div className="wm-step active"><span>01</span><div><small>MAKE A CLAIM</small><h2>Will its imagined plan survive reality?</h2></div></div>
        <p>The pole is already falling. The model sees two rendered frames—not the hidden simulator state—and must choose forces that bring it upright.</p>
        <div className="wm-predictions">
          <button className={prediction === "recover" ? "selected" : ""} onClick={() => setPrediction("recover")}>The model will recover it</button>
          <button className={prediction === "surprised" ? "selected" : ""} onClick={() => setPrediction("surprised")}>The changed world will surprise it</button>
        </div>
        <div className="wm-scenario"><small>CHOOSE THE WORLD</small><button className={scenario === "known" ? "selected" : ""} onClick={() => reset("known")}><b>Known dynamics</b><span>Matches its training world</span></button><button className={scenario === "hidden-friction" ? "selected" : ""} onClick={() => reset("hidden-friction")}><b>Hidden friction</b><span>A rule changes without warning</span></button></div>
        <div className="wm-actions"><button className="primary-button" disabled={!prediction || running} onClick={imagine}>{plan ? "Imagine again" : "Imagine 768 futures"}<span>→</span></button><button className="secondary-button" disabled={!plan || running} onClick={execute}>{running ? "Reality is running…" : "Run the chosen plan"}</button></div>
      </aside>

      <section className="wm-stage" aria-label="CartPole model prediction compared with the physics environment">
        <div className="wm-stage-top"><div><span>AUTHORITATIVE WORLD</span><b>Physics execution</b></div><div className="wm-live"><i/> {running ? "RUNNING" : actualRollout.length ? "OBSERVED" : "READY"}</div></div>
        <div className="wm-track"><div className="wm-cart actual" style={{ left: `${cartLeft}%` }}><i style={{ transform: `rotate(${degrees(visibleState.angle)}deg)` }}/><b/></div>{imaginedState && <div className="wm-cart imagined" style={{ left: `${ghostLeft}%` }}><i style={{ transform: `rotate(${degrees(imaginedState.angle)}deg)` }}/><b/></div>}</div>
        <div className="wm-legend"><span><i className="actual-dot"/> Physics</span><span><i className="imagined-dot"/> Model imagination</span></div>
        <div className="wm-readouts"><article><small>POLE ANGLE</small><b>{degrees(visibleState.angle).toFixed(1)}°</b></article><article><small>STABILITY</small><b>{cartPoleScore(visibleState)} / 100</b></article><article><small>MODEL SURPRISE</small><b>{errors.length ? surprise : "—"}</b></article></div>
        {actualRollout.length > 0 && !running && <div className={`wm-verdict ${recovered ? "success" : "failure"}`}><span>{recovered ? "✓" : "!"}</span><div><b>{recovered ? "The plan transferred." : "The rollout missed its goal."}</b><p>{scenario === "hidden-friction" ? "The learned dynamics expected the training world. Hidden friction changed the evidence—exactly the failure a controls student should investigate." : "Compare the imagined ghost with the physics result, then replan from the new observation."}</p></div></div>}
      </section>

      <aside className="wm-model-panel">
        <p className="kicker">INSIDE THE MODEL</p><h2>Pixels become a state it can imagine with.</h2>
        <div className="wm-pipeline"><div><span>01</span><b>Two frames</b><small>24 × 24 grayscale observations</small></div><i>→</i><div><span>02</span><b>8D latent</b><small>Compact learned representation</small></div><i>→</i><div><span>03</span><b>Next latent</b><small>Conditioned on left / coast / right</small></div></div>
        <div className="wm-latent"><small>LIVE LATENT STATE</small><div>{latent.map((value, index) => <i key={index} style={{ height: `${Math.max(12, Math.min(100, 34 + value * 18))}%` }} title={`z${index + 1}: ${value.toFixed(2)}`}/>)}</div></div>
        <dl><div><dt>Training transitions</dt><dd>{cartPoleWorldModelInfo.trainingSamples.toLocaleString()}</dd></div><div><dt>Learned parameters</dt><dd>{cartPoleWorldModelInfo.parameters.toLocaleString()}</dd></div><div><dt>Planning</dt><dd>{plan ? `${plan.candidates} candidates × ${plan.iterations} rounds` : "CEM in latent space"}</dd></div><div><dt>One-step latent RMSE</dt><dd>{cartPoleWorldModelInfo.latentOneStepRmse.toFixed(3)}</dd></div></dl>
        <details><summary>What is—and isn’t—learned?</summary><p>The encoder and action-conditioned transition are learned from rendered trajectories. A small physics probe makes the latent readable. The analytic CartPole environment remains the judge, so model failure is visible rather than hidden.</p></details>
      </aside>
    </div>
  </section>;
}
