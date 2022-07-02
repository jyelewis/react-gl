import React, { useContext, useMemo } from "react";
import { WebGLContext } from "./WebGLCanvas";
import { loadGLShader } from "../utilities/loadGLShader";
import { compileGLProgram } from "../utilities/compileGLProgram";
import { mat4 } from "gl-matrix";
import { useOnFrame } from "../hooks/useOnFrame";
import { useMemoWithCleanUp } from "../hooks/useMemoWithCleanUp";

const vsSource = `
  attribute vec4 aVertexPosition;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;

const fsSource = `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.2);
  }
`;

type Props = {
  timeOffset: number;
  x: number;
  y: number;
  z: number;
};

export const Square: React.FC<Props> = ({ x, y, z, timeOffset }) => {
  const { gl, width, height, time } = useContext(WebGLContext);

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
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(glProgram, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(glProgram, "uModelViewMatrix")
      }
    };

    return [
      program,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteShader(program.vertexShader);
        gl.deleteShader(program.fragShader);
        gl.deleteProgram(program.glProgram);
      }
    ];
  }, [gl]);

  const vertexPositionBuffer = useMemoWithCleanUp(() => {
    const vertexPositions = new Float32Array([
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      -1.0,
      -1.0
    ]);

    // create vertex position buffer for square
    const vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);

    // configure vertex buffer for our program
    const numComponents = 2; // pull out 2 values per iteration
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

  useMemo(() => {
    // our mv matrix specifies where we want this square to be drawn
    const modelViewMatrix = mat4.create();

    const offsetY = Math.sin(((time + timeOffset) / 1000) * 5);
    const offsetX = Math.sin(((time + timeOffset) / 1000) * 2);

    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      // [-0.0, 0.0, -6.0] // amount to translate
      [x + offsetX, y + offsetY, z]
    );

    // bind mv matrix to our program if it or the program changes
    gl.useProgram(program.glProgram);
    gl.uniformMatrix4fv(
      program.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    return modelViewMatrix;
  }, [gl, program, x, y, z, time, timeOffset]);

  useMemo(() => {
    // create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = width / height;
    const zNear = 0.1;
    const zFar = 100.0;

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // bind projection matrix if it or the program changes
    gl.useProgram(program.glProgram);

    // Set the shader uniforms for our camera
    gl.uniformMatrix4fv(
      program.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );

    return projectionMatrix;
  }, [gl, program, width, height]);

  useOnFrame(() => {
    // bind vertexes & program
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.useProgram(program.glProgram);

    // draw our 4 vertices
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });

  return null;
};
