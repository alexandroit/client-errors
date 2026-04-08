import { isObject, isPlainObject } from "./object";

const circularReplacement = "[Circular]";

export const safeSerialize = (value: unknown): string => {
  const seen = new WeakSet<object>();

  return JSON.stringify(
    value,
    (_key, currentValue) => {
      if (typeof currentValue === "bigint") {
        return currentValue.toString();
      }

      if (typeof currentValue === "function") {
        return `[Function ${currentValue.name || "anonymous"}]`;
      }

      if (isObject(currentValue)) {
        if (seen.has(currentValue)) {
          return circularReplacement;
        }

        seen.add(currentValue);
      }

      if (currentValue instanceof Error) {
        return {
          name: currentValue.name,
          message: currentValue.message,
          stack: currentValue.stack
        };
      }

      return currentValue;
    },
    2
  );
};

export const safeClone = <T>(value: T): T => {
  if (!isPlainObject(value) && !Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(safeSerialize(value)) as T;
  } catch {
    return value;
  }
};
