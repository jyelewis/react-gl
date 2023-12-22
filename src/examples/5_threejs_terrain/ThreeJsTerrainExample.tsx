import React from "react";
import { Canvas } from "@react-three/fiber";
import { Terrain } from "./components/Terrain";
import { OrbitControls } from "@react-three/drei";

const tileZoom = 14;
const tileX = 15066;
const tileY = 9841;

const mapboxKey =
  "pk.eyJ1IjoianllbGV3aXMtcGVyc29uYWxwcm9qZWN0czIiLCJhIjoiY2t5NHM2OXA4MGVqbDJ1bzRrMmduMTh6NSJ9.WP0xw2m5HI9LriwsZ1-VGQ";
const terrainImageUrl1 = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${tileZoom}/${tileX}/${tileY}.png?access_token=${mapboxKey}`;
const orthoImageUrl1 = `https://api.mapbox.com/v4/mapbox.satellite/${tileZoom}/${tileX}/${tileY}.png?access_token=${mapboxKey}`;
// const terrainImageUrl2 = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${tileZoom}/${tileX +
//   1}/${tileY}.png?access_token=${mapboxKey}`;
// const orthoImageUrl2 = `https://api.mapbox.com/v4/mapbox.satellite/${tileZoom}/${tileX +
//   1}/${tileY}.png?access_token=${mapboxKey}`;

export const ThreeJsTerrainExample: React.FC = () => {
  return (
    <div>
      <Canvas>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Terrain heightmapUrl={terrainImageUrl1} orthoUrl={orthoImageUrl1} />
      </Canvas>
    </div>
  );
};
