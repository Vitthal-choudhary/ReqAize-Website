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