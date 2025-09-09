import { useEffect } from "react";

export function useWindowEvent<K extends keyof WindowEventMap>(
  event: K,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  deps: unknown[]
) {
  return useEffect(() => {
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, listener, ...deps]);
}
