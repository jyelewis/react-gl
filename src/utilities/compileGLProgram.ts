import { WebGLError } from "./WebGLError";

export function compileGLProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  // create program
  const shaderProgram = gl.createProgram();
  if (shaderProgram === null) {
    throw new WebGLError(gl);
  }

  // attach shaders & link
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // verify it linked successfully
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new WebGLError(
      gl,
      `Unable to link shader program: ${gl.getProgramInfoLog(shaderProgram)}`
    );
  }

  return shaderProgram;
}
