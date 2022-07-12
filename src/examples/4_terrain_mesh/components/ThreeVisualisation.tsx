import React, { useContext, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import { TerrainOrthoContext } from "./TerrainOrthoHandler";
import { Mesh } from "../types/Mesh";

type Props = {
  mesh: Mesh;
};

// tool to render a threejs mesh with movable camera for debugging
export const ThreeVisualisation: React.FC<Props> = ({ mesh }) => {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<any>();

  const material = useMemo(
    () =>
      new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide
      }),
    []
  );
  const [geometry, scale] = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    let largestX = 0;
    let largestY = 0;
    let largestZ = 0;

    const points = [];
    for (let i = 0; i < mesh.indices.length; i++) {
      // look up underlying vertexes from vertex index array
      const x = mesh.vertices[mesh.indices[i] * 3];
      const y = mesh.vertices[mesh.indices[i] * 3 + 1];
      const z = mesh.vertices[mesh.indices[i] * 3 + 2];

      if (largestX < x) {
        largestX = x;
      }
      if (largestY < y) {
        largestY = y;
      }
      if (largestZ < z) {
        largestZ = z;
      }

      // move the whole mesh down to make it easier to view
      points.push(new THREE.Vector3(x - 4, y, z));
    }

    geometry.setFromPoints(points);
    geometry.computeVertexNormals();

    const scale = new THREE.Vector3(4 / largestX, 4 / largestY, 1 / largestZ);
    return [geometry, scale];
  }, [mesh]);

  return (
    <div style={{ backgroundColor: "white", width: "500px", height: "500px" }}>
      <Canvas>
        <TrackballControls rotateSpeed={5} />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <mesh geometry={geometry} material={material} ref={ref} scale={scale} />
      </Canvas>
    </div>
  );
};

// render current terrain using ThreeVisualisation debugger
export const ThreeTerrainVisualisation: React.FC = () => {
  const { terrainMesh } = useContext(TerrainOrthoContext);

  return <ThreeVisualisation mesh={terrainMesh} />;
};
