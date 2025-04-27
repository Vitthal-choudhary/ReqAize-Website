// Mistral JIRA Generator - All-in-one utility for generating JIRA items

// Types
export interface JiraItem {
  type: 'Epic' | 'Story' | 'Task' | 'Sub-task';
  summary: string;
  description: string;
  priority?: 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
  parent?: string; // Parent issue key for sub-tasks
  labels?: string[];
}

export interface JiraDemoResult {
  query: string;
  systemPrompt: string;
  mistralResponse: string;
  structuredItems: JiraItem[];
  processedAt: string;
  metadata: {
    modelUsed: string;
    tokensUsed?: number;
    processingTimeMs?: number;
  };
}

// Configuration - Replace with your actual API key
const MISTRAL_API_KEY = "0zjmsSJLjr0dvpgoN7l0ivkBCDQ5DgtL"; 
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

// Default system prompt for generating JIRA items
const DEFAULT_JIRA_SYSTEM_PROMPT = `You are an expert JIRA issue generator. Your task is to analyze requirements and break them down into a comprehensive hierarchy of well-structured JIRA issues.

Follow these rules:
1. Create a DIVERSE set of JIRA items - you MUST include MULTIPLE items of each type:
   - Multiple Epics (2-4) representing major features or objectives
   - Multiple Stories (5-10) under these Epics 
   - Multiple Tasks (6-12) that implement the Stories
   - Multiple Sub-tasks (8-15) that break down the Tasks further

2. Create a proper hierarchical structure:
   - Epics at the top level
   - Stories belong to specific Epics (set the parent field to the Epic's summary)
   - Tasks belong to specific Stories (set the parent field to the Story's summary)
   - Sub-tasks belong to specific Tasks (set the parent field to the Task's summary)

3. Ensure each item has:
   - A clear, concise summary
   - A detailed actionable description
   - Appropriate priority level (distribute priorities across High, Medium, and Low)
   - Relevant labels based on the item's domain/category

4. Format the output as a valid JSON array of objects with the following structure:
   [
     {
       "type": "Epic|Story|Task|Sub-task",
       "summary": "Brief summary of the issue",
       "description": "Detailed description",
       "priority": "Highest|High|Medium|Low|Lowest", 
       "parent": "Parent item's summary - required for Stories/Tasks/Sub-tasks",
       "labels": ["Technical", "Frontend", "Backend", "Database", "Integration", etc.]
     }
   ]

5. Make items specifically relevant to the domain in the requirements.
   - Use domain-specific terminology
   - Reference specific features/requirements from the input
   - Create realistic implementation steps
   - Include technical details where appropriate

Remember, good JIRA items should be:
- Specific and unambiguous
- Measurable (clear definition of done)
- Achievable and realistic
- Relevant to the project goals
- Time-bound when appropriate

I expect a comprehensive breakdown with at least 20 total items distributed across all item types.`;

/**
 * Generate JIRA items from requirements and return a structured result for demo display
 * 
 * @param requirementsText The requirements text to analyze
 * @param customSystemPrompt Optional custom system prompt
 * @returns A structured result object with all data needed for demo display
 */
export async function generateJiraItemsForDemo(
  requirementsText: string,
  customSystemPrompt?: string
): Promise<JiraDemoResult> {
  const startTime = Date.now();
  const systemPrompt = customSystemPrompt || DEFAULT_JIRA_SYSTEM_PROMPT;

  try {
    // Format messages for the API
    const messages = [
      { 
        role: "system", 
        content: systemPrompt
      },
      { 
        role: "user", 
        content: `Generate JIRA items based on these requirements: ${requirementsText}` 
      }
    ];
    
    // Call Mistral API
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-small",
        messages: messages,
        temperature: 0.3, // Lower temperature for more deterministic output
        top_p: 1,
        max_tokens: 2000 // Increased max tokens for longer responses
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${await response.text()}`);
    }
    
    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    const tokensUsed = data.usage?.total_tokens || 0;
    
    // Extract JSON from the response
    let parsedItems: JiraItem[] = [];
    try {
      // Look for JSON array pattern
      const startIdx = rawContent.indexOf('[');
      const endIdx = rawContent.lastIndexOf(']');
      
      if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
        const jsonString = rawContent.substring(startIdx, endIdx + 1);
        parsedItems = JSON.parse(jsonString);
      } else {
        // Attempt to parse the entire response as JSON
        parsedItems = JSON.parse(rawContent);
      }
      
      // Validate the parsed items
      if (!Array.isArray(parsedItems)) {
        parsedItems = [];
      }
    } catch (parseError) {
      console.error("Error parsing Mistral response to JSON:", parseError);
      throw new Error("Failed to parse Mistral response into valid JIRA items");
    }
    
    const endTime = Date.now();
    
    // Return a comprehensive result object for demo display
    return {
      query: requirementsText,
      systemPrompt: systemPrompt,
      mistralResponse: rawContent,
      structuredItems: parsedItems,
      processedAt: new Date().toISOString(),
      metadata: {
        modelUsed: "mistral-small",
        tokensUsed: tokensUsed,
        processingTimeMs: endTime - startTime
      }
    };
    
  } catch (error) {
    // Return a structured error response
    return {
      query: requirementsText,
      systemPrompt: systemPrompt,
      mistralResponse: error instanceof Error ? error.message : "Unknown error occurred",
      structuredItems: [],
      processedAt: new Date().toISOString(),
      metadata: {
        modelUsed: "mistral-small",
        processingTimeMs: Date.now() - startTime
      }
    };
  }
}

/**
 * Export a JiraDemoResult to JSON for easy saving or display
 */
export function exportDemoResultToJson(result: JiraDemoResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Get example requirements to use as sample input
 */
export function getExampleRequirements(): string {
  return `Create a user authentication system with the following requirements:
1. Users should be able to register with email and password
2. Implement password reset functionality via email
3. Add social login with Google and Facebook
4. Implement two-factor authentication
5. Add account lockout after 5 failed login attempts
6. Create admin dashboard to manage user accounts
7. Implement role-based access control with admin, editor, and viewer roles
8. Add user profile page with ability to update personal information
9. Implement session management with auto-logout after inactivity`;
}

/**
 * Parse a JiraDemoResult to get counts of each issue type
 */
export function getItemTypeCounts(result: JiraDemoResult): Record<string, number> {
  const counts: Record<string, number> = {
    'Epic': 0,
    'Story': 0,
    'Task': 0,
    'Sub-task': 0
  };
  
  result.structuredItems.forEach(item => {
    if (item.type in counts) {
      counts[item.type]++;
    }
  });
  
  return counts;
} 