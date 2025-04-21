import { useEffect, useState } from "react";

export interface UseDateOptions {
  /**
   * Update interval in ms.
   * @defaultValue 1000
   */
  updateInterval?: number;
}

export function useDate({ updateInterval = 1000 }: UseDateOptions = {}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, updateInterval);

    return () => {
      clearInterval(id);
    };
  }, [updateInterval]);

  return now;
}
