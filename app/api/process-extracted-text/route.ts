import { NextResponse } from 'next/server';
import { processExtractedText } from '@/utils/process-extracted-text';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Get the extracted text from the request body
    const { results } = await request.json();
    
    if (!results) {
      return NextResponse.json(
        { error: 'No extracted text provided' },
        { status: 400 }
      );
    }
    
    // Process the extracted text using pandas
    const processedData = await processExtractedText(results);
    
    // Parse the JSON result from Python
    let parsedData;
    try {
      parsedData = JSON.parse(processedData);
      
      // Check if Python returned an error
      if (parsedData.error) {
        return NextResponse.json(
          { error: `Python processing error: ${parsedData.error}` },
          { status: 500 }
        );
      }
    } catch (parseError) {
      console.error('Error parsing Python output:', processedData);
      return NextResponse.json(
        { error: `Failed to parse Python output: ${(parseError as Error).message}` },
        { status: 500 }
      );
    }
    
    // Save the processed data as a JSON file
    const outputDirectory = path.join(process.cwd(), 'public', 'downloads');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(outputDirectory, `extracted-user-stories-${timestamp}.json`);
    
    // Save the processed data to a file
    fs.writeFileSync(filePath, JSON.stringify(parsedData, null, 2));
    
    // Return the relative path for client-side download
    const downloadPath = `/downloads/extracted-user-stories-${timestamp}.json`;
    
    return NextResponse.json({
      success: true,
      message: 'Text processed successfully',
      downloadPath,
      data: parsedData
    });
    
  } catch (error: any) {
    console.error('Error processing text:', error);
    
    return NextResponse.json(
      { error: `Error processing text: ${error.message}` },
      { status: 500 }
    );
  }
} 