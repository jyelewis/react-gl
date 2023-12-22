import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { SquaresExample } from "./examples/1_squares/SquaresExample";
import { CubeExample } from "./examples/2_cube/CubeExample";
import { TerrainMeshExample } from "./examples/4_terrain_mesh/TerrainMeshExample";
import { TriangleExample } from "./examples/0_triangle/TriangleExample";
import { ThreeJsTerrainExample } from "./examples/5_threejs_terrain/ThreeJsTerrainExample";

const examples: Record<string, React.FC> = {
  Triangle: TriangleExample,
  Squares: SquaresExample,
  Cube: CubeExample,
  TerrainMesh: TerrainMeshExample,
  ThreeJsTerrain: ThreeJsTerrainExample
};

function App() {
  const [activeExample, setActiveExample] = useState<string>("Triangle");

  const selectExample = useCallback(
    (newExample: string) => {
      setActiveExample(newExample);
      localStorage.setItem("active-example", newExample);
    },
    [setActiveExample]
  );

  // store active example in local storage, so we can refresh the page while developing
  useEffect(() => {
    const lastActiveExample = localStorage.getItem("active-example");
    if (lastActiveExample) {
      setActiveExample(lastActiveExample);
    }
  }, [setActiveExample]);

  const ActiveExampleComponent = examples[activeExample];

  return (
    <div className="app">
      <h1>{activeExample}</h1>
      {Object.keys(examples).map(example => (
        <button key={example} onClick={() => selectExample(example)}>
          {example}
        </button>
      ))}

      <div className="example">
        <ActiveExampleComponent />
      </div>
    </div>
  );
}

export default App;
