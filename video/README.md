# Learnscape demo video

This isolated Remotion project renders the 90-second Build Week demo without adding video dependencies to the Learnscape site.

## Preview and render

```bash
cd video
npm install
npm run studio
npm run render
```

The rendered deliverable is `video/out/learnscape-demo.mp4`. Product frames in `public/captures` were captured from the real local application at 1440 × 900. `public/audio/voiceover.txt` is the narration source and can be re-recorded in the founder's voice without changing the composition.
