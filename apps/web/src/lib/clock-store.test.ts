import { describe, expect, it } from "vitest";
import { createClockStore } from "./clock-store";

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

async function waitForCondition(
  condition: () => boolean,
  timeoutMs = 2_000,
) {
  const deadline = Date.now() + timeoutMs;

  while (!condition()) {
    if (Date.now() >= deadline) {
      throw new Error(`Condition was not met within ${timeoutMs}ms`);
    }
    await wait(10);
  }
}

describe("createClockStore", () => {
  it("uses the same empty snapshot before subscription and during server rendering", () => {
    const clock = createClockStore(10);

    expect(clock.getServerSnapshot()).toBeNull();
    expect(clock.getSnapshot()).toBeNull();
  });

  it("publishes immediately, ticks on a real interval, and stops after unsubscribe", async () => {
    const clock = createClockStore(10);
    const witnessClock = createClockStore(10);
    let notifications = 0;
    let witnessNotifications = 0;
    let unsubscribe = () => {};
    let unsubscribeWitness = () => {};

    try {
      unsubscribe = clock.subscribe(() => {
        notifications += 1;
      });

      expect(clock.getSnapshot()).toEqual(expect.any(Number));
      expect(notifications).toBe(1);

      await waitForCondition(() => notifications >= 2);

      const stoppedAt = clock.getSnapshot();
      const stoppedNotifications = notifications;
      unsubscribe();
      unsubscribe = () => {};

      unsubscribeWitness = witnessClock.subscribe(() => {
        witnessNotifications += 1;
      });
      await waitForCondition(() => witnessNotifications >= 3);

      expect(clock.getSnapshot()).toBe(stoppedAt);
      expect(notifications).toBe(stoppedNotifications);
    } finally {
      unsubscribe();
      unsubscribeWitness();
    }
  });
});
