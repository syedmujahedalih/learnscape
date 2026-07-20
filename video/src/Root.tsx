import React from "react";
import { Composition } from "remotion";
import { P99Demo } from "./P99Demo";

export const VideoRoot: React.FC = () => (
  <Composition
    id="P99Demo"
    component={P99Demo}
    durationInFrames={4410}
    fps={30}
    width={1920}
    height={1080}
  />
);
