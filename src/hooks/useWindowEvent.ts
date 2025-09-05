import { useEffect } from "react";

export function useWindowEvent<K extends keyof WindowEventMap>(
  event: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  deps: any[]
) {
  return useEffect(() => {
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }, deps);
}
