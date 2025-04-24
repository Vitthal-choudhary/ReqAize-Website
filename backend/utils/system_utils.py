"""
System utilities for backend operations.
Provides functions for system info, file operations, and environment details.
"""

import sys
import os
import platform

def report_environment() -> str:
    """Report details about the Python environment for debugging."""
    env_info = []
    env_info.append(f"Python Version: {sys.version}")
    env_info.append(f"Platform: {platform.platform()}")
    env_info.append(f"Working Directory: {os.getcwd()}")
    
    # Check for required modules
    modules_to_check = ['pypdf', 'docx', 'pdfplumber', 'pdftotext', 'docx2txt', 'python-pptx']
    for module in modules_to_check:
        try:
            __import__(module.split('.')[0])
            env_info.append(f"Module {module}: Available")
        except ImportError:
            env_info.append(f"Module {module}: Not installed")
    
    return "\n".join(env_info)

def ensure_directory_exists(dir_path: str) -> None:
    """Ensure a directory exists, creating it if necessary."""
    if not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
        print(f"Created directory: {dir_path}")
    return

def get_file_extension(file_path: str) -> str:
    """Get the lowercase extension of a file."""
    return os.path.splitext(file_path)[1].lower()

def get_file_name(file_path: str) -> str:
    """Get the filename without path."""
    return os.path.basename(file_path) 