import { useMemo } from "react";
import ndarray, { NdArray } from "ndarray";

// converts mapbox heightmap image into NdArray height map (width, height)
export function useMapboxTerrain(
  terrainImage: undefined | NdArray<Uint8Array>
): undefined | NdArray<Uint32Array> {
  return useMemo(() => {
    if (terrainImage === undefined) {
      return;
    }

    const imageWidth = terrainImage.shape[0];
    const imageHeight = terrainImage.shape[1];

    // only need 24 bits per value, but there is no typed array available for this, so use 32 bits
    const sampledPoints = ndarray(new Uint32Array(imageWidth * imageHeight), [
      imageWidth,
      imageHeight
    ]);

    for (let x = 0; x < imageWidth; x++) {
      for (let y = 0; y < imageHeight; y++) {
        const r = terrainImage.get(x, y, 0);
        const g = terrainImage.get(x, y, 1);
        const b = terrainImage.get(x, y, 2);

        // mapbox represents each 8 bits as a different colour
        // revert to get elevation in meters
        const height = -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
        sampledPoints.set(x, y, height);
      }
    }

    return sampledPoints;
  }, [terrainImage]);
}
