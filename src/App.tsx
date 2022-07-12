import React, { useState } from "react";
import "./App.css";
import { SquaresExample } from "./examples/1_squares/SquaresExample";
import { CubeExample } from "./examples/2_cube/CubeExample";
import { TerrainMeshExample } from "./examples/4_terrain_mesh/TerrainMeshExample";

const examples: Record<string, React.FC> = {
  Squares: SquaresExample,
  Cube: CubeExample,
  TerrainMesh: TerrainMeshExample
};

function App() {
  const [activeExample, setActiveExample] = useState<string>("TerrainMesh");

  const ActiveExampleComponent = examples[activeExample];

  return (
    <div className="app">
      <h1>{activeExample}</h1>
      {Object.keys(examples).map(example => (
        <button key={example} onClick={() => setActiveExample(example)}>
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
