import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import fs from 'fs';

// Ensure directory exists function
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Route to save a new chat response
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    if (!message || !message.content || message.role !== 'assistant') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }
    
    const responsesPath = join(process.cwd(), 'chat_responses.json');
    
    // Load existing responses or create new array
    let responses: any[] = [];
    if (fs.existsSync(responsesPath)) {
      try {
        const fileContent = fs.readFileSync(responsesPath, 'utf8');
        responses = JSON.parse(fileContent);
      } catch (parseError) {
        console.error('Error parsing responses file:', parseError);
        // If file is corrupted, start with a fresh array
      }
    }
    
    // Add timestamp to the message
    const responseWithTimestamp = {
      ...message,
      timestamp: new Date().toISOString()
    };
    
    // Add new response
    responses.push(responseWithTimestamp);
    
    // Ensure directory exists
    ensureDirectoryExists(join(process.cwd()));
    
    // Save updated responses
    fs.writeFileSync(responsesPath, JSON.stringify(responses, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving chat response:', error);
    return NextResponse.json(
      { error: 'Failed to save response', details: (error as Error).message },
      { status: 500 }
    );
  }
} 