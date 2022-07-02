import { useEffect, useMemo, useRef } from "react";

// specifically helpful when creating openGL objects that need to be deleted after use
export function useMemoWithCleanUp<T>(
  memoFn: () => [T, () => void],
  deps: any[]
): T {
  const cleanupFn = useRef<null | (() => void)>(null);

  // clean up on full un-mount
  const componentIsMounted = useRef<boolean>(false);
  useEffect(() => {
    componentIsMounted.current = true;
    return () => {
      componentIsMounted.current = false;

      setTimeout(() => {
        if (!componentIsMounted.current && cleanupFn.current) {
          // component truly unmounted, run final clean up
          cleanupFn.current();
        }
      }, 0);
    };
  }, []);

  return useMemo<T>(() => {
    if (cleanupFn.current) {
      cleanupFn.current();
    }

    const [newValue, newCleanupFn] = memoFn();
    cleanupFn.current = newCleanupFn;

    return newValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
