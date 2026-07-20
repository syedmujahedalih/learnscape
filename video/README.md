# P99 demo video

This isolated Remotion project renders the OpenAI Build Week submission video at 1920×1080, 30 fps, and under three minutes.

```bash
cd video
npm install
npm run render
```

The upload-ready result is `video/out/p99-demo.mp4`. Product frames in `public/p99` were captured from the real local application. `public/audio/voiceover.txt` is the narration source and can be re-recorded in the founder's voice without changing the composition.
