import React, { useContext } from "react";
import { MeshViewer } from "./MeshViewer";
import { TerrainOrthoContext } from "./TerrainOrthoHandler";

export const TerrainMesh: React.FC = () => {
  const { terrainMesh } = useContext(TerrainOrthoContext);

  return <MeshViewer mesh={terrainMesh} />;
};
