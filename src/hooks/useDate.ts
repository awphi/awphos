import { useEffect, useState } from "react";

export interface UseDateOptions {
  /**
   * Update interval in ms.
   * @defaultValue 1000
   */
  updateInterval?: number;
}

export function useDate(opts?: UseDateOptions) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const ms = opts?.updateInterval ?? 1000;
    const id = setInterval(() => {
      setNow(new Date());
    }, ms);

    return () => {
      clearInterval(id);
    };
  }, [opts?.updateInterval]);

  return now;
}
