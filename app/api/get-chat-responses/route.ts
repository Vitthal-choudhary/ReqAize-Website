import { NextResponse } from 'next/server';
import { join } from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const responsesPath = join(process.cwd(), 'chat_responses.json');
    
    if (!fs.existsSync(responsesPath)) {
      return NextResponse.json(
        { responses: [] },
        { status: 200 }
      );
    }
    
    try {
      const fileContent = fs.readFileSync(responsesPath, 'utf8');
      const responses = JSON.parse(fileContent);
      return NextResponse.json({ responses });
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'Failed to parse responses file', 
          message: `The file exists but could not be parsed: ${(parseError as Error).message}` 
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error accessing chat responses:', error);
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: `Failed to access chat responses: ${(error as Error).message}` 
      }, 
      { status: 500 }
    );
  }
} 