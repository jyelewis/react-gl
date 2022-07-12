import React from "react";
import { ThreeTerrainVisualisation } from "./components/ThreeVisualisation";
import { TerrainOrthoHandler } from "./components/TerrainOrthoHandler";

const tileZoom = 14;
const tileX = 15066;
const tileY = 9841;

const mapboxKey =
  "pk.eyJ1IjoianllbGV3aXMtcGVyc29uYWxwcm9qZWN0czIiLCJhIjoiY2t5NHM2OXA4MGVqbDJ1bzRrMmduMTh6NSJ9.WP0xw2m5HI9LriwsZ1-VGQ";
const terrainImageUrl = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${tileZoom}/${tileX}/${tileY}.png?access_token=${mapboxKey}`;
const orthoImageUrl = `https://api.mapbox.com/v4/mapbox.satellite/${tileZoom}/${tileX}/${tileY}.png?access_token=${mapboxKey}`;

export const TerrainMeshExample: React.FC = () => {
  return (
    <div>
      <TerrainOrthoHandler
        terrainImageUrl={terrainImageUrl}
        orthoImageUrl={orthoImageUrl}
      >
        <ThreeTerrainVisualisation />
      </TerrainOrthoHandler>
    </div>
  );
};
