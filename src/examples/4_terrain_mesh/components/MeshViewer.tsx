import React, { useContext } from "react";
import { mat4 } from "gl-matrix";
import { Mesh } from "../types/Mesh";
import { WebGLContext } from "../../../components/WebGLCanvas";
import { Camera3DContext } from "../../../components/Camera3D";
import { useMemoWithCleanUp } from "../../../hooks/useMemoWithCleanUp";
import { loadGLShader } from "../../../utilities/loadGLShader";
import { compileGLProgram } from "../../../utilities/compileGLProgram";
import { useOnFrame } from "../../../hooks/useOnFrame";
import { NdArray } from "ndarray";

const vsSource = `
  attribute vec4 aVertexPosition;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  
  varying highp vec2 vTextureCoord;
  varying highp float vElevation;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    
    // scale so each tile is 1x1 unit
    vTextureCoord = aVertexPosition.xy / 256.0;
    vElevation = aVertexPosition.z / 256.0;
  }
`;

const fsSource = `
  precision mediump float;
  precision mediump float;
  
  varying highp vec2 vTextureCoord;
  varying highp float vElevation;
  
  uniform sampler2D meshTexture;

  void main(void) {
    gl_FragColor.rgb = texture2D(meshTexture, vTextureCoord.xy).rgb;
    gl_FragColor.r = vElevation;
    gl_FragColor.g = 0.0;
    gl_FragColor.b = 0.0;
    gl_FragColor.a = 1.0;
  }
`;

type Props = {
  mesh: Mesh;
  textureBytes: NdArray<Uint8Array>;
  showAsWireframe?: boolean;
  modelViewMatrix: mat4;
};

export const MeshViewer: React.FC<Props> = ({
  mesh,
  textureBytes,
  showAsWireframe,
  modelViewMatrix
}) => {
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
        modelViewMatrix: gl.getUniformLocation(glProgram, "uModelViewMatrix"),
        uSampler: gl.getUniformLocation(glProgram, "uSampler")
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
    gl.useProgram(program.glProgram);

    // create vertex position buffer for mesh
    const vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);

    return [
      vertexPositionBuffer,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteBuffer(vertexPositionBuffer);
      }
    ];
  }, [gl, program, mesh]);

  const indexBuffer = useMemoWithCleanUp(() => {
    gl.useProgram(program.glProgram);

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

  const texture = useMemoWithCleanUp(() => {
    gl.useProgram(program.glProgram);

    let height = textureBytes.shape[0];
    let width = textureBytes.shape[1];

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // create texture buffer for mesh
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      textureBytes.data
    );
    gl.generateMipmap(gl.TEXTURE_2D);

    return [
      texture,
      () => {
        // clean up old gpu objects when program changes
        gl.deleteTexture(texture);
      }
    ];
  }, [gl, program, textureBytes, mesh]);

  // mesh render
  useOnFrame(() => {
    gl.useProgram(program.glProgram);

    // bind vertex array
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(
      program.attribLocations.vertexPosition,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(program.attribLocations.vertexPosition);

    // bind mv matrix to our program if it or the program changes
    gl.uniformMatrix4fv(
      program.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix
    );

    // bind camera projection matrix
    gl.uniformMatrix4fv(
      program.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    );

    // bind index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(program.uniformLocations.uSampler, 0);

    const numIndices = mesh.numIndices;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;

    gl.disable(gl.CULL_FACE);

    gl.drawElements(
      showAsWireframe ? gl.LINE_STRIP : gl.TRIANGLES,
      numIndices,
      type,
      offset
    );
  });

  return null;
};
