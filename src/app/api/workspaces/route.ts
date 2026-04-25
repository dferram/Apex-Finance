import { NextRequest, NextResponse } from 'next/server';
import { getWorkspaces } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    const workspaces = await getWorkspaces();
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error in GET /api/workspaces:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
