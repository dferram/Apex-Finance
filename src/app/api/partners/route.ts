import { NextRequest, NextResponse } from 'next/server';
import { getPartners, createPartner } from '@/app/actions';

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

    const partners = await getPartners(parseInt(workspaceId));
    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error in GET /api/partners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspace_id, name, percentage, email } = body;

    if (!workspace_id || !name || percentage === undefined) {
      return NextResponse.json(
        { error: 'workspace_id, name, and percentage are required' },
        { status: 400 }
      );
    }

    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: 'percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    const result = await createPartner({
      workspace_id: parseInt(workspace_id),
      name,
      percentage: parseFloat(percentage),
      email,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create partner' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.partner, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/partners:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
