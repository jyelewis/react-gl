import React from "react";
import { TerrainOrthoHandler } from "./components/TerrainOrthoHandler";
import { TerrainMesh } from "./components/TerrainMesh";
import { Camera3D } from "../../components/Camera3D";
import { CameraControls } from "../../components/CameraControls";
import { WebGLCanvas } from "../../components/WebGLCanvas";

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
      <WebGLCanvas width={500} height={500}>
        <Camera3D
          zNear={5.0}
          zFar={500.0}
          defaultPosition={{
            // x: 256 / 2,
            // y: 256 / 2,
            x: 0,
            y: 0,
            z: 20
          }}
        >
          <TerrainOrthoHandler
            terrainImageUrl={terrainImageUrl}
            orthoImageUrl={orthoImageUrl}
          >
            {/*TODO: rendering both the mesh & cube at once causes gl errors...*/}
            <TerrainMesh />
            {/*<Cube />*/}
          </TerrainOrthoHandler>
          <CameraControls />
        </Camera3D>
      </WebGLCanvas>
    </div>
  );
};
