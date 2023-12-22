import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

export interface IWebGLContextValue {
  renderWidth: number;
  renderHeight: number;

  screenWidth: number;
  screenHeight: number;

  gl: WebGL2RenderingContext;

  registerFrameCallback: (cb: FrameRequestCallback) => void;
  unregisterFrameCallback: (cb: FrameRequestCallback) => void;
}

export const WebGLContext = createContext<IWebGLContextValue>(
  (null as unknown) as IWebGLContextValue
);
WebGLContext.displayName = "WebGLContext";

type Props = {
  width: number;
  height: number;
  children?: React.ReactNode;
};

export const WebGLCanvas: React.FC<Props> = ({ width, height, children }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [gl, setGl] = useState<WebGL2RenderingContext | undefined | null>(
    undefined
  );
  const frameTimer = useRef<null | number>(null);

  const frameCallbacks = useRef<FrameRequestCallback[]>([]);

  const clearCanvas = useCallback(() => {
    if (!gl) {
      return;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }, [gl]);

  // load webgl2 context from canvas
  useEffect(() => {
    if (canvas === null) {
      // canvas not rendered yet
      return;
    }

    const newGl = canvas.getContext("webgl2");
    setGl(newGl);

    if (newGl === null) {
      // unable to initialise webgl
      return;
    }

    // configure gl environment
    newGl.enable(newGl.DEPTH_TEST); // enable depth testing
    newGl.enable(newGl.BLEND);
    newGl.disable(newGl.CULL_FACE);
    newGl.blendFunc(newGl.SRC_ALPHA, newGl.ONE_MINUS_SRC_ALPHA);
    newGl.depthFunc(newGl.LEQUAL); // near things obscure far things

    // clear the canvas back to black every frame (called in onFrame)
    newGl.clearColor(0.0, 0.0, 0.0, 1.0); // clear to black, fully opaque
    newGl.clearDepth(1.0); // clear everything

    clearCanvas();
  }, [canvas, clearCanvas]);

  const registerFrameCallback = useCallback((cb: FrameRequestCallback) => {
    frameCallbacks.current.push(cb);
  }, []);

  const unregisterFrameCallback = useCallback((cb: FrameRequestCallback) => {
    // remove callback from array
    frameCallbacks.current.splice(frameCallbacks.current.indexOf(cb), 1);
  }, []);

  const sizes = useMemo(
    () => ({
      screenWidth: width,
      screenHeight: height,
      renderWidth: width * window.devicePixelRatio,
      renderHeight: height * window.devicePixelRatio
    }),
    [width, height]
  );

  const webGlContextValue = useMemo<IWebGLContextValue | null>(() => {
    if (!gl) {
      // not ready yet
      return null;
    }

    return {
      screenWidth: sizes.screenWidth,
      screenHeight: sizes.screenHeight,

      renderWidth: sizes.renderWidth,
      renderHeight: sizes.renderHeight,

      gl,

      registerFrameCallback,
      unregisterFrameCallback
    };
  }, [sizes, gl, registerFrameCallback, unregisterFrameCallback]);

  const onFrame: FrameRequestCallback = useCallback(
    time => {
      clearCanvas();
      frameCallbacks.current.forEach(cb => cb(time));

      // request another frame callback
      frameTimer.current = requestAnimationFrame(onFrame);
    },
    [clearCanvas]
  );

  // set up animation frame timer
  useEffect(() => {
    if (!gl) {
      return;
    }

    frameTimer.current = requestAnimationFrame(onFrame);

    return () => {
      if (frameTimer.current) {
        clearTimeout(frameTimer.current);
      }
    };
  }, [gl, onFrame]);

  return (
    <>
      <canvas
        ref={setCanvas}
        width={sizes.renderWidth}
        height={sizes.renderHeight}
        style={{ width: sizes.screenWidth, height: sizes.screenHeight }}
      />

      {gl === null && <p>Unable to initialise GL context</p>}

      {webGlContextValue !== null && (
        <WebGLContext.Provider value={webGlContextValue}>
          {children}
        </WebGLContext.Provider>
      )}
    </>
  );
};
