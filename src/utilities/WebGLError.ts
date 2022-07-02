export class WebGLError extends Error {
  constructor(gl: WebGL2RenderingContext, msg?: string) {
    const errorCode = gl.getError();
    super(`WebGL error! Code: ${errorCode}${msg ? `\n${msg}` : ""}`);
  }
}
