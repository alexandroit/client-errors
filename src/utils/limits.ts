export const clampNumber = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum);

export const truncateString = (value: string, maximum: number): string =>
  value.length > maximum ? `${value.slice(0, maximum)}…` : value;

export const pushBounded = <T>(items: T[], value: T, maximum: number): void => {
  items.push(value);

  if (items.length > maximum) {
    items.splice(0, items.length - maximum);
  }
};
