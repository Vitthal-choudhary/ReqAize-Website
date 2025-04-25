import json
import sys
import os
import pandas as pd
from datetime import datetime

def export_to_excel(json_file_path):
    """
    Converts chat messages from a JSON file to an Excel file.
    
    Args:
        json_file_path: Path to the JSON file containing chat messages
        
    Returns:
        Path to the generated Excel file
    """
    try:
        # Read the JSON file
        with open(json_file_path, 'r', encoding='utf-8') as file:
            messages = json.load(file)
        
        # Create a directory for exports if it doesn't exist
        exports_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'exports')
        os.makedirs(exports_dir, exist_ok=True)
        
        # Format data for Excel
        excel_data = []
        for idx, msg in enumerate(messages):
            excel_data.append({
                'Message #': idx + 1,
                'Role': msg['role'].capitalize(),
                'Content': msg['content']
            })
        
        # Convert to DataFrame
        df = pd.DataFrame(excel_data)
        
        # Create Excel file name with timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        excel_file_name = f'chat_export_{timestamp}.xlsx'
        excel_file_path = os.path.join(exports_dir, excel_file_name)
        
        # Write to Excel
        writer = pd.ExcelWriter(excel_file_path, engine='openpyxl')
        df.to_excel(writer, sheet_name='Chat Messages', index=False)
        
        # Auto-adjust columns' width
        worksheet = writer.sheets['Chat Messages']
        for idx, col in enumerate(df.columns):
            # Find the maximum length of the column
            max_len = max(
                df[col].astype(str).map(len).max(),  # Length of the longest value
                len(col)  # Length of the column name
            )
            # Add some extra space
            adjusted_width = max_len + 2
            # Set the column width
            worksheet.column_dimensions[chr(65 + idx)].width = min(adjusted_width, 100)  # Cap width at 100
        
        # Save the Excel file
        writer.close()
        
        # Print the path for the API to pick up
        print(excel_file_path)
        return excel_file_path
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python export_to_excel.py <json_file_path>", file=sys.stderr)
        sys.exit(1)
        
    json_file_path = sys.argv[1]
    export_to_excel(json_file_path) 