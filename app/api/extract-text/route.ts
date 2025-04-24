import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import fs from 'fs';

const execPromise = promisify(exec);

// Ensure directory exists function without external dependencies
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Route handlers are already server-side only, so 'use server' is not needed

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Create temporary directory for file uploads
    const uploadDir = join(process.cwd(), 'uploads');
    ensureDirectoryExists(uploadDir);
    
    // Save files to temp directory and collect their paths
    const filePaths: string[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = join(uploadDir, file.name);
      await writeFile(filePath, buffer);
      filePaths.push(filePath);
    }

    try {
      // Use the extract.bat script to run the Python extraction
      const batchScript = join(process.cwd(), 'backend/extract.bat');
      const filePathArgs = filePaths.map(path => `"${path}"`).join(' ');
      
      console.log(`Running extraction with batch script: ${batchScript} ${filePathArgs}`);
      
      // Run the batch script with file paths as arguments
      const { stdout, stderr } = await execPromise(`"${batchScript}" ${filePathArgs}`);
      
      console.log("Extraction output:", stdout);
      
      // Handle errors
      if (stderr && stderr.includes('Error')) {
        console.error('Extraction error:', stderr);
        return NextResponse.json(
          { error: 'Error processing files', details: stderr },
          { status: 500 }
        );
      }
      
      // Read the extraction results JSON file
      const resultPath = join(process.cwd(), 'extraction_results.json');
      
      if (fs.existsSync(resultPath)) {
        console.log('Reading extraction results from:', resultPath);
        const results = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
        return NextResponse.json({ results });
      } else {
        // Fallback if Python script didn't create the results file
        console.error('Extraction results file not found');
        return NextResponse.json(
          { error: 'Failed to extract text from files', details: 'Results file not found' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error during extraction:', error);
      
      // Fallback: process text files only as a last resort
      const fallbackResults: Record<string, any> = {};
      
      for (const filePath of filePaths) {
        const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || 'unknown';
        const fileExt = (fileName.split('.').pop() || '').toLowerCase();
        
        try {
          if (['.txt', '.md', '.json', '.csv', '.html', '.xml', '.js', '.ts', '.css'].includes('.' + fileExt)) {
            // Text files - read directly
            const content = fs.readFileSync(filePath, 'utf8');
            fallbackResults[fileName] = {
              file_type: fileExt,
              extracted_text: content
            };
          } else {
            // Binary files - report as unsupported in fallback mode
            fallbackResults[fileName] = {
              file_type: fileExt,
              extracted_text: "Text extraction failed. File type requires Python libraries that couldn't be accessed."
            };
          }
        } catch (fileError) {
          fallbackResults[fileName] = {
            file_type: fileExt,
            extracted_text: `Error reading file: ${(fileError as Error).message}`
          };
        }
      }
      
      // Save fallback results
      const resultPath = join(process.cwd(), 'extraction_results.json');
      fs.writeFileSync(resultPath, JSON.stringify(fallbackResults, null, 2));
      
      return NextResponse.json({ 
        results: fallbackResults,
        warning: "Used fallback extraction method - limited file type support"
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 