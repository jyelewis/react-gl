import React, { useState } from "react";
import "./App.css";
import { SquaresExample } from "./examples/1_squares/SquaresExample";

const examples: Record<string, React.FC> = {
  Squares: SquaresExample
};

function App() {
  const [activeExample, setActiveExample] = useState<string>("Squares");

  const ActiveExampleComponent = examples[activeExample];

  return (
    <div className="app">
      <h1>{activeExample}</h1>
      {Object.keys(examples).map(example => (
        <button onClick={() => setActiveExample(example)}>{example}</button>
      ))}

      <div className="example">
        <ActiveExampleComponent />
      </div>
    </div>
  );
}

export default App;
