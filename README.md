# ReqAI - AI-Powered Requirement Engineering System

## Overview
ReqAI is an AI-powered requirements engineering system that helps developers and project managers extract, organize, and prioritize requirements from various document formats. The system leverages advanced AI techniques to automate the tedious process of requirement analysis.

## Features
- **Document Text Extraction**: Extract text from various formats (PDF, Word, PowerPoint)
- **AI-Powered Chatbot**: Interact with an AI assistant for requirements engineering
- **Requirement Organization**: Categorize and prioritize requirements automatically
- **Document Generation**: Generate formal requirement documents from extracted information

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── extraction-demo/  # Extraction demo page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
│
├── backend/              # Python backend code
│   ├── extractors/       # Document extraction modules
│   │   ├── document_extractors.py  # Text extraction implementations
│   │   └── __init__.py
│   ├── utils/            # Utility functions
│   │   ├── system_utils.py  # System and file utilities
│   │   └── __init__.py
│   ├── text_extraction.py  # Main text extraction module
│   └── __init__.py
│
├── components/           # React components
│   ├── chat/             # Chat-related components
│   │   ├── chatbot.tsx         # Main chatbot component
│   │   ├── chatbot-preview.tsx # Chatbot preview component
│   │   └── extraction-utils.tsx # Extraction utility component
│   ├── layout/           # Layout components
│   │   ├── footer.tsx    # Footer component
│   │   ├── navbar.tsx    # Navigation bar
│   │   ├── theme-provider.tsx # Theme provider
│   │   └── mode-toggle.tsx    # Dark/light mode toggle
│   ├── sections/         # Page section components
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   └── ...
│   └── ui/               # UI components (shadcn/ui)
│
└── lib/                  # Utility libraries
    └── utils.ts          # Utility functions
```

## Technology Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python, FastAPI
- **AI/ML**: Mistral AI
- **Document Processing**: PyPDF, python-docx, pdfplumber, python-pptx

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/reqai.git
cd reqai
```

2. Install frontend dependencies
```bash
npm install
# or
yarn install
```

3. Install backend dependencies
```bash
pip install -r requirements.txt
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

## Usage
1. Open your browser and navigate to http://localhost:3000
2. Upload documents using the document upload section
3. Interact with the AI chatbot to extract and organize requirements
4. Download the extracted requirements in JSON format

## License
[MIT](LICENSE) 