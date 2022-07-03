const faceColors = [
  [1.0, 1.0, 1.0, 1.0], // Front face: white
  [1.0, 0.0, 0.0, 1.0], // Back face: red
  [0.0, 1.0, 0.0, 1.0], // Top face: green
  [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
  [1.0, 1.0, 0.0, 1.0], // Right face: yellow
  [1.0, 0.0, 1.0, 1.0] // Left face: purple
];

// convert the array of colors into a table for all the vertices.
let colors: number[] = [];

for (let i = 0; i < faceColors.length; ++i) {
  const c = faceColors[i];

  // repeat each color four times for the four vertices of the face
  colors = colors.concat(c, c, c, c);
}

export const cubeColors = new Float32Array(colors);
