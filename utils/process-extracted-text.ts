import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function processExtractedText(extractedText: any): Promise<string> {
  // Create a temporary Python script file
  const scriptPath = path.join(process.cwd(), 'temp-script.py');
  
  // Save the JSON data to a temporary file to avoid command line escaping issues
  const jsonDataPath = path.join(process.cwd(), 'temp-data.json');
  fs.writeFileSync(jsonDataPath, JSON.stringify(extractedText));
  
  const pythonScript = `
import pandas as pd
import json
import sys

try:
    # Read the JSON data from file instead of embedded in script
    with open('temp-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    def process_document(doc_name, doc_data):
        # Extract the text content
        extracted_text = doc_data.get("extracted_text", "")
        if not extracted_text:
            return pd.DataFrame({"Section": ["Error"], "Details": ["No text content found in document"]})
            
        document_data = extracted_text.split('\\n')
        
        # Define common sections in business requirements documents
        sections = ["Objective", "Executive Summary", "Stakeholders", "Functional Requirements", 
                    "Constraints", "Timeline and Deadlines", "Budget", "Project Phases"]
        
        # Initialize variables to store the current section and its content
        current_section = None
        section_content = []
        brd_dict = {}
        
        # Process the text line by line
        for line in document_data:
            line = line.strip()
            # Check if the line contains a section header
            if any(section in line for section in sections):
                # If we were already in a section, save its content
                if current_section:
                    brd_dict[current_section] = "\\n".join(section_content).strip()
                
                # Set the new current section
                for section in sections:
                    if section in line:
                        current_section = section
                        break
                
                # Reset the section content
                section_content = []
            elif current_section and line:
                # Add the line to the current section's content
                section_content.append(line)
        
        # Don't forget to save the last section
        if current_section and section_content:
            brd_dict[current_section] = "\\n".join(section_content).strip()
        
        # Convert to DataFrame
        if brd_dict:
            brd_df = pd.DataFrame(list(brd_dict.items()), columns=["Section", "Details"])
            return brd_df
        else:
            return pd.DataFrame({"Section": ["No sections found"], "Details": ["No structured data could be extracted"]})
    
    # Process each document in the data
    results = {}
    for doc_name, doc_data in data.items():
        try:
            df = process_document(doc_name, doc_data)
            results[doc_name] = df.to_dict(orient='records')
        except Exception as doc_err:
            results[doc_name] = [{"Section": "Error", "Details": f"Failed to process document: {str(doc_err)}"}]
    
    # Output the results as JSON
    print(json.dumps(results))
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
finally:
    # Clean up
    try:
        import os
        if os.path.exists('temp-data.json'):
            os.remove('temp-data.json')
    except:
        pass
`;

  fs.writeFileSync(scriptPath, pythonScript);

  try {
    // Execute the Python script
    const result = await new Promise<string>((resolve, reject) => {
      const pythonProcess = spawn('python', [scriptPath]);
      
      let dataString = '';
      let errorString = '';
      
      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.error(`Python Error: ${data}`);
      });
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process error: ${errorString}`));
        } else {
          resolve(dataString);
        }
      });
    });

    // Clean up the temporary files
    if (fs.existsSync(scriptPath)) {
      fs.unlinkSync(scriptPath);
    }
    if (fs.existsSync(jsonDataPath)) {
      fs.unlinkSync(jsonDataPath);
    }
    
    return result;
  } catch (error) {
    console.error('Error processing with Python:', error);
    // Clean up even if there's an error
    if (fs.existsSync(scriptPath)) {
      fs.unlinkSync(scriptPath);
    }
    if (fs.existsSync(jsonDataPath)) {
      fs.unlinkSync(jsonDataPath);
    }
    throw error;
  }
} 