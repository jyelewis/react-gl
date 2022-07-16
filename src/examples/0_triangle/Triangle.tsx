import React, { useContext } from "react";
import { WebGLContext } from "../../components/WebGLCanvas";
import { loadGLShader } from "../../utilities/loadGLShader";
import { compileGLProgram } from "../../utilities/compileGLProgram";
import { useOnFrame } from "../../hooks/useOnFrame";
import { useMemoWithCleanUp } from "../../hooks/useMemoWithCleanUp";

const vsSource = `
  attribute vec4 aVertexPosition;

  void main() {
    gl_Position = aVertexPosition;
  }
`;

const fsSource = `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`;

export const Triangle: React.FC = () => {
  const { gl } = useContext(WebGLContext);

  const program = useMemoWithCleanUp(() => {
    const vertexShader = loadGLShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragShader = loadGLShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const glProgram = compileGLProgram(gl, vertexShader, fragShader);

    const program = {
      vertexShader,
      fragShader,
      glProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(glProgram, "aVertexPosition")
      },
      uniformLocations: {}
    };

    return [
      program,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteProgram(program.glProgram);
        gl.deleteShader(program.vertexShader);
        gl.deleteShader(program.fragShader);
      }
    ];
  }, [gl]);

  const vertexPositionBuffer = useMemoWithCleanUp(() => {
    const vertexPositions = new Float32Array([
      // v1
      0.0,
      1.0,
      // v2
      1.0,
      -1.0,
      // v3
      -1.0,
      -1.0
    ]);

    // create vertex position buffer for square
    const vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);

    // configure vertex buffer for our program
    const numComponents = 2; // pull out 2 values per iteration (x, y)
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(
      program.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(program.attribLocations.vertexPosition);

    return [
      vertexPositionBuffer,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteBuffer(vertexPositionBuffer);
      }
    ];
  }, [gl, program]);

  useOnFrame(() => {
    // select our shader program
    gl.useProgram(program.glProgram);

    // bind vertexes & program
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

    // draw our 4 vertices
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  });

  return null;
};
