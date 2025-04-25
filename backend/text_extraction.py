"""
Main text extraction module.
Provides functions to extract text from various document formats.
"""

import os
import json
import sys
from typing import List, Dict, Union

# Import local modules
from extractors.document_extractors import (
    extract_text_from_pdf,
    extract_text_from_word,
    extract_text_from_ppt
)
from utils.system_utils import (
    report_environment,
    ensure_directory_exists,
    get_file_extension,
    get_file_name
)


def extract_text_from_files(file_paths: List[str]) -> Dict[str, Union[str, Dict]]:
    """
    Extract text from multiple files of different types.
    Returns a dictionary with file names as keys and extracted text as values.
    """
    results = {}
    
    for file_path in file_paths:
        if not os.path.exists(file_path):
            results[file_path] = "Error: File not found"
            continue
            
        file_name = get_file_name(file_path)
        file_ext = get_file_extension(file_path)
        
        if file_ext == ".pdf":
            text = extract_text_from_pdf(file_path)
        elif file_ext in [".ppt", ".pptx"]:
            text = extract_text_from_ppt(file_path)
        elif file_ext in [".doc", ".docx"]:
            text = extract_text_from_word(file_path)
        else:
            text = f"Unsupported file type: {file_ext}"
        
        results[file_name] = {
            "file_type": file_ext,
            "extracted_text": text
        }
    
    return results


if __name__ == "__main__":
    # Report environment details
    print(report_environment())
    print("-" * 50)
    
    # Get file paths from command line arguments
    file_paths = sys.argv[1:] if len(sys.argv) > 1 else []
    
    # If no command line arguments, try interactive input
    if not file_paths:
        print("Enter file paths (one per line). Press Enter on an empty line when done:")
        try:
            while True:
                path = input().strip()
                if not path:
                    break
                file_paths.append(path)
        except EOFError:
            # Handle EOF (e.g., when reading from a file)
            pass
    
    if not file_paths:
        print("No files provided. Exiting.")
    else:
        print(f"Processing {len(file_paths)} files: {file_paths}")
        
        # Extract text from all files
        results = extract_text_from_files(file_paths)
        
        # Print results in a formatted way
        print("\n" + "="*50)
        print("EXTRACTION RESULTS")
        print("="*50)
        
        for file_name, data in results.items():
            print(f"\nFile: {file_name}")
            if isinstance(data, dict):
                print(f"Type: {data['file_type']}")
                print("-"*50)
                
                # Print first 200 characters of extracted text as preview
                preview = data['extracted_text'][:200] + "..." if len(data['extracted_text']) > 200 else data['extracted_text']
                print(f"Text Preview: {preview}")
            else:
                # Handle case where data is not a dictionary (error message)
                print(f"Error: {data}")
            print("-"*50)
        
        # Ensure output directory exists
        output_dir = os.path.dirname(os.path.join(os.getcwd(), 'extraction_results.json'))
        ensure_directory_exists(output_dir)
        
        # Save full results to JSON file (this is temporary and will be handled by the API)
        output_path = os.path.join(os.getcwd(), 'extraction_results.json')
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        print(f"\nFull results saved to '{output_path}' (temporary file)")
