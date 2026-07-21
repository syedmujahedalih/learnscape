# P99 demo video

This isolated Remotion project renders the OpenAI Build Week submission video at 1920×1080 and 30 fps.

```bash
cd video
npm install
npm run render
```

The upload-ready result is `video/out/p99-youtube-demo.mp4`. The narration uses Tyler from ElevenLabs, with the source in `public/audio/voiceover.txt` and exact alignment metadata beside the generated audio.
