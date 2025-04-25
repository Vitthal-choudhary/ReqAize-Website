import { ExtractionResults } from "@/components/chat/extraction-utils";

export default function ExtractionDemoPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Chat Responses</h1>
      
      <div className="mb-6">
        <p className="text-muted-foreground mb-4">
          This page allows you to view and download the recent Mistral AI chat responses.
          The chat responses are stored in the <code className="bg-muted px-1 py-0.5 rounded">chat_responses.json</code> file
          in the project root directory until the chat is cleared.
        </p>
        
        <p className="text-muted-foreground mb-4">
          You can interact with the chatbot to generate responses and they will be stored in this file.
          Clearing the chat will clear this file as well.
        </p>
      </div>
      
      <ExtractionResults />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">How Response Storage Works</h2>
        
        <div className="space-y-2">
          <p>The chat response storage process follows these steps:</p>
          
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>You interact with the Mistral AI chatbot</li>
            <li>When the AI generates a response, it's displayed in the chat</li>
            <li>The response is also saved to the <code className="bg-muted px-1 py-0.5 rounded">chat_responses.json</code> file</li>
            <li>Each response includes the content and a timestamp</li>
            <li>Responses are stored until you click the "Clear chat" button</li>
            <li>Clearing the chat empties both the chat window and the responses file</li>
            <li>You can view and download all responses from this page</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 