import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { launchWorkload, simulateInference } from "../lib/inference/engine.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const traceDir = path.join(root, "data", "traces");
const outputFile = path.join(root, "lib", "inference", "world-model-weights.ts");
const inputSize = 19;
const hiddenSize = 24;
const outputSize = 6;

let seed = 47;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const choices = values => values[Math.floor(random() * values.length)];
const sigmoid = value => 1 / (1 + Math.exp(-Math.max(-18, Math.min(18, value))));

const normalizeState = state => [state.queueDepth / 420, state.activeRequests / 24, state.vramGb / 24, state.utilization / 100, state.throughput / 350, state.p95Ms / 20_000];
const encode = (config, state, workload, progress) => [
  ...normalizeState(state),
  config.precision === "FP16" ? 1 : 0, config.precision === "INT8" ? 1 : 0, config.precision === "INT4" ? 1 : 0,
  config.batchSize / 16, config.cacheGb / 14, config.concurrency / 24, config.prefixCache ? 1 : 0, config.speculative ? 1 : 0,
  workload.requestRate / 4, workload.demandTokensPerSecond / 350, workload.promptTokens / 4000, workload.outputTokens / 256, progress,
];

function bootstrapSamples() {
  const samples = [];
  for (let run = 0; run < 900; run++) {
    const config = { precision: choices(["FP16","INT8","INT4"]), batchSize: choices([1,8,16]), cacheGb: choices([6,10,14]), concurrency: choices([4,12,24]), prefixCache: random() > .5, speculative: random() > .5 };
    const metrics = simulateInference(config);
    const target = { queueDepth: metrics.queueDepth, activeRequests: metrics.oom ? 0 : Math.min(config.concurrency, Math.max(1, metrics.queueDepth * .08 + 2)), vramGb: metrics.oom ? 24.6 : metrics.vramGb, utilization: metrics.utilization, throughput: metrics.throughput, p95Ms: metrics.p95Ms };
    let state = { queueDepth: 2, activeRequests: 1, vramGb: Math.min(23.8, metrics.vramGb * .82), utilization: 24, throughput: 18, p95Ms: 850 };
    for (let step = 0; step < 12; step++) {
      const progress = step / 11;
      const alpha = .24 + progress * .08;
      const next = Object.fromEntries(Object.keys(state).map(key => [key, state[key] + (target[key] - state[key]) * alpha]));
      samples.push({ x: encode(config, state, launchWorkload, progress), y: normalizeState(next) });
      state = next;
    }
  }
  return samples;
}

function realTraceSamples() {
  if (!fs.existsSync(traceDir)) return [];
  const files = fs.readdirSync(traceDir).filter(file => file.endsWith(".jsonl") || file.endsWith(".json"));
  const samples = [];
  for (const file of files) {
    const contents = fs.readFileSync(path.join(traceDir, file), "utf8");
    const traces = file.endsWith(".jsonl") ? contents.split(/\n+/).filter(Boolean).map(line => JSON.parse(line)) : [JSON.parse(contents)];
    for (const trace of traces) {
      for (let index = 0; index < trace.frames.length - 1; index++) {
        samples.push({ x: encode(trace.config, trace.frames[index], trace.workload, index / Math.max(1, trace.frames.length - 2)), y: normalizeState(trace.frames[index + 1]) });
      }
    }
  }
  return samples;
}

const real = realTraceSamples();
const samples = real.length >= 200 ? real : bootstrapSamples();
const source = real.length >= 200 ? "cloud_and_local_traces" : "bootstrap_synthetic";
const w1 = Array.from({length:hiddenSize},()=>Array.from({length:inputSize},()=> (random()-.5)*.22));
const b1 = Array(hiddenSize).fill(0);
const w2 = Array.from({length:outputSize},()=>Array.from({length:hiddenSize},()=> (random()-.5)*.22));
const b2 = Array(outputSize).fill(0);
let learningRate = .035;
for (let epoch = 0; epoch < 55; epoch++) {
  for (let iteration = 0; iteration < 3200; iteration++) {
    const sample = samples[Math.floor(random()*samples.length)];
    const hidden = w1.map((weights,index)=>Math.tanh(weights.reduce((sum,weight,inputIndex)=>sum+weight*sample.x[inputIndex],b1[index])));
    const output = w2.map((weights,index)=>sigmoid(weights.reduce((sum,weight,hiddenIndex)=>sum+weight*hidden[hiddenIndex],b2[index])));
    const d2 = output.map((value,index)=>2*(value-sample.y[index])*value*(1-value));
    const d1 = hidden.map((value,index)=>w2.reduce((sum,weights,outIndex)=>sum+weights[index]*d2[outIndex],0)*(1-value*value));
    for(let out=0;out<outputSize;out++){for(let h=0;h<hiddenSize;h++)w2[out][h]-=learningRate*d2[out]*hidden[h];b2[out]-=learningRate*d2[out];}
    for(let h=0;h<hiddenSize;h++){for(let input=0;input<inputSize;input++)w1[h][input]-=learningRate*d1[h]*sample.x[input];b1[h]-=learningRate*d1[h];}
  }
  learningRate *= .975;
}

const validation = samples.slice(0,Math.min(1000,samples.length));
let rmse = 0;
for(const sample of validation){const hidden=w1.map((weights,index)=>Math.tanh(weights.reduce((sum,weight,inputIndex)=>sum+weight*sample.x[inputIndex],b1[index])));const output=w2.map((weights,index)=>sigmoid(weights.reduce((sum,weight,hiddenIndex)=>sum+weight*hidden[hiddenIndex],b2[index])));rmse+=output.reduce((sum,value,index)=>sum+(value-sample.y[index])**2,0)/outputSize;}
rmse=Math.sqrt(rmse/validation.length);
const artifact = { w1, b1, w2, b2, meta: { architecture: `${inputSize}→${hiddenSize}→${outputSize} next-state MLP`, parameters: inputSize*hiddenSize+hiddenSize+hiddenSize*outputSize+outputSize, source, transitions: samples.length, validationRmse: Number(rmse.toFixed(5)), trainedAt: new Date().toISOString() } };
fs.writeFileSync(outputFile, `// Generated by scripts/train_inference_world_model.mjs\nexport const inferenceWorldModelWeights = ${JSON.stringify(artifact)} as const;\n`);
console.log(JSON.stringify(artifact.meta,null,2));
