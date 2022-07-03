import React from "react";
import { WebGLCanvas } from "../../components/WebGLCanvas";
import { Camera3D } from "../../components/Camera3D";
import { CameraControls } from "../../components/CameraControls";
import { Cube } from "./Cube";

export const CubeExample: React.FC = () => {
  return (
    <WebGLCanvas width={500} height={500}>
      <Camera3D>
        <Cube />
        <CameraControls />
      </Camera3D>
    </WebGLCanvas>
  );
};
