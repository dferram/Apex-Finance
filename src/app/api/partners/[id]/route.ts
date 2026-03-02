import { NextRequest, NextResponse } from 'next/server';
import { updatePartner, deletePartner } from '@/app/actions';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, percentage, email } = body;

    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return NextResponse.json(
        { error: 'percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    const result = await updatePartner(id, {
      name,
      percentage: percentage !== undefined ? parseFloat(percentage) : undefined,
      email,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update partner' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH /api/partners/[id]:', error);
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
        { error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const result = await deletePartner(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete partner' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/partners/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
