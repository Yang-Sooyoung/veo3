import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage with proper Object.keys support
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = value.toString();
  }

  // Make the store enumerable so Object.keys works
  [key: string]: any;
}

const localStorageMock = new LocalStorageMock();

// Proxy to make Object.keys work
global.localStorage = new Proxy(localStorageMock, {
  ownKeys(target) {
    return Object.keys((target as any).store);
  },
  getOwnPropertyDescriptor(target, prop) {
    if (typeof prop === 'string' && (target as any).store.hasOwnProperty(prop)) {
      return {
        enumerable: true,
        configurable: true,
        value: (target as any).store[prop],
      };
    }
    return Object.getOwnPropertyDescriptor(target, prop);
  },
});

// Mock fetch
global.fetch = vi.fn();
