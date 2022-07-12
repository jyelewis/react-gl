import React, { useContext } from "react";
import { WebGLContext } from "../../components/WebGLCanvas";
import { useMemoWithCleanUp } from "../../hooks/useMemoWithCleanUp";
import { loadGLShader } from "../../utilities/loadGLShader";
import { compileGLProgram } from "../../utilities/compileGLProgram";
import { cubeVertexes } from "./data/cubeVertexes";
import { cubeColors } from "./data/cubeColors";
import { useOnFrame } from "../../hooks/useOnFrame";
import { mat4 } from "gl-matrix";
import { Camera3DContext } from "../../components/Camera3D";

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
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexes, gl.STATIC_DRAW);

    // configure vertex buffer for our program
    const numComponents = 3; // pull out 3 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
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

  const vertexColorBuffer = useMemoWithCleanUp(() => {
    // create vertex color buffer for cube
    const vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);

    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
      program.attribLocations.vertexColor,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(program.attribLocations.vertexColor);

    return [
      vertexColorBuffer,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteBuffer(vertexColorBuffer);
      }
    ];
  }, [gl, program]);

  const indexBuffer = useMemoWithCleanUp(() => {
    // create index buffer for cube
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.
    const indices = new Uint16Array([
      0,
      1,
      2,
      0,
      2,
      3, // front
      4,
      5,
      6,
      4,
      6,
      7, // back
      8,
      9,
      10,
      8,
      10,
      11, // top
      12,
      13,
      14,
      12,
      14,
      15, // bottom
      16,
      17,
      18,
      16,
      18,
      19, // right
      20,
      21,
      22,
      20,
      22,
      23 // left
    ]);

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return [
      indexBuffer,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteBuffer(indexBuffer);
      }
    ];
  }, [gl, program]);

  useOnFrame(time => {
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

    // bind mv matrix to our program if it or the program changes
    gl.useProgram(program.glProgram);
    gl.uniformMatrix4fv(
      program.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    // bind camera projection matrix
    gl.useProgram(program.glProgram);
    gl.uniformMatrix4fv(
      program.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );

    // bind vertexes & program
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.useProgram(program.glProgram);

    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  });

  return null;
};
