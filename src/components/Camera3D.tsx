import React, { useContext, useMemo, useState } from "react";
import { mat4 } from "gl-matrix";
import { WebGLContext } from "./WebGLCanvas";

export type CameraPosition = {
  x: number;
  y: number;
  z: number;
  fov: number;
};

export type Camera3DContextValue = {
  projectionMatrix: mat4;

  cameraPosition: CameraPosition;
  setCameraPosition: React.Dispatch<React.SetStateAction<CameraPosition>>;
};

export const Camera3DContext = React.createContext<Camera3DContextValue>(
  (null as unknown) as Camera3DContextValue
);

type Props = {
  children: React.ReactNode;
};

export const Camera3D: React.FC<Props> = ({ children }) => {
  const { width, height } = useContext(WebGLContext);

  const [cameraPosition, setCameraPosition] = useState<CameraPosition>({
    x: 0,
    y: 0,
    z: 0,
    fov: (45 * Math.PI) / 180 // in radians
  });

  const projectionMatrix = useMemo(() => {
    // create a camera matrix
    const cameraMatrix = mat4.create();
    mat4.identity(cameraMatrix);
    mat4.translate(cameraMatrix, cameraMatrix, [
      -cameraPosition.x,
      -cameraPosition.y,
      -cameraPosition.z
    ]);

    // create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const aspect = width / height;
    const zNear = 0.1;
    const zFar = 100.0;

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, cameraPosition.fov, aspect, zNear, zFar);

    mat4.multiply(projectionMatrix, projectionMatrix, cameraMatrix);

    return projectionMatrix;
  }, [width, height, cameraPosition]);

  const cameraContextValue = useMemo<Camera3DContextValue>(
    () => ({
      projectionMatrix,
      cameraPosition,
      setCameraPosition
    }),
    [projectionMatrix, cameraPosition, setCameraPosition]
  );

  return (
    <Camera3DContext.Provider value={cameraContextValue}>
      {children}
    </Camera3DContext.Provider>
  );
};