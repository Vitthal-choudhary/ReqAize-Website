import { NextResponse } from 'next/server';
import { join } from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const resultPath = join(process.cwd(), 'extraction_results.json');
    
    if (!fs.existsSync(resultPath)) {
      return NextResponse.json(
        { 
          error: 'Extraction results file not found', 
          message: 'No extraction has been performed yet or the file has been moved.' 
        }, 
        { status: 404 }
      );
    }
    
    try {
      const fileContent = fs.readFileSync(resultPath, 'utf8');
      const results = JSON.parse(fileContent);
      return NextResponse.json({ results });
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'Failed to parse results file', 
          message: `The file exists but could not be parsed: ${(parseError as Error).message}` 
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error accessing extraction results:', error);
    return NextResponse.json(
      { 
        error: 'Server error', 
        message: `Failed to access extraction results: ${(error as Error).message}` 
      }, 
      { status: 500 }
    );
  }
} 