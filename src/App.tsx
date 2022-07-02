import React, { useState } from "react";
import "./App.css";
import { WebGLCanvas } from "./components/WebGLCanvas";
import { Square } from "./components/Square";

function App() {
  const [depth, setDepth] = useState(-6);
  return (
    <div className="App">
      <WebGLCanvas width={500} height={500}>
        <Square x={0} y={0} z={depth} timeOffset={0} />
        <Square x={0} y={0} z={depth} timeOffset={100} />
        <Square x={0} y={0} z={depth} timeOffset={200} />
        <Square x={0} y={0} z={depth} timeOffset={300} />
      </WebGLCanvas>
      <br />
      Depth: {depth}
      <br />
      <button onClick={() => setDepth(x => x - 1)}>-</button>
      <button onClick={() => setDepth(x => x + 1)}>+</button>
    </div>
  );
}

export default App;
