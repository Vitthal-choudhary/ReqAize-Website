import { ExtractionResults } from "@/components/chat/extraction-utils";

export default function ExtractionDemoPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Text Extraction Results</h1>
      
      <div className="mb-6">
        <p className="text-muted-foreground mb-4">
          This page allows you to view and download the most recent text extraction results.
          The extracted text is stored in the <code className="bg-muted px-1 py-0.5 rounded">extraction_results.json</code> file
          in the project root directory.
        </p>
        
        <p className="text-muted-foreground mb-4">
          You can upload files through the chatbot to extract text from them.
          The extracted text will then be stored in this file.
        </p>
      </div>
      
      <ExtractionResults />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">How Text Extraction Works</h2>
        
        <div className="space-y-2">
          <p>The text extraction process follows these steps:</p>
          
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>Files are uploaded through the chatbot interface</li>
            <li>The files are temporarily saved to the <code className="bg-muted px-1 py-0.5 rounded">uploads</code> directory</li>
            <li>Our extraction script processes each file based on its type</li>
            <li>For Word documents, we use python-docx or docx2txt libraries</li>
            <li>For PDFs, we use PyPDF, pdfplumber, or pdftotext</li>
            <li>For PowerPoint files, we use python-pptx</li>
            <li>The extracted text is saved to <code className="bg-muted px-1 py-0.5 rounded">extraction_results.json</code></li>
            <li>The chatbot displays the extracted text and provides analysis</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 