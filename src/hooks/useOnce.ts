import { useEffect, type EffectCallback } from "react";

export default function useOnce(fn: EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useEffect(fn, []);
}
