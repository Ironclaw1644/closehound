import React from "react";
import { Composition } from "remotion";
import { WIDTH, HEIGHT, FPS } from "./theme";
import { Demo } from "./Demo";
import { Loop } from "./Loop";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Demo"
      component={Demo}
      durationInFrames={930}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    <Composition
      id="Loop"
      component={Loop}
      durationInFrames={240}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
