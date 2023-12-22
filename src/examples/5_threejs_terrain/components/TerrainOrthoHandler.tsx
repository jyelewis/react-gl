import React, { useMemo } from "react";
import { useMapboxTerrain } from "../utilities/useMapboxTerrain";
import { NdArray } from "ndarray";
import { useImagePixels } from "../utilities/useImagePixels";
import { pointsToMesh } from "../utilities/pointsToMesh";
import { Mesh } from "../types/Mesh";

export type TerrainOrthoContextValue = {
  terrainImageUrl: string;
  orthoImageUrl: string;

  width: number;
  height: number;

  orthoImage: NdArray<Uint8Array>;
  terrainImage: NdArray<Uint8Array>;
  terrainHeightMap: NdArray<Uint32Array>;

  terrainMesh: Mesh;
};
export const TerrainOrthoContext = React.createContext<
  TerrainOrthoContextValue
>((null as unknown) as TerrainOrthoContextValue);

type Props = {
  terrainImageUrl: string;
  orthoImageUrl: string;
  children: React.ReactNode;
};

export const TerrainOrthoHandler: React.FC<Props> = ({
  orthoImageUrl,
  terrainImageUrl,
  children
}) => {
  const orthoImage = useImagePixels(orthoImageUrl);
  const terrainImage = useImagePixels(terrainImageUrl);

  const terrainHeightMap = useMapboxTerrain(terrainImage);

  const terrainMesh = useMemo(() => {
    if (terrainHeightMap === undefined) {
      return undefined;
    }

    return pointsToMesh(terrainHeightMap);
  }, [terrainHeightMap]);

  const contextValue = useMemo<undefined | TerrainOrthoContextValue>(() => {
    // block loading until we have everything need provide
    if (
      orthoImage === undefined ||
      terrainImage === undefined ||
      terrainHeightMap === undefined ||
      terrainMesh === undefined
    ) {
      return undefined;
    }

    if (
      orthoImage.shape[0] !== terrainImage.shape[0] ||
      orthoImage.shape[1] !== terrainImage.shape[1]
    ) {
      throw new Error("Ortho tile does not match terrain tile size");
    }

    return {
      terrainImageUrl,
      orthoImageUrl,

      width: orthoImage.shape[0],
      height: orthoImage.shape[1],

      orthoImage,
      terrainImage,
      terrainHeightMap,
      terrainMesh
    };
  }, [
    terrainImageUrl,
    orthoImageUrl,
    orthoImage,
    terrainImage,
    terrainHeightMap,
    terrainMesh
  ]);

  if (contextValue === undefined) {
    return <div>Loading terrain...</div>;
  }

  return (
    <TerrainOrthoContext.Provider value={contextValue}>
      {children}
    </TerrainOrthoContext.Provider>
  );
};
