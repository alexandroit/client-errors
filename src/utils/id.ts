export const createEventId = (): string => {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  const random = Math.random().toString(16).slice(2);
  return `rvlce-${Date.now().toString(36)}-${random}`;
};
