import React from "react";
import { Composition } from "remotion";
import { LearnscapeDemo } from "./LearnscapeDemo";

export const VideoRoot: React.FC = () => (
  <Composition
    id="LearnscapeDemo"
    component={LearnscapeDemo}
    durationInFrames={2700}
    fps={30}
    width={1920}
    height={1080}
  />
);
