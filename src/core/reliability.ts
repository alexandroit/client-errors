import type { ClientErrorsPayload } from "../types";
import type { ClientErrorsState } from "./state";

export const isRateLimited = (state: ClientErrorsState, timestampMs: number): boolean => {
  const windowMs = state.config.rateLimit.perMilliseconds;
  const maxEvents = state.config.rateLimit.maxEvents;

  state.rateWindow = state.rateWindow.filter((value) => timestampMs - value <= windowMs);

  if (state.rateWindow.length >= maxEvents) {
    return true;
  }

  state.rateWindow.push(timestampMs);
  return false;
};

export const isDuplicatePayload = (
  state: ClientErrorsState,
  payload: ClientErrorsPayload,
  timestampMs: number
): boolean => {
  const dedupeKey = [
    payload.error.type,
    payload.error.name ?? "",
    payload.error.message,
    payload.error.stack ?? "",
    payload.page.path ?? ""
  ].join("|");

  for (const [key, value] of state.dedupeMap.entries()) {
    if (timestampMs - value > state.config.dedupeWindowMs) {
      state.dedupeMap.delete(key);
    }
  }

  const previousTimestamp = state.dedupeMap.get(dedupeKey);

  if (previousTimestamp && timestampMs - previousTimestamp <= state.config.dedupeWindowMs) {
    return true;
  }

  state.dedupeMap.set(dedupeKey, timestampMs);
  return false;
};
