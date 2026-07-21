import React from "react";
import { Composition } from "remotion";
import { P99Demo } from "./P99Demo";
import { P99FastDemo } from "./P99FastDemo";
import { P99JudgeDemo } from "./P99JudgeDemo";

export const VideoRoot: React.FC = () => <>
  <Composition id="P99Demo" component={P99Demo} durationInFrames={3300} fps={30} width={1920} height={1080}/>
  <Composition id="P99FastDemo" component={P99FastDemo} durationInFrames={1350} fps={30} width={1920} height={1080}/>
  <Composition id="P99JudgeDemo" component={P99JudgeDemo} durationInFrames={2700} fps={30} width={1920} height={1080}/>
</>;
