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
