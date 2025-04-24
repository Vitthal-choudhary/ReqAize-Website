"""
Document extractors package

This package contains modules for extracting text from various document formats,
including PDF, Word, and PowerPoint files.
"""

from .document_extractors import (
    extract_text_from_pdf,
    extract_text_from_word,
    extract_text_from_ppt
)

__all__ = [
    "extract_text_from_pdf",
    "extract_text_from_word",
    "extract_text_from_ppt"
] 