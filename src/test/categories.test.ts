import { describe, it, expect, vi } from 'vitest';
import { getCategories, createCategory, getCategoriesHierarchical, updateCategory, deleteCategory } from '@/app/actions';

describe('Categories Server Actions (Unit Tests)', () => {
  
  describe('getCategories', () => {
    it('should return all categories for a workspace', async () => {
      const result = await getCategories(1);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('createCategory', () => {
    it('should create a root category successfully', async () => {
      const result = await createCategory({ workspace_id: 1, name: 'Food' });
      expect(result.success).toBe(true);
      expect(result.category).toBeDefined();
    });
  });

  describe('getCategoriesHierarchical', () => {
    it('should return a tree structure of categories', async () => {
      const result = await getCategoriesHierarchical(1);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('updateCategory', () => {
    it('should update the name of an existing category', async () => {
      const result = await updateCategory(1, { name: 'Health' });
      expect(result.success).toBe(true);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const result = await deleteCategory(1);
      expect(result.success).toBe(true);
    });
  });
});
