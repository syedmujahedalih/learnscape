# P99 demo video

This isolated Remotion project renders the OpenAI Build Week submission video at 1920×1080, 30 fps, and 2 minutes 40 seconds.

```bash
cd video
npm install
npm run render
```

The upload-ready result is `video/out/p99-demo.mp4`. Product frames in `public/p99-v2` were captured from the current deployed application. `public/audio/voiceover.txt` is the narration source and can be re-recorded in the founder's voice without changing the composition.
