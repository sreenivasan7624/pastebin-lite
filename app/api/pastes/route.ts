import { NextRequest, NextResponse } from 'next/server';
import { createPasteSchema } from '@/lib/paste';
import { generatePasteId, getCurrentTime, calculateExpiresAt, getBaseUrl } from '@/lib/utils';
import { storePaste, PasteData } from '@/lib/paste';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate request body
    const validationResult = createPasteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { content, ttl_seconds, max_views } = validationResult.data;
    
    // Generate unique ID
    let id: string;
    try {
      id = await generatePasteId();
    } catch (error) {
      console.error('Error generating paste ID:', error);
      return NextResponse.json(
        { error: 'Failed to generate paste ID' },
        { status: 500 }
      );
    }
    
    // Calculate timestamps
    const currentTime = await getCurrentTime();
    const expires_at = ttl_seconds ? calculateExpiresAt(ttl_seconds, currentTime) : undefined;
    
    // Create paste data
    const pasteData: PasteData = {
      content,
      ttl_seconds,
      max_views,
      created_at: currentTime,
      expires_at,
      views: 0,
    };
    
    // Store in KV
    try {
      await storePaste(id, pasteData, ttl_seconds);
    } catch (error) {
      console.error('Error storing paste:', error);
      return NextResponse.json(
        { error: 'Failed to store paste' },
        { status: 500 }
      );
    }
    
    // Generate URL
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/p/${id}`;
    
    return NextResponse.json(
      { id, url },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error creating paste:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
