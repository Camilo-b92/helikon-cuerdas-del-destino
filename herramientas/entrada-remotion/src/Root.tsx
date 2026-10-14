import React from "react";
import { Composition } from "remotion";
import { Escena } from "./Escena";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Escena" component={Escena} durationInFrames={285} fps={25} width={1600} height={900} />
    </>
  );
};
