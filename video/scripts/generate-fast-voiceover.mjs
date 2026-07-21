import {readFile, writeFile} from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) {
  throw new Error("ELEVENLABS_API_KEY is not configured.");
}

const transcriptPath = path.resolve("public/audio/p99-fast-voiceover.txt");
const outputPath = path.resolve("public/audio/p99-fast-voiceover.mp3");
const alignmentPath = path.resolve("public/audio/p99-fast-voiceover-alignment.json");
const text = (await readFile(transcriptPath, "utf8")).trim();

const response = await fetch(
  "https://api.elevenlabs.io/v1/text-to-speech/rPMkKgdwgIwqv4fXgR6N/with-timestamps?output_format=mp3_44100_128",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.38,
        similarity_boost: 0.8,
        style: 0.34,
        speed: 1.08,
        use_speaker_boost: true,
      },
    }),
  },
);

if (!response.ok) {
  throw new Error(`ElevenLabs returned ${response.status}: ${await response.text()}`);
}

const result = await response.json();
await writeFile(outputPath, Buffer.from(result.audio_base64, "base64"));
await writeFile(
  alignmentPath,
  `${JSON.stringify(
    {
      voice: "Tyler - Clear US YouTube Creator Voice",
      voiceId: "rPMkKgdwgIwqv4fXgR6N",
      modelId: "eleven_multilingual_v2",
      alignment: result.alignment,
      normalizedAlignment: result.normalized_alignment,
    },
    null,
    2,
  )}\n`,
);

console.log(outputPath);
console.log(alignmentPath);
