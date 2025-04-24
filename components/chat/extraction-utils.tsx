"use client";

import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useState } from "react";

export function ExtractionResults() {
  const [resultsData, setResultsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/get-extraction-results');
      if (!response.ok) {
        throw new Error(`Failed to fetch results: ${response.status}`);
      }
      
      const data = await response.json();
      setResultsData(data.results);
    } catch (err) {
      setError(`Error fetching extraction results: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    if (!resultsData) return;
    
    const dataStr = JSON.stringify(resultsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extraction_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 border rounded-lg bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Extraction Results</h3>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchResults}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'View Results'}
          </Button>
          
          {resultsData && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadResults}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-red-500 mb-2">
          {error}
        </div>
      )}
      
      {resultsData && (
        <div className="border p-3 rounded-md bg-muted/50 max-h-[400px] overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap break-all">
            {JSON.stringify(resultsData, null, 2)}
          </pre>
        </div>
      )}
      
      {!resultsData && !loading && !error && (
        <div className="text-sm text-muted-foreground">
          Click "View Results" to see the most recent text extraction results.
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-4">
        The extraction_results.json file is stored in the project root directory:<br />
        <code className="bg-muted px-1 py-0.5 rounded text-xs">extraction_results.json</code>
      </p>
    </div>
  );
} 