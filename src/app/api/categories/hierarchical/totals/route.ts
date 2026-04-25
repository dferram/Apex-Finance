import { NextRequest, NextResponse } from 'next/server';
import { getCategoryTotalsHierarchical } from '@/app/actions';

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

    const totals = await getCategoryTotalsHierarchical(parseInt(workspaceId));
    return NextResponse.json(totals);
  } catch (error) {
    console.error('Error in GET /api/categories/hierarchical/totals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
