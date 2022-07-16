import { NdArray } from "ndarray";
import { Mesh } from "../types/Mesh";

// TODO: break this up into multiple draw calls if needed
// TODO: compute normals
const MAX_VERTICES_IN_MESH = 2 ** 16 - 1;

// takes an NdArray of points (width, height, [x, y, z])
// produces a mesh
export function pointsToMesh(points: NdArray<Uint32Array>): Mesh {
  const width = points.shape[0];
  const height = points.shape[1];

  const numVertices = width * height; // one vertex for every x,y position
  const numIndices = (width - 1) * (height - 1) * 6; // 6 indexes for every position, excluding right/bottom borders

  if (numVertices >= MAX_VERTICES_IN_MESH) {
    throw new Error("Too many vertexes for single draw call mesh");
  }

  const vertices = new Float32Array(numVertices * 3); // 3 values for each vert
  const indices = new Uint16Array(numIndices); // 1 value for each vert index

  // create a vertex for each point
  let vertexIndex = 0;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      vertices[vertexIndex++] = x;
      vertices[vertexIndex++] = y;
      // fetch z component from given x & y for this vertex
      vertices[vertexIndex++] = points.get(x, y, 2);
    }
  }

  const vertexIndexForXY = (x: number, y: number) => x + y * width;

  // create a vertex index array to mesh all points together with triangles
  let indexIndex = 0;
  for (let x = 0; x < width - 1; x++) {
    for (let y = 0; y < height - 1; y++) {
      // creates 2 triangles for a given point (P)
      // skips final rows, as they will already be covered by the second last rows
      /*
       triangle 1
      1----2
      | \  |
      |  \ | <-- triangle 2
      4----3
       */

      // triangle 1
      indices[indexIndex++] = vertexIndexForXY(x, y); // 1
      indices[indexIndex++] = vertexIndexForXY(x + 1, y); // 2
      indices[indexIndex++] = vertexIndexForXY(x + 1, y + 1); // 3

      // triangle 2
      indices[indexIndex++] = vertexIndexForXY(x, y); // 1
      indices[indexIndex++] = vertexIndexForXY(x + 1, y + 1); // 3
      indices[indexIndex++] = vertexIndexForXY(x, y + 1); // 4
    }
  }

  return {
    vertices,
    numVertices,
    indices
  };
}
