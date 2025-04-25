import { NextResponse } from 'next/server';
import { join } from 'path';
import fs from 'fs';

// Route to clear all chat responses
export async function POST() {
  try {
    const responsesPath = join(process.cwd(), 'chat_responses.json');
    
    // Check if file exists
    if (fs.existsSync(responsesPath)) {
      // Reset to empty array
      fs.writeFileSync(responsesPath, JSON.stringify([], null, 2));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing chat responses:', error);
    return NextResponse.json(
      { error: 'Failed to clear responses', details: (error as Error).message },
      { status: 500 }
    );
  }
} 