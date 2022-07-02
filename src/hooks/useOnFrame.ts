import { WebGLContext } from "../components/WebGLCanvas";
import { useCallback, useContext, useEffect, useRef } from "react";

export function useOnFrame(frameCb: FrameRequestCallback) {
  const { registerFrameCallback, unregisterFrameCallback } = useContext(
    WebGLContext
  );

  // hold a ref to the latest frame cb so we don't need to re-register if our callback fn changes
  const latestFrameCb = useRef(frameCb);
  latestFrameCb.current = frameCb;

  const localFrameCb: FrameRequestCallback = useCallback(
    x => latestFrameCb.current(x),
    []
  );

  useEffect(() => {
    registerFrameCallback(localFrameCb);

    return () => unregisterFrameCallback(localFrameCb);
  }, [registerFrameCallback, unregisterFrameCallback, localFrameCb]);
}
