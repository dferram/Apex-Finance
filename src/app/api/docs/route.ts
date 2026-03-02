import { NextResponse } from 'next/server';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Apex Finance API',
    version: '1.0.0',
    description: 'Dual-mode financial intelligence platform API documentation',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  paths: {
    '/api/workspaces': {
      get: {
        summary: 'Get all workspaces',
        description: 'Retrieves all workspaces ordered by type (personal first, then professional)',
        tags: ['Workspaces'],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Workspace',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/transactions': {
      get: {
        summary: 'Get transactions',
        description: 'Retrieves transactions for a specific workspace with optional limit',
        tags: ['Transactions'],
        parameters: [
          {
            name: 'workspace_id',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
            },
            description: 'Workspace ID',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: {
              type: 'integer',
            },
            description: 'Maximum number of transactions to return',
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Transaction',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create transaction',
        description: 'Creates a new transaction',
        tags: ['Transactions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateTransaction',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Transaction created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/categories': {
      get: {
        summary: 'Get categories',
        description: 'Retrieves all categories for a workspace',
        tags: ['Categories'],
        parameters: [
          {
            name: 'workspace_id',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Category',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create category',
        description: 'Creates a new category',
        tags: ['Categories'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateCategory',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Category created successfully',
          },
        },
      },
    },
    '/api/stats': {
      get: {
        summary: 'Get financial statistics',
        description: 'Retrieves aggregated financial stats for a workspace',
        tags: ['Statistics'],
        parameters: [
          {
            name: 'workspace_id',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApexStats',
                },
              },
            },
          },
        },
      },
    },
    '/api/transactions/{id}': {
      put: {
        summary: 'Update transaction',
        description: 'Updates an existing transaction',
        tags: ['Transactions'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateTransaction',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Transaction updated successfully',
          },
        },
      },
      delete: {
        summary: 'Delete transaction',
        description: 'Deletes a transaction',
        tags: ['Transactions'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Transaction deleted successfully',
          },
        },
      },
    },
    '/api/categories/{id}': {
      put: {
        summary: 'Update category',
        description: 'Updates an existing category',
        tags: ['Categories'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateCategory',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Category updated successfully',
          },
        },
      },
      delete: {
        summary: 'Delete category',
        description: 'Deletes a category',
        tags: ['Categories'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Category deleted successfully',
          },
        },
      },
    },
    '/api/categories/hierarchical': {
      get: {
        summary: 'Get hierarchical categories',
        description: 'Retrieves categories in hierarchical tree structure with full paths',
        tags: ['Categories'],
        parameters: [
          {
            name: 'workspace_id',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/CategoryNode',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/partners': {
      get: {
        summary: 'Get partners',
        description: 'Retrieves all partners for a specific workspace',
        tags: ['Partners'],
        parameters: [
          {
            name: 'workspace_id',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
            },
            description: 'Workspace ID',
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Partner',
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - workspace_id is required',
          },
        },
      },
      post: {
        summary: 'Create partner',
        description: 'Creates a new partner for a workspace',
        tags: ['Partners'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreatePartner',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Partner created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Partner',
                },
              },
            },
          },
          '400': {
            description: 'Bad request - invalid data',
          },
        },
      },
    },
    '/api/partners/{id}': {
      patch: {
        summary: 'Update partner',
        description: 'Updates an existing partner',
        tags: ['Partners'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
            description: 'Partner ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdatePartner',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Partner updated successfully',
          },
          '400': {
            description: 'Bad request - invalid data',
          },
        },
      },
      delete: {
        summary: 'Delete partner',
        description: 'Deletes a partner',
        tags: ['Partners'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
            description: 'Partner ID',
          },
        ],
        responses: {
          '200': {
            description: 'Partner deleted successfully',
          },
          '400': {
            description: 'Bad request - invalid ID',
          },
        },
      },
    },
    '/api/categories/hierarchical/totals': {
      get: {
        summary: 'Get hierarchical category totals',
        description: 'Retrieves aggregated transaction totals for each category including all descendants',
        tags: ['Categories'],
        parameters: [
          {
            name: 'workspace_id',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      category_id: {
                        type: 'integer',
                      },
                      total_amount: {
                        type: 'string',
                        description: 'Total amount as string (includes descendants)',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/categories/{id}/move': {
      put: {
        summary: 'Move category parent',
        description: 'Changes the parent of a category',
        tags: ['Categories'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  parent_id: {
                    type: 'integer',
                    nullable: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Category moved successfully',
          },
        },
      },
    },
    '/api/goals': {
      get: {
        summary: 'Get financial goals',
        description: 'Retrieves all financial goals for a user',
        tags: ['Goals'],
        parameters: [
          {
            name: 'user_id',
            in: 'query',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Goal',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create financial goal',
        description: 'Creates a new financial goal',
        tags: ['Goals'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateGoal',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Goal created successfully',
          },
        },
      },
    },
    '/api/goals/{id}': {
      put: {
        summary: 'Update goal',
        description: 'Updates an existing goal',
        tags: ['Goals'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateGoal',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Goal updated successfully',
          },
        },
      },
      delete: {
        summary: 'Delete goal',
        description: 'Deletes a goal',
        tags: ['Goals'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Goal deleted successfully',
          },
        },
      },
    },
    '/api/workspaces/{id}': {
      put: {
        summary: 'Update workspace',
        description: 'Updates workspace settings',
        tags: ['Workspaces'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateWorkspace',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Workspace updated successfully',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Workspace: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Workspace ID',
          },
          user_id: {
            type: 'integer',
            description: 'User ID',
          },
          name: {
            type: 'string',
            description: 'Workspace name',
          },
          is_professional: {
            type: 'boolean',
            description: 'Whether this is a professional workspace',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          workspace_id: {
            type: 'integer',
          },
          category_id: {
            type: 'integer',
          },
          amount: {
            type: 'number',
            description: 'Transaction amount (positive for income, negative for expenses)',
          },
          description: {
            type: 'string',
          },
          date: {
            type: 'string',
            format: 'date-time',
          },
          is_essential: {
            type: 'boolean',
            description: 'Whether this is an essential expense',
          },
        },
      },
      CreateTransaction: {
        type: 'object',
        required: ['workspace_id', 'category_id', 'amount', 'description'],
        properties: {
          workspace_id: {
            type: 'integer',
          },
          category_id: {
            type: 'integer',
          },
          amount: {
            type: 'number',
          },
          description: {
            type: 'string',
          },
          date: {
            type: 'string',
            format: 'date-time',
          },
          is_essential: {
            type: 'boolean',
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          workspace_id: {
            type: 'integer',
          },
          name: {
            type: 'string',
          },
          parent_id: {
            type: 'integer',
            nullable: true,
          },
          monthly_budget: {
            type: 'number',
            nullable: true,
          },
          is_project: {
            type: 'boolean',
          },
        },
      },
      CreateCategory: {
        type: 'object',
        required: ['workspace_id', 'name'],
        properties: {
          workspace_id: {
            type: 'integer',
          },
          name: {
            type: 'string',
          },
          parent_id: {
            type: 'integer',
            nullable: true,
          },
          monthly_budget: {
            type: 'number',
            nullable: true,
          },
          is_project: {
            type: 'boolean',
          },
        },
      },
      ApexStats: {
        type: 'object',
        properties: {
          totalBalance: {
            type: 'number',
            description: 'Total balance (income - expenses)',
          },
          weeklyExpense: {
            type: 'number',
            description: 'Expenses in the last 7 days',
          },
          totalIncome: {
            type: 'number',
            description: 'Total income',
          },
          totalExpense: {
            type: 'number',
            description: 'Total expenses',
          },
        },
      },
      UpdateTransaction: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
          },
          description: {
            type: 'string',
          },
          category_id: {
            type: 'integer',
          },
          date: {
            type: 'string',
            format: 'date-time',
          },
          is_essential: {
            type: 'boolean',
          },
        },
      },
      UpdateCategory: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          parent_id: {
            type: 'integer',
            nullable: true,
          },
          monthly_budget: {
            type: 'number',
            nullable: true,
          },
          is_project: {
            type: 'boolean',
          },
        },
      },
      Goal: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          user_id: {
            type: 'integer',
          },
          name: {
            type: 'string',
          },
          target_amount: {
            type: 'number',
          },
          current_amount: {
            type: 'number',
          },
          deadline: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },
      CreateGoal: {
        type: 'object',
        required: ['user_id', 'name', 'target_amount'],
        properties: {
          user_id: {
            type: 'integer',
          },
          name: {
            type: 'string',
          },
          target_amount: {
            type: 'number',
          },
          deadline: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },
      UpdateGoal: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          target_amount: {
            type: 'number',
          },
          current_amount: {
            type: 'number',
          },
          deadline: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },
      UpdateWorkspace: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          currency: {
            type: 'string',
          },
        },
      },
      CategoryNode: {
        type: 'object',
        description: 'Category with hierarchical information',
        properties: {
          id: {
            type: 'integer',
          },
          workspace_id: {
            type: 'integer',
          },
          name: {
            type: 'string',
          },
          parent_id: {
            type: 'integer',
            nullable: true,
          },
          monthly_budget: {
            type: 'string',
            nullable: true,
          },
          is_project: {
            type: 'boolean',
          },
          full_path: {
            type: 'string',
            description: 'Full hierarchical path (e.g., "Parent / Child / Grandchild")',
          },
          level: {
            type: 'integer',
            description: 'Depth level in the hierarchy (1 = root)',
          },
        },
      },
      Partner: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          workspace_id: {
            type: 'integer',
          },
          name: {
            type: 'string',
          },
          percentage: {
            type: 'number',
            format: 'decimal',
            description: 'Ownership percentage (0.00 to 100.00)',
          },
          email: {
            type: 'string',
            nullable: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CreatePartner: {
        type: 'object',
        required: ['workspace_id', 'name', 'percentage'],
        properties: {
          workspace_id: {
            type: 'integer',
          },
          name: {
            type: 'string',
          },
          percentage: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            maximum: 100,
          },
          email: {
            type: 'string',
            nullable: true,
          },
        },
      },
      UpdatePartner: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          percentage: {
            type: 'number',
            format: 'decimal',
            minimum: 0,
            maximum: 100,
          },
          email: {
            type: 'string',
            nullable: true,
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(swaggerDocument);
}
