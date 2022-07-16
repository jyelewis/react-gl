import React from "react";
import { WebGLCanvas } from "../../components/WebGLCanvas";
import { Triangle } from "./Triangle";

export const TriangleExample: React.FC = () => {
  return (
    <div>
      <WebGLCanvas width={500} height={500}>
        <Triangle />
      </WebGLCanvas>
    </div>
  );
};
