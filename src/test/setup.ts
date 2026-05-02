import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock database to allow tests to run without connection
const mockQuery = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  leftJoin: vi.fn().mockReturnThis(),
  then(onFulfilled: any) {
    return Promise.resolve([]).then(onFulfilled);
  },
  catch(onRejected: any) {
    return Promise.resolve([]).catch(onRejected);
  },
};

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => mockQuery),
    insert: vi.fn(() => ({
      values: vi.fn((vals) => {
        // Simulate DB failure for invalid IDs used in tests
        if (vals.workspace_id === 999 || vals.workspace_id === -1 || vals.category_id === 9999) {
          return {
            returning: vi.fn(() => Promise.reject(new Error('Foreign key constraint violation'))),
          };
        }
        return {
          returning: vi.fn(() => Promise.resolve([
            { 
              id: 1, 
              currency: 'MXN', 
              balance: '0', 
              amount: '0', 
              ...vals 
            }
          ])),
        };
      }),
    })),
    update: vi.fn(() => ({
      set: vi.fn((vals) => ({
        where: vi.fn(() => Promise.resolve([{ id: 1, ...vals }])),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve([{ id: 1 }])),
    })),
    execute: vi.fn(() => Promise.resolve({ rows: [] })),
  },
}));

// Mock Next.js revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
