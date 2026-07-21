import {mkdir, writeFile} from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
  throw new Error("ELEVENLABS_API_KEY is not configured.");
}

const sampleText =
  "Most people meet inference engineering when latency is already failing in production. " +
  "I built P99 to make those systems easier to understand before that happens. " +
  "Change batching, precision, caching, or concurrency, then watch the queue, memory, throughput, and tail latency respond together. " +
  "You are not memorizing a diagram. You are learning how the serving stack behaves by running it.";

const samples = [
  {
    slug: "eric-smooth",
    voiceId: "cjVigY5qzO86Huf0OWal",
    stability: 0.46,
    style: 0.18,
  },
  {
    slug: "chris-grounded",
    voiceId: "iP95p4xoKVk53GoZ742B",
    stability: 0.42,
    style: 0.22,
  },
  {
    slug: "river-neutral",
    voiceId: "SAz9YHcvj6GT2YYXdXww",
    stability: 0.5,
    style: 0.12,
  },
];

const outputDirectory = path.resolve("out/voice-samples");
await mkdir(outputDirectory, {recursive: true});

for (const sample of samples) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${sample.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: sampleText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: sample.stability,
          similarity_boost: 0.78,
          style: sample.style,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `ElevenLabs returned ${response.status} for ${sample.slug}: ${await response.text()}`,
    );
  }

  const outputPath = path.join(outputDirectory, `${sample.slug}.mp3`);
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
  console.log(outputPath);
}
