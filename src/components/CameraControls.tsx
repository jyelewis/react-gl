import React, { useCallback, useContext } from "react";
import { Camera3DContext } from "./Camera3D";

const movement = 0.25;

export const CameraControls: React.FC = () => {
  const { cameraPosition, setCameraPosition } = useContext(Camera3DContext);

  const up = useCallback(
    () => setCameraPosition(cp => ({ ...cp, y: cp.y + movement })),
    [setCameraPosition]
  );
  const down = useCallback(
    () => setCameraPosition(cp => ({ ...cp, y: cp.y - movement })),
    [setCameraPosition]
  );

  const left = useCallback(
    () => setCameraPosition(cp => ({ ...cp, x: cp.x - movement })),
    [setCameraPosition]
  );
  const right = useCallback(
    () => setCameraPosition(cp => ({ ...cp, x: cp.x + movement })),
    [setCameraPosition]
  );

  return (
    <div>
      <pre>{JSON.stringify(cameraPosition, null, 2)}</pre>
      <button onClick={up}>Up</button>
      <button onClick={down}>Down</button>
      <button onClick={left}>Left</button>
      <button onClick={right}>Right</button>
    </div>
  );
};
