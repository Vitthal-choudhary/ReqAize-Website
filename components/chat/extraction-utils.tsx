"use client";

import { Button } from "@/components/ui/button";
import { FileText, Download, MessageSquare } from "lucide-react";
import { useState } from "react";

export function ExtractionResults() {
  const [responsesData, setResponsesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/get-chat-responses');
      if (!response.ok) {
        throw new Error(`Failed to fetch responses: ${response.status}`);
      }
      
      const data = await response.json();
      setResponsesData(data.responses);
    } catch (err) {
      setError(`Error fetching chat responses: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    if (!responsesData) return;
    
    const dataStr = JSON.stringify(responsesData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_responses.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 border rounded-lg bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Chat Responses</h3>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchResults}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'View Responses'}
          </Button>
          
          {responsesData && (
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
      
      {responsesData && (
        <div className="border p-3 rounded-md bg-muted/50 max-h-[400px] overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap break-all">
            {JSON.stringify(responsesData, null, 2)}
          </pre>
        </div>
      )}
      
      {!responsesData && !loading && !error && (
        <div className="text-sm text-muted-foreground">
          Click "View Responses" to see the recent Mistral AI chat responses.
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-4">
        All Mistral AI chat responses are stored in a file until the chat is cleared:<br />
        <code className="bg-muted px-1 py-0.5 rounded text-xs">chat_responses.json</code>
      </p>
    </div>
  );
} 