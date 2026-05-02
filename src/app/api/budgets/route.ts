import { NextRequest, NextResponse } from 'next/server';
import { getBudgets, createBudget } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspace_id');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const budgets = await getBudgets(parseInt(workspaceId));
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error in GET /api/budgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createBudget(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create budget' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, budget: result.budget }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/budgets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
