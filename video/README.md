# P99 demo video

This isolated Remotion project renders the OpenAI Build Week submission video at 1920×1080 and 30 fps.

```bash
cd video
npm install
npm run render
```

The upload-ready result is `video/out/p99-youtube-demo.mp4`. The narration uses Tyler from ElevenLabs, with the source in `public/audio/voiceover.txt` and exact alignment metadata beside the generated audio.

## Fast product cut

The 45-second product trailer uses the current Foundations, Playground, and Incident Lab screens with faster scene changes, animated callouts, and a dedicated ElevenLabs narration.

```bash
cd video
npm run render:fast
```

The upload-ready result is `video/out/p99-fast-demo.mp4`. Its narration source is `public/audio/p99-fast-voiceover.txt`.

## Judge cut

The 90-second judge cut keeps the trailer pacing while adding a coherent product walkthrough, measured-runner signals, Codex and GPT-5.6 usage, and a clear separation between what works today and future work.

```bash
cd video
npm run render:judge
```

The upload-ready result is `video/out/p99-judge-demo.mp4`. This remains available as the product-first alternate cut.

## Personal Devpost cut

The recommended 90-second submission cut opens with Philip Kiely's observation that inference engineering is still in its infancy, then gives the founder motivation behind P99 before moving through the product, measured-runner boundary, Codex and GPT-5.6 usage, and future work.

```bash
cd video
npm run render:personal
```

Use `video/out/p99-personal-demo.mp4` for the Devpost submission. The quote is sourced from [Philip Kiely's books page](https://philipkiely.com/books). Its ElevenLabs narration source is `public/audio/p99-personal-voiceover.txt`.
