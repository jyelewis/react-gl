import React, { useState } from "react";
import { WebGLCanvas } from "../../components/WebGLCanvas";
import { Camera3D } from "../../components/Camera3D";
import { Square } from "./Square";
import { CameraControls } from "../../components/CameraControls";

export const SquaresExample: React.FC = () => {
  const [depth, setDepth] = useState(-6);

  return (
    <div>
      <WebGLCanvas width={500} height={500}>
        <Camera3D>
          <Square x={0} y={0} z={depth} timeOffset={0} />
          <Square x={0} y={0} z={depth} timeOffset={100} />
          <Square x={0} y={0} z={depth} timeOffset={200} />
          <Square x={0} y={0} z={depth} timeOffset={300} />
          <CameraControls />
        </Camera3D>
      </WebGLCanvas>
      <br />
      Depth: {depth}
      <br />
      <button onClick={() => setDepth(x => x - 1)}>-</button>
      <button onClick={() => setDepth(x => x + 1)}>+</button>
    </div>
  );
};
