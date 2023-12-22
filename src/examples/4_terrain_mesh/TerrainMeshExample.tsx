import React, { useMemo, useState } from "react";
import { TerrainOrthoHandler } from "./components/TerrainOrthoHandler";
import { TerrainMesh } from "./components/TerrainMesh";
import { Camera3D } from "../../components/Camera3D";
import { CameraControls } from "../../components/CameraControls";
import { WebGLCanvas } from "../../components/WebGLCanvas";
import { mat4 } from "gl-matrix";

const tileZoom = 14;
const tileX = 15066;
const tileY = 9841;

const mapboxKey =
  "pk.eyJ1IjoianllbGV3aXMtcGVyc29uYWxwcm9qZWN0czIiLCJhIjoiY2t5NHM2OXA4MGVqbDJ1bzRrMmduMTh6NSJ9.WP0xw2m5HI9LriwsZ1-VGQ";
const terrainImageUrl1 = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${tileZoom}/${tileX}/${tileY}.png?access_token=${mapboxKey}`;
const orthoImageUrl1 = `https://api.mapbox.com/v4/mapbox.satellite/${tileZoom}/${tileX}/${tileY}.png?access_token=${mapboxKey}`;
const terrainImageUrl2 = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${tileZoom}/${tileX +
  1}/${tileY}.png?access_token=${mapboxKey}`;
const orthoImageUrl2 = `https://api.mapbox.com/v4/mapbox.satellite/${tileZoom}/${tileX +
  1}/${tileY}.png?access_token=${mapboxKey}`;

export const TerrainMeshExample: React.FC = () => {
  const [showAsWireframe, setShowAsWireframe] = useState(false);

  const [xOffset, setXOffset] = useState(-130);
  const [yOffset, setYOffset] = useState(-100);
  const [zOffset, setZOffset] = useState(-400);

  const [xRotation, setXRotation] = useState(-0.15);

  const modelViewMatrix = useMemo(() => {
    // our mv matrix specifies where we want this square to be drawn
    const newModelViewMatrix = mat4.create();

    mat4.translate(
      newModelViewMatrix, // destination matrix
      newModelViewMatrix, // matrix to translate
      [xOffset, yOffset, zOffset]
    );

    mat4.rotateX(newModelViewMatrix, newModelViewMatrix, xRotation);

    return newModelViewMatrix;
  }, [xOffset, yOffset, zOffset, xRotation]);

  const mvm1 = useMemo(() => {
    mat4.clone(modelViewMatrix);
    return modelViewMatrix;
  }, [modelViewMatrix]);

  const mvm2 = useMemo(() => {
    const mvm = mat4.create();

    mat4.translate(
      mvm, // destination matrix
      modelViewMatrix, // matrix to translate
      [249, 0, 0]
    );

    return mvm;
  }, [modelViewMatrix]);

  return (
    <div>
      Wireframe:{" "}
      <input type="checkbox" onChange={() => setShowAsWireframe(x => !x)} />
      <WebGLCanvas width={500} height={500}>
        <Camera3D
          zNear={5.0}
          zFar={5000.0}
          defaultPosition={{
            x: 0,
            y: 0,
            z: 20
          }}
        >
          <TerrainOrthoHandler
            terrainImageUrl={terrainImageUrl1}
            orthoImageUrl={orthoImageUrl1}
          >
            {/*<Cube />*/}
            <TerrainMesh
              showAsWireframe={showAsWireframe}
              modelViewMatrix={mvm1}
            />
          </TerrainOrthoHandler>
          <TerrainOrthoHandler
            terrainImageUrl={terrainImageUrl2}
            orthoImageUrl={orthoImageUrl2}
          >
            {/*<Cube />*/}
            <TerrainMesh
              showAsWireframe={showAsWireframe}
              modelViewMatrix={mvm2}
            />
          </TerrainOrthoHandler>
          <>
            x:{" "}
            <input
              type="range"
              min="-500"
              max={100}
              value={xOffset}
              onChange={e => setXOffset(parseInt(e.target.value))}
            />{" "}
            {xOffset}
            <br />
            y:{" "}
            <input
              type="range"
              min="-150"
              max={50}
              value={yOffset}
              onChange={e => setYOffset(parseInt(e.target.value))}
            />{" "}
            {yOffset}
            <br />
            z:{" "}
            <input
              type="range"
              min="-500"
              max={100}
              value={zOffset}
              onChange={e => setZOffset(parseInt(e.target.value))}
            />{" "}
            {zOffset}
            <br />
            rotate X:{" "}
            <input
              type="range"
              min="-3"
              max={3}
              step={0.05}
              value={xRotation}
              onChange={e => setXRotation(parseFloat(e.target.value))}
            />{" "}
            <br />
            {xRotation}
            <br />
          </>
          <CameraControls />
        </Camera3D>
      </WebGLCanvas>
    </div>
  );
};
