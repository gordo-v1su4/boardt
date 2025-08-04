// Test setup file
import { vi } from 'vitest';

// Mock crypto.randomUUID for consistent testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9))
  }
});

// Mock Date.now for consistent timestamps in tests
const mockDateNow = vi.fn(() => 1234567890000);
vi.stubGlobal('Date', {
  ...Date,
  now: mockDateNow
});