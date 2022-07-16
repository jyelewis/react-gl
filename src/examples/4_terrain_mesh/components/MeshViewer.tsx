import React, { useContext, useState } from "react";
import { mat4 } from "gl-matrix";
import { Mesh } from "../types/Mesh";
import { WebGLContext } from "../../../components/WebGLCanvas";
import { Camera3DContext } from "../../../components/Camera3D";
import { useMemoWithCleanUp } from "../../../hooks/useMemoWithCleanUp";
import { loadGLShader } from "../../../utilities/loadGLShader";
import { compileGLProgram } from "../../../utilities/compileGLProgram";
import { useOnFrame } from "../../../hooks/useOnFrame";

const vsSource = `
  attribute vec4 aVertexPosition;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;

const fsSource = `
  precision mediump float;
  precision mediump float;

  void main(void) {
    float screen_width = 500.0;
    float screen_height = 500.0;
  
    gl_FragColor.r = ((gl_FragCoord.x / screen_width) * 0.6) + 0.2;
    gl_FragColor.g = ((gl_FragCoord.y / screen_height) * 0.6) + 0.2;
    
    // represent the depth buffer in b, most values are 0.9-1.0 so remap that to 0.0->1.0
    // better near & far values would make more effective use of this space
    gl_FragColor.b = max((gl_FragCoord.z - 0.9) * 10.0, 0.0);
    
    gl_FragColor.a = 1.0;
  }
`;

type Props = {
  mesh: Mesh;
};

export const MeshViewer: React.FC<Props> = ({ mesh }) => {
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
        gl.deleteProgram(program.glProgram);
        gl.deleteShader(program.vertexShader);
        gl.deleteShader(program.fragShader);
      }
    ];
  }, [gl]);

  const vertexPositionBuffer = useMemoWithCleanUp(() => {
    // create vertex position buffer for mesh
    const vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);

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
  }, [gl, program, mesh]);

  const indexBuffer = useMemoWithCleanUp(() => {
    // create index buffer for cube
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Now send the element array to GL
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

    return [
      indexBuffer,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteBuffer(indexBuffer);
      }
    ];
  }, [gl, program, mesh]);

  const [xOffset, setXOffset] = useState(-20);
  const [yOffset, setYOffset] = useState(-3);
  const [zOffset, setZOffset] = useState(-80);

  const [xRotation, setXRotation] = useState(0);

  // mesh render
  useOnFrame(() => {
    // our mv matrix specifies where we want this square to be drawn
    const modelViewMatrix = mat4.create();

    // const offsetRotateX = ((time / 1000) * 2) % (Math.PI * 2);
    // const offsetRotateY = ((time / 1000) * 2) % (Math.PI * 2);
    // const offsetRotateZ = (time / 1000) % (Math.PI * 2);

    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [xOffset, yOffset, zOffset]
    );

    mat4.rotateX(modelViewMatrix, modelViewMatrix, xRotation);
    // mat4.rotateY(modelViewMatrix, modelViewMatrix, offsetRotateY);
    // mat4.rotateZ(modelViewMatrix, modelViewMatrix, offsetRotateZ);

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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.useProgram(program.glProgram);

    const vertexCount = mesh.numVertices;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;

    // TODO: should we use triangle strips for 2.5d instead? How much bandwidth would be saved?
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  });

  return (
    <>
      x:{" "}
      <input
        type="range"
        min="-80"
        max={20}
        value={xOffset}
        onChange={e => setXOffset(parseInt(e.target.value))}
      />{" "}
      {xOffset}
      <br />
      y:{" "}
      <input
        type="range"
        min="-20"
        max={10}
        value={yOffset}
        onChange={e => setYOffset(parseInt(e.target.value))}
      />{" "}
      {yOffset}
      <br />
      z:{" "}
      <input
        type="range"
        min="-150"
        max={100}
        value={zOffset}
        onChange={e => setZOffset(parseInt(e.target.value))}
      />{" "}
      {zOffset}
      <br />
      rotate X:{" "}
      <input
        type="range"
        min="-3"
        max={3}
        step={0.05}
        value={xRotation}
        onChange={e => setXRotation(parseFloat(e.target.value))}
      />{" "}
      <br />
      {xRotation}
      <br />
    </>
  );
};
