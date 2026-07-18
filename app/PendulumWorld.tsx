"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { approximatePeriod, simulatePendulum, type PendulumParameters, type PendulumPoint } from "@/lib/pendulum/engine";
import { forecastPendulum, pendulumModelInfo } from "@/lib/pendulum/model";

type Props = {
  length: number;
  mass: number;
  angle: number;
  damping: number;
  setLength: (value: number) => void;
  setMass: (value: number) => void;
  setAngle: (value: number) => void;
  setDamping: (value: number) => void;
  locked: boolean;
  focused: boolean;
  focus: "compare_mass" | "compare_length" | "trace_energy";
  onExperiment: () => void;
};

const closest = (points: PendulumPoint[], time: number) => points[Math.min(points.length - 1, Math.max(0, Math.round(time / (points[1]?.time || .04))))];

export default function PendulumWorld({ length, mass, angle, damping, setLength, setMass, setAngle, setDamping, locked, focused, focus, onExperiment }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);
  const elapsedRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [readout, setReadout] = useState({ time: 0, actual: angle * Math.PI / 180, forecast: angle * Math.PI / 180, kinetic: 0, potential: 0, total: 1 });
  const parameters = useMemo<PendulumParameters>(() => ({ length, mass, gravity: 9.81, damping, initialAngleDeg: angle }), [length, mass, angle, damping]);
  const trajectory = useMemo(() => simulatePendulum(parameters, 8, 1 / 60), [parameters]);
  const forecast = useMemo(() => forecastPendulum(parameters, 8), [parameters]);
  const maxEnergy = Math.max(trajectory[0]?.total ?? 1, .001);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => {
    elapsedRef.current = 0;
    const frame = requestAnimationFrame(() => {
      setRunning(false);
      setReadout({ time: 0, actual: angle * Math.PI / 180, forecast: angle * Math.PI / 180, kinetic: 0, potential: maxEnergy, total: maxEnergy });
    });
    return () => cancelAnimationFrame(frame);
  }, [angle, damping, length, mass, maxEnergy]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07101f);
    scene.fog = new THREE.Fog(0x07101f, 7, 12);
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / Math.max(1, mount.clientHeight), .1, 100);
    camera.position.set(0, .15, 5.8);
    camera.lookAt(0, .15, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xbcd9ff, 0x111528, 2.2));
    const key = new THREE.DirectionalLight(0xffd98a, 4.2);
    key.position.set(3, 4, 4); key.castShadow = true; scene.add(key);
    const rim = new THREE.PointLight(0x6eb9ff, 18, 8); rim.position.set(-3, 1.5, 2); scene.add(rim);

    const metal = new THREE.MeshStandardMaterial({ color: 0x65758d, metalness: .85, roughness: .25 });
    const warmMetal = new THREE.MeshStandardMaterial({ color: 0xd69a55, metalness: .82, roughness: .2 });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.3, .12, .18), metal); beam.position.y = 1.72; beam.castShadow = true; scene.add(beam);
    [-1.45, 1.45].forEach(x => { const post = new THREE.Mesh(new THREE.CylinderGeometry(.05, .08, 3.6, 20), metal); post.position.set(x, 0, 0); post.castShadow = true; scene.add(post); });
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .34, 24), warmMetal); pivot.rotation.x = Math.PI / 2; pivot.position.y = 1.62; scene.add(pivot);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 64), new THREE.MeshStandardMaterial({ color: 0x111b2d, metalness: .15, roughness: .8 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -1.9; floor.receiveShadow = true; scene.add(floor);
    const rings = new THREE.GridHelper(8, 16, 0x243653, 0x17253b); rings.position.y = -1.89; scene.add(rings);

    const cordMaterial = new THREE.MeshStandardMaterial({ color: 0xdce8ee, metalness: .15, roughness: .4 });
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 1, 12), cordMaterial); cord.castShadow = true; scene.add(cord);
    const bob = new THREE.Mesh(new THREE.SphereGeometry(.23 + mass * .035, 48, 48), warmMetal); bob.castShadow = true; scene.add(bob);
    const ghostMaterial = new THREE.MeshBasicMaterial({ color: 0x80c8ff, wireframe: true, transparent: true, opacity: .66 });
    const ghostBob = new THREE.Mesh(new THREE.SphereGeometry(.27, 24, 24), ghostMaterial); scene.add(ghostBob);
    const ghostCord = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x80c8ff, transparent: true, opacity: .36 })); scene.add(ghostCord);

    const makeTrail = (points: PendulumPoint[], color: number, opacity: number) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points.filter((_, i) => i % 3 === 0).map(point => new THREE.Vector3(point.x, 1.62 + point.y, 0)));
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity })); scene.add(line); return line;
    };
    const actualTrail = makeTrail(trajectory.slice(0, 135), 0xf0b563, .35);
    const forecastTrail = makeTrail(forecast.slice(0, 58), 0x76c5ff, .32);

    const pivotPosition = new THREE.Vector3(0, 1.62, 0);
    const updateCord = (mesh: THREE.Mesh, target: THREE.Vector3) => {
      const direction = target.clone().sub(pivotPosition);
      mesh.position.copy(pivotPosition).add(target).multiplyScalar(.5);
      mesh.scale.set(1, direction.length(), 1);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    };
    let frame = 0;
    let last = performance.now();
    let animation = 0;
    const animate = (now: number) => {
      const delta = Math.min(.04, (now - last) / 1000); last = now;
      if (runningRef.current) {
        elapsedRef.current = Math.min(7.95, elapsedRef.current + delta);
        if (elapsedRef.current >= 7.95) { runningRef.current = false; setRunning(false); }
      }
      const actual = closest(trajectory, elapsedRef.current);
      const predicted = closest(forecast, elapsedRef.current);
      const actualPosition = new THREE.Vector3(actual.x, 1.62 + actual.y, 0);
      const predictedPosition = new THREE.Vector3(predicted.x, 1.62 + predicted.y, -.08);
      bob.position.copy(actualPosition); ghostBob.position.copy(predictedPosition);
      updateCord(cord, actualPosition);
      ghostCord.geometry.setFromPoints([pivotPosition, predictedPosition]);
      actualTrail.material.opacity = .24 + .1 * Math.sin(now / 900);
      forecastTrail.material.opacity = .25 + .08 * Math.cos(now / 800);
      if (frame++ % 5 === 0) setReadout({ time: elapsedRef.current, actual: actual.theta, forecast: predicted.theta, kinetic: actual.kinetic, potential: actual.potential, total: actual.total });
      renderer.render(scene, camera);
      animation = requestAnimationFrame(animate);
    };
    animation = requestAnimationFrame(animate);

    const resize = new ResizeObserver(() => { if (!mount.clientWidth || !mount.clientHeight) return; camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); });
    resize.observe(mount);
    return () => { cancelAnimationFrame(animation); resize.disconnect(); renderer.dispose(); scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Line) { object.geometry.dispose(); const material = object.material; if (Array.isArray(material)) material.forEach(item => item.dispose()); else material.dispose(); } }); mount.removeChild(renderer.domElement); };
  }, [trajectory, forecast, length, mass]);

  const release = () => { elapsedRef.current = 0; setRunning(true); onExperiment(); };
  const reset = () => { elapsedRef.current = 0; setRunning(false); };
  const kineticShare = Math.max(0, Math.min(100, readout.kinetic / maxEnergy * 100));
  const potentialShare = Math.max(0, Math.min(100, readout.potential / maxEnergy * 100));
  const errorDegrees = Math.abs(readout.actual - readout.forecast) * 180 / Math.PI;
  const focusTitle = focus === "compare_mass" ? "Change only the mass" : focus === "compare_length" ? "Change only the length" : "Watch energy move";

  return <div className="world-layout pendulum-world-layout"><section className="world-canvas pendulum-canvas">
    <div ref={mountRef} className="three-stage" aria-hidden="true" />
    <div className="observatory-heading"><span>WORLD 01 · DYNAMICS</span><b>The Pendulum Observatory</b></div>
    <div className="energy-dock"><div className="energy-title"><span>ENERGY EXCHANGE</span><b>{readout.total.toFixed(2)} J</b></div><div className="energy-row"><small>Potential</small><div><i style={{ width: `${potentialShare}%` }}/></div><b>{readout.potential.toFixed(2)} J</b></div><div className="energy-row kinetic"><small>Kinetic</small><div><i style={{ width: `${kineticShare}%` }}/></div><b>{readout.kinetic.toFixed(2)} J</b></div></div>
    <p className="screen-reader-readout">At {readout.time.toFixed(1)} seconds the observed angle is {(readout.actual * 180 / Math.PI).toFixed(1)} degrees and the Learnscape forecast differs by {errorDegrees.toFixed(2)} degrees.</p>
  </section><aside className={`control-panel pendulum-controls ${locked ? "is-locked" : ""}`}>{locked && <div className="control-lock"><span>◎</span><b>Predict before you release</b><small>Your hypothesis unlocks the observatory controls.</small></div>}
    <p className="kicker">{focused ? "YOUR TEST" : "BEFORE YOU BEGIN"}</p><h3>{focused ? focusTitle : "Make a prediction below"}</h3>
    {focused ? <div className="focused-setup"><span><small>Length</small><b>{length.toFixed(1)} m</b></span><span><small>Mass</small><b>{mass.toFixed(1)} kg</b></span><span><small>Release</small><b>{angle}°</b></span><p>One variable changed. Everything else stays fixed.</p></div> : <div className="setup-preview"><p>Choose what you expect first. Learnscape will prepare one useful test.</p></div>}
    <div className="pendulum-actions"><button disabled={locked} className="release-button" onClick={release}>{running ? "Run again" : "Release pendulum"} <span>▶</span></button><button disabled={locked} onClick={reset} aria-label="Reset pendulum">↺</button></div>
    <div className="metric-grid pendulum-metrics"><div><small>SWING TIME</small><b>{approximatePeriod(length).toFixed(2)} s</b></div><div><small>PEAK ENERGY</small><b>{maxEnergy.toFixed(2)} J</b></div></div>
    <details className="free-explore"><summary>Explore other settings</summary><label>Release angle <b>{angle}°</b><input disabled={locked} aria-label="Release angle" type="range" min="10" max="75" step="5" value={angle} onChange={event => setAngle(Number(event.target.value))}/></label><label>Length <b>{length.toFixed(1)} m</b><input disabled={locked} aria-label="Pendulum length" type="range" min=".7" max="2.3" step=".1" value={length} onChange={event => setLength(Number(event.target.value))}/></label><label>Bob mass <b>{mass.toFixed(1)} kg</b><input disabled={locked} aria-label="Bob mass" type="range" min=".5" max="3" step=".5" value={mass} onChange={event => setMass(Number(event.target.value))}/></label><label>Damping <b>{damping === 0 ? "none" : damping.toFixed(2)}</b><input disabled={locked} aria-label="Pendulum damping" type="range" min="0" max=".12" step=".01" value={damping} onChange={event => setDamping(Number(event.target.value))}/></label></details>
    <details className="how-it-works"><summary>See how Learnscape checks this</summary><p>The amber pendulum is the physics reference. The blue shadow is a tiny learned forecast checked against it.</p><small>{errorDegrees.toFixed(2)}° difference now · {pendulumModelInfo.parameters.toLocaleString()} learned parameters</small></details>
  </aside></div>;
}
