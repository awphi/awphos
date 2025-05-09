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
export function assignSafe<T extends {}, S extends {}>(
  target: T,
  source: S
): T & PickDefined<S> {
  for (const key in source) {
    const val = source[key];
    if (val !== undefined) {
      (target as any)[key] = val;
    }
  }
  return target as T & PickDefined<S>;
}

export function applyDefaults<T extends {}>(
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

export function deepFreeze<T extends {}>(
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
