import { NextRequest, NextResponse } from 'next/server';
import { updateWorkspace } from '@/app/actions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid workspace ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = await updateWorkspace(id, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update workspace' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/workspaces/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
