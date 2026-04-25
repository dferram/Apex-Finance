import { NextRequest, NextResponse } from 'next/server';
import { getTransactions, createTransaction } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspace_id');
    const limit = searchParams.get('limit');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspace_id is required' },
        { status: 400 }
      );
    }

    const parsedLimit = limit ? parseInt(limit) : undefined;
    const transactions = await getTransactions(parseInt(workspaceId), parsedLimit);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error in GET /api/transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createTransaction(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create transaction' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
