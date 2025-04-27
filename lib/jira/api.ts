import { JiraIssue, JiraProject } from './types';

const JIRA_API_BASE_URL = 'https://api.atlassian.com';

export const fetchJiraProjects = async (accessToken: string, cloudId: string): Promise<JiraProject[]> => {
  try {
    const response = await fetch(`${JIRA_API_BASE_URL}/ex/jira/${cloudId}/rest/api/3/project/search`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Error fetching JIRA projects:', error);
    throw error;
  }
};

export const fetchJiraIssues = async (
  accessToken: string, 
  cloudId: string, 
  projectKey: string
): Promise<JiraIssue[]> => {
  try {
    const jql = encodeURIComponent(`project = ${projectKey} ORDER BY updated DESC`);
    const response = await fetch(
      `${JIRA_API_BASE_URL}/ex/jira/${cloudId}/rest/api/3/search?jql=${jql}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.statusText}`);
    }

    const data = await response.json();
    return data.issues || [];
  } catch (error) {
    console.error('Error fetching JIRA issues:', error);
    throw error;
  }
};

export const fetchJiraCloudId = async (accessToken: string): Promise<string | null> => {
  try {
    const response = await fetch(`${JIRA_API_BASE_URL}/oauth/token/accessible-resources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cloud ID: ${response.statusText}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return data[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error fetching JIRA cloud ID:', error);
    throw error;
  }
};

// Create a JIRA issue using the Atlassian REST API
export const createJiraIssue = async (
  accessToken: string,
  cloudId: string,
  projectKey: string,
  issueData: {
    summary: string;
    description?: string;
    issueType: string; // 'Epic', 'Story', 'Task', 'Sub-task'
    parentKey?: string; // Required for sub-tasks and can be used for stories/tasks under epics
    priority?: string; // 'Highest', 'High', 'Medium', 'Low', 'Lowest'
    labels?: string[];
  }
): Promise<JiraIssue> => {
  try {
    // Create the request body for the JIRA API
    const body: any = {
      fields: {
        project: {
          key: projectKey
        },
        summary: issueData.summary,
        issuetype: {
          name: issueData.issueType
        }
      }
    };

    // Add description if provided
    if (issueData.description) {
      body.fields.description = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: issueData.description
              }
            ]
          }
        ]
      };
    }

    // Add priority if provided
    if (issueData.priority) {
      body.fields.priority = {
        name: issueData.priority
      };
    }

    // Add labels if provided
    if (issueData.labels && issueData.labels.length > 0) {
      body.fields.labels = issueData.labels;
    }

    // Add parent link for sub-tasks
    if (issueData.parentKey) {
      if (issueData.issueType === 'Sub-task') {
        body.fields.parent = {
          key: issueData.parentKey
        };
      } else {
        // For Stories and Tasks that are under Epics, use the Epic Link field
        // Note: The exact field name might vary based on JIRA configuration
        body.fields.customfield_10014 = issueData.parentKey; // Epic Link field
      }
    }

    // Make the API call to create the issue
    const response = await fetch(`${JIRA_API_BASE_URL}/ex/jira/${cloudId}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create issue: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Fetch the created issue to return complete data
    const createdIssue = await fetchIssueById(accessToken, cloudId, data.id);
    return createdIssue;
  } catch (error) {
    console.error('Error creating JIRA issue:', error);
    throw error;
  }
};

// Helper function to fetch a JIRA issue by ID
const fetchIssueById = async (
  accessToken: string,
  cloudId: string,
  issueId: string
): Promise<JiraIssue> => {
  try {
    const response = await fetch(
      `${JIRA_API_BASE_URL}/ex/jira/${cloudId}/rest/api/3/issue/${issueId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch issue: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching JIRA issue:', error);
    throw error;
  }
}; 