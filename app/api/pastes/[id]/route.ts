import { NextRequest, NextResponse } from 'next/server';
import { getPaste, isPasteExpired, hasExceededViewLimit, incrementViewCount, getRemainingViews, PasteGetResponse } from '@/lib/paste';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid paste ID' },
        { status: 400 }
      );
    }
    
    // Fetch paste
    let paste;
    try {
      paste = await getPaste(id);
    } catch (error) {
      console.error('Error fetching paste from KV:', error);
      return NextResponse.json(
        { error: 'Failed to fetch paste' },
        { status: 500 }
      );
    }
    
    if (!paste) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }
    
    // Check if expired (before incrementing view)
    if (await isPasteExpired(paste)) {
      return NextResponse.json(
        { error: 'Paste expired' },
        { status: 404 }
      );
    }
    
    // Check if view limit exceeded (before incrementing)
    if (hasExceededViewLimit(paste)) {
      return NextResponse.json(
        { error: 'Paste view limit exceeded' },
        { status: 404 }
      );
    }
    
    // Increment view count
    try {
      paste = await incrementViewCount(id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
      return NextResponse.json(
        { error: 'Failed to update paste' },
        { status: 500 }
      );
    }
    
    if (!paste) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }
    
    // Note: We check before incrementing, so if we get here, the paste is available
    // Even if we just hit the limit after incrementing, we still return the paste
    // (the requirement says "becomes unavailable" after the limit, meaning the limit
    // is inclusive - if max_views is 1, the first view succeeds, second fails)
    
    // Build response
    const response: PasteGetResponse = {
      content: paste.content,
      remaining_views: getRemainingViews(paste),
      expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null,
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Unexpected error fetching paste:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
