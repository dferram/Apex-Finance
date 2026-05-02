import { describe, it, expect, vi } from 'vitest';
import { GET as getWorkspaces } from '@/app/api/workspaces/route';
import { GET as getTransactions, POST as createTransaction } from '@/app/api/transactions/route';
import { GET as getWallets, POST as createWallet } from '@/app/api/wallets/route';
import { NextRequest } from 'next/server';

describe('REST API Routes (Unit/Integration Tests)', () => {
  
  const createMockRequest = (url: string, body?: any) => {
    return new NextRequest(new URL(url, 'http://localhost:3000'), {
      method: body ? 'POST' : 'GET',
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  describe('GET /api/workspaces', () => {
    it('should return 200 and a list of workspaces', async () => {
      const req = createMockRequest('/api/workspaces');
      const res = await getWorkspaces(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('GET /api/transactions', () => {
    it('should return 400 if workspace_id is missing', async () => {
      const req = createMockRequest('/api/transactions');
      const res = await getTransactions(req);
      expect(res.status).toBe(400);
    });

    it('should return 200 for valid workspace_id', async () => {
      const req = createMockRequest('/api/transactions?workspace_id=1');
      const res = await getTransactions(req);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/transactions', () => {
    it('should return 201 on successful creation', async () => {
      const body = { workspace_id: 1, category_id: 1, amount: 100, description: 'Test' };
      const req = createMockRequest('/api/transactions', body);
      const res = await createTransaction(req);
      expect(res.status).toBe(201);
    });
  });

  describe('Wallets API', () => {
    it('GET /api/wallets should return 200', async () => {
      const req = createMockRequest('/api/wallets?workspace_id=1');
      const res = await getWallets(req);
      expect(res.status).toBe(200);
    });

    it('POST /api/wallets should return 201', async () => {
      const body = { workspace_id: 1, name: 'API Wallet' };
      const req = createMockRequest('/api/wallets', body);
      const res = await createWallet(req);
      expect(res.status).toBe(201);
    });
  });
});
