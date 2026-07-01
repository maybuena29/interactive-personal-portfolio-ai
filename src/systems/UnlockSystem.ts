import type { Area } from '../types';

export class UnlockSystem {
  private conditions = new Map<string, boolean>();
  private fulfilledListeners: Array<(condition: string) => void> = [];

  fulfillCondition(condition: string): void {
    if (this.conditions.get(condition) === true) return;
    this.conditions.set(condition, true);
    for (const listener of this.fulfilledListeners) {
      listener(condition);
    }
  }

  isConditionFulfilled(condition: string): boolean {
    return this.conditions.get(condition) === true;
  }

  isAreaUnlocked(area: Area): boolean {
    if (!area.unlockCondition) return true;
    return this.isConditionFulfilled(area.unlockCondition);
  }

  getLockedConditions(): string[] {
    const locked: string[] = [];
    for (const [condition, fulfilled] of this.conditions) {
      if (!fulfilled) locked.push(condition);
    }
    return locked;
  }

  onConditionFulfilled(listener: (condition: string) => void): void {
    this.fulfilledListeners.push(listener);
  }

  getConditionKeys(): string[] {
    return Array.from(this.conditions.keys());
  }

  reset(): void {
    this.conditions.clear();
    this.fulfilledListeners = [];
  }
}
