export interface ClockStore {
  getSnapshot: () => number | null;
  getServerSnapshot: () => null;
  subscribe: (listener: () => void) => () => void;
}

export function createClockStore(intervalMs = 1000): ClockStore {
  let snapshot: number | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<() => void>();

  const publish = () => {
    snapshot = Date.now();
    for (const listener of listeners) listener();
  };

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => null,
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) {
        publish();
        timer = setInterval(publish, intervalMs);
      }

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
  };
}

export const countdownClock = createClockStore();
