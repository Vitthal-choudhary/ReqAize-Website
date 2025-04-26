import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

// Ensure directory exists function
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { results } = await req.json();
    
    if (!results) {
      return NextResponse.json(
        { error: 'No extraction results provided' },
        { status: 400 }
      );
    }

    // Create a filename with timestamp to avoid overwriting
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `extracted_text_${timestamp}.json`;
    
    // Save to root directory
    const filePath = join(process.cwd(), fileName);
    
    // Convert results to formatted JSON string
    const formattedJson = JSON.stringify(results, null, 2);
    
    // Write to file
    await writeFile(filePath, formattedJson, 'utf8');
    
    return NextResponse.json({ 
      success: true, 
      filePath: fileName,
      message: `Extracted text saved to ${fileName} in the project root`
    });
    
  } catch (error) {
    console.error('Error saving extracted text:', error);
    return NextResponse.json(
      { error: 'Failed to save extracted text', details: (error as Error).message },
      { status: 500 }
    );
  }
} 