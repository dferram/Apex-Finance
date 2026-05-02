import { describe, it, expect, vi } from 'vitest';
import { getPartners, createPartner, updatePartner, deletePartner } from '@/app/actions';

describe('Partners Server Actions (Unit Tests)', () => {
  
  describe('getPartners', () => {
    it('should return all partners for a workspace', async () => {
      const result = await getPartners(1);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('createPartner', () => {
    it('should create a partner with valid data', async () => {
      const data = {
        workspace_id: 1,
        name: 'John Doe',
        percentage: 50,
        email: 'john@example.com'
      };
      const result = await createPartner(data);
      expect(result.success).toBe(true);
      expect(result.partner).toBeDefined();
    });

    it('should fail if name is missing', async () => {
        // @ts-ignore
        const result = await createPartner({ workspace_id: 1, percentage: 50 });
        expect(result.success).toBe(false);
    });
  });

  describe('updatePartner', () => {
    it('should update partner name', async () => {
      const result = await updatePartner(1, { name: 'Jane Doe' });
      expect(result.success).toBe(true);
    });
  });

  describe('deletePartner', () => {
    it('should delete a partner record', async () => {
      const result = await deletePartner(1);
      expect(result.success).toBe(true);
    });
  });
});
