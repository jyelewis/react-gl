import React, { useContext } from "react";
import { MeshViewer } from "./MeshViewer";
import { TerrainOrthoContext } from "./TerrainOrthoHandler";
import { mat4 } from "gl-matrix";

type Props = {
  showAsWireframe?: boolean;
  modelViewMatrix: mat4;
};

export const TerrainMesh: React.FC<Props> = ({
  showAsWireframe,
  modelViewMatrix
}) => {
  const { terrainMesh, orthoImage } = useContext(TerrainOrthoContext);

  return (
    <MeshViewer
      mesh={terrainMesh}
      showAsWireframe={showAsWireframe}
      textureBytes={orthoImage}
      modelViewMatrix={modelViewMatrix}
    />
  );
};
