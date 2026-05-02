import { NextRequest, NextResponse } from 'next/server';
import { getWallets, createWallet } from '@/app/actions';

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

    const wallets = await getWallets(parseInt(workspaceId));
    return NextResponse.json(wallets);
  } catch (error) {
    console.error('Error in GET /api/wallets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createWallet(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create wallet' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, wallet: result.wallet }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/wallets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
