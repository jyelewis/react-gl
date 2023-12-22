import React, { useCallback, useContext } from "react";
import { WebGLContext } from "../../components/WebGLCanvas";
import { useMemoWithCleanUp } from "../../hooks/useMemoWithCleanUp";
import { loadGLShader } from "../../utilities/loadGLShader";
import { compileGLProgram } from "../../utilities/compileGLProgram";
import { cubeVertexPositions } from "./data/cubeVertexPositions";
import { cubeColors } from "./data/cubeColors";
import { useOnFrame } from "../../hooks/useOnFrame";
import { mat4 } from "gl-matrix";
import { Camera3DContext } from "../../components/Camera3D";
import { cubeVertexIndices } from "./data/cubeVertexIndices";

const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
  }
`;

const fsSource = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor;
  }
`;

export const Cube: React.FC = () => {
  const { gl } = useContext(WebGLContext);
  const { projectionMatrix } = useContext(Camera3DContext);

  const program = useMemoWithCleanUp(() => {
    const vertexShader = loadGLShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragShader = loadGLShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const glProgram = compileGLProgram(gl, vertexShader, fragShader);

    const program = {
      vertexShader,
      fragShader,
      glProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(glProgram, "aVertexPosition"),
        vertexColor: gl.getAttribLocation(glProgram, "aVertexColor")
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
        gl.deleteProgram(program.glProgram);
        gl.deleteShader(program.vertexShader);
        gl.deleteShader(program.fragShader);
      }
    ];
  }, [gl]);

  const vertexPositionBuffer = useMemoWithCleanUp(() => {
    // create vertex position buffer for square
    const vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexPositions, gl.STATIC_DRAW);

    return [
      vertexPositionBuffer,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteBuffer(vertexPositionBuffer);
      }
    ];
  }, [gl]);

  const vertexColorBuffer = useMemoWithCleanUp(() => {
    // create vertex color buffer for cube
    const vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

    return [
      vertexColorBuffer,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteBuffer(vertexColorBuffer);
      }
    ];
  }, [gl]);

  const indexBuffer = useMemoWithCleanUp(() => {
    // create index buffer for cube
    const indexBuffer = gl.createBuffer();

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

    // Now send the element array to GL
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndices, gl.STATIC_DRAW);

    return [
      indexBuffer,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteBuffer(indexBuffer);
      }
    ];
  }, [gl]);

  // create a vbo to hold all our vertex attributes & index buffer
  const vbo = useMemoWithCleanUp(() => {
    const vbo = gl.createVertexArray();
    gl.bindVertexArray(vbo);

    gl.enableVertexAttribArray(program.attribLocations.vertexPosition);
    gl.enableVertexAttribArray(program.attribLocations.vertexColor);

    // enable vertex position array
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(
      program.attribLocations.vertexPosition,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    // enable vertex colour array
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.vertexAttribPointer(
      program.attribLocations.vertexColor,
      4,
      gl.FLOAT,
      false,
      0,
      0
    );

    // bind index buffer program
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.bindVertexArray(null);

    return [vbo, () => gl.deleteVertexArray(vbo)];
  }, [gl, vertexPositionBuffer, vertexColorBuffer, indexBuffer]);

  const createMVMatrix = useCallback((time: number) => {
    // our mv matrix specifies where we want this square to be drawn
    const modelViewMatrix = mat4.create();

    const offsetRotateX = ((time / 1000) * 2) % (Math.PI * 2);
    const offsetRotateY = ((time / 1000) * 2) % (Math.PI * 2);

    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [0, 0, -6]
    );

    mat4.rotateX(modelViewMatrix, modelViewMatrix, offsetRotateX);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, offsetRotateY);

    return modelViewMatrix;
  }, []);

  useOnFrame(time => {
    // select our shader program
    gl.useProgram(program.glProgram);

    // bind uniforms
    gl.uniformMatrix4fv(
      program.uniformLocations.modelViewMatrix,
      false,
      createMVMatrix(time)
    );

    // bind camera projection matrix
    gl.uniformMatrix4fv(
      program.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );

    // bind our vertex array for positions + colours
    gl.bindVertexArray(vbo);

    // draw everything!
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
  });

  return null;
};
