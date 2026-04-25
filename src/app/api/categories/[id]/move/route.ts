import { NextRequest, NextResponse } from 'next/server';
import { moveCategoryParent } from '@/app/actions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { parent_id } = body;

    const result = await moveCategoryParent(id, parent_id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to move category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/categories/[id]/move:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
