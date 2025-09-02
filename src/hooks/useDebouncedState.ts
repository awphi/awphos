import { useEffect, useRef, useState } from "react";

export function useDebouncedState<T>(initial: T, timeInMs: number = 250) {
  const [debouncedValue, setDebouncedValue] = useState(initial);
  const [value, _setValue] = useState(initial);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValue = useRef<T>(initial);

  const setValue = (newValue: T) => {
    _setValue(newValue);
    if (lastValue.current === newValue) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (lastValue.current !== newValue) {
        setDebouncedValue(newValue);
      }
      lastValue.current = newValue;
    }, timeInMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, setValue, debouncedValue] as const;
}
