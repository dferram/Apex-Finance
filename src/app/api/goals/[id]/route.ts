import { NextRequest, NextResponse } from 'next/server';
import { updateGoal, deleteGoal } from '@/app/actions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = await updateGoal(id, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update goal' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/goals/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      );
    }

    const result = await deleteGoal(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete goal' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/goals/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
