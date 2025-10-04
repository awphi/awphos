import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CSSSize, Position, Rect, Size } from "./positions";

export function removeFromArray<T>(arr: T[], item: T): boolean {
  const idx = arr.indexOf(item);
  if (idx !== -1) {
    arr.splice(idx, 1);
    return true;
  }

  return false;
}

type UndefinedKeys<T> = {
  [P in keyof T]-?: Extract<T[P], undefined> extends never ? never : P;
}[keyof T];

type PickDefined<T> = {
  [P in UndefinedKeys<T>]: NonNullable<T[P]>;
};

/**
 * Object.assign but without overwriting existing props with undefined values
 */
export function assignSafe<T extends object, S extends object>(
  target: T,
  source: S
): T & PickDefined<S> {
  for (const key in source) {
    const val = source[key];
    if (val !== undefined) {
      (target as Record<string, unknown>)[key] = val;
    }
  }
  return target as T & PickDefined<S>;
}

export function applyDefaults<T extends object>(
  obj: Record<string, T>,
  defaultValue: Required<T>
): Record<string, Required<T>> {
  const result: Record<string, Required<T>> = Object.create(null);
  for (const key in obj) {
    const value = obj[key];
    result[key] = assignSafe({ ...defaultValue }, value);
  }
  return result;
}

export function deepFreeze<T extends object>(
  object: T,
  mode: "freeze" | "seal" = "freeze"
): T {
  const fn = mode === "freeze" ? Object.freeze : Object.seal;
  for (const key in object) {
    const value = object[key];
    if (value && typeof value === "object") {
      deepFreeze(value, mode);
    }
  }
  return fn(object);
}

export function cn(...args: ClassValue[]) {
  return twMerge(clsx(args));
}

export function oncePerFrame<T extends unknown[]>(
  callback: (...args: T) => void
) {
  let isWaiting = false;

  return (...args: T) => {
    if (isWaiting) {
      return;
    }

    callback(...args);
    isWaiting = true;

    requestAnimationFrame(() => {
      isWaiting = false;
    });
  };
}

export function pointInRect(point: Position, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(val, max));
}

export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate color
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

export function isNumericSize(size: CSSSize): size is Size {
  return typeof size.width === "number" && typeof size.height === "number";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  callback: T,
  wait: number
): T {
  let timeoutId: number | null = null;

  return ((...args) => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  }) as T;
}
