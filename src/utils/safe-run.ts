export const noop = (): void => {};

export const safeCall = <T>(task: () => T, fallback: T): T => {
  try {
    return task();
  } catch {
    return fallback;
  }
};

export const safeCallAsync = async <T>(
  task: () => Promise<T> | T,
  fallback: T
): Promise<T> => {
  try {
    return await task();
  } catch {
    return fallback;
  }
};

export const safeSideEffect = (task: () => void): void => {
  try {
    task();
  } catch {
    // Fail silent by design.
  }
};

export const safeSideEffectAsync = async (task: () => Promise<void> | void): Promise<void> => {
  try {
    await task();
  } catch {
    // Fail silent by design.
  }
};
