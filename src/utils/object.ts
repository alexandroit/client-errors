export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!isObject(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const toRecord = (value: unknown): Record<string, unknown> | undefined =>
  isPlainObject(value) ? value : undefined;
