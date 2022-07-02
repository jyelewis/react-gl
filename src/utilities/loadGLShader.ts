import { WebGLError } from "./WebGLError";

export function loadGLShader(
  gl: WebGL2RenderingContext,
  type:
    | WebGL2RenderingContext["VERTEX_SHADER"]
    | WebGL2RenderingContext["FRAGMENT_SHADER"],
  source: string
) {
  const shader = gl.createShader(type);
  if (shader === null) {
    throw new WebGLError(gl);
  }

  // compile
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // verify it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new WebGLError(
      gl,
      `Error compiling shader: ${gl.getShaderInfoLog(shader)}`
    );
  }

  return shader;
}
