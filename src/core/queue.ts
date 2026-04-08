import type { ClientErrorsState, PendingCaptureItem } from "./state";

type QueueProcessor = (item: PendingCaptureItem) => Promise<void>;

const resolveFlushesIfIdle = (state: ClientErrorsState): void => {
  if (state.processing || state.inFlight > 0 || state.queue.length > 0) {
    return;
  }

  const resolvers = state.flushResolvers.splice(0, state.flushResolvers.length);
  resolvers.forEach((resolve) => resolve());
};

export const scheduleQueueDrain = (
  state: ClientErrorsState,
  processor: QueueProcessor
): void => {
  if (state.destroyed || state.scheduled || state.processing) {
    return;
  }

  state.scheduled = true;

  globalThis.setTimeout(async () => {
    state.scheduled = false;

    if (state.processing || state.destroyed) {
      return;
    }

    state.processing = true;

    try {
      while (!state.destroyed && state.queue.length > 0) {
        const item = state.queue.shift();

        if (!item) {
          continue;
        }

        state.inFlight += 1;

        try {
          await processor(item);
        } finally {
          state.inFlight -= 1;
        }
      }
    } finally {
      state.processing = false;
      resolveFlushesIfIdle(state);

      if (state.queue.length > 0) {
        scheduleQueueDrain(state, processor);
      }
    }
  }, 0);
};

export const enqueueCaptureItem = (
  state: ClientErrorsState,
  item: PendingCaptureItem,
  processor: QueueProcessor
): void => {
  if (state.destroyed || !state.config.enabled) {
    return;
  }

  state.queue.push(item);
  scheduleQueueDrain(state, processor);
};

export const flushQueue = async (state: ClientErrorsState): Promise<void> => {
  if (!state.processing && state.inFlight === 0 && state.queue.length === 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    state.flushResolvers.push(resolve);
  });
};
