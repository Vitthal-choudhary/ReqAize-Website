import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      error: 'API endpoint deprecated', 
      message: 'The extraction_results.json file has been replaced with a new chat responses system. Please use /api/get-chat-responses instead.' 
    }, 
    { status: 410 }
  );
} 