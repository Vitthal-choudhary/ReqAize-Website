import { useState, useEffect } from 'react';
import { useJira } from '@/lib/jira/context';
import { fetchJiraProjects, fetchJiraIssues } from '@/lib/jira/api';
import { JiraProject, JiraIssue, AtlassianDocument, AtlassianDocumentContent } from '@/lib/jira/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Helper function to convert Atlassian Document to plain text
const extractTextFromDocument = (doc: AtlassianDocument | AtlassianDocumentContent | string | undefined): string => {
  if (!doc) return '';
  
  if (typeof doc === 'string') return doc;
  
  // If it's an Atlassian Document or Content
  if (doc.content && Array.isArray(doc.content)) {
    return doc.content.map(content => {
      if (content.text) return content.text;
      return extractTextFromDocument(content);
    }).join(' ');
  }
  
  return '';
};

export default function JiraIntegration() {
  const { authState, setAuthState, logout } = useJira();
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch auth data from API on initial load
  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const response = await fetch('/api/jira/auth-data');
        const data = await response.json();
        
        if (data.isAuthenticated) {
          setAuthState({
            isAuthenticated: true,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresAt: data.expiresAt,
          });
        }
      } catch (error) {
        console.error('Error fetching auth data:', error);
      }
    };

    fetchAuthData();
  }, [setAuthState]);

  // Fetch projects when authenticated
  useEffect(() => {
    const loadProjects = async () => {
      if (authState.isAuthenticated && authState.accessToken && authState.cloudId) {
        setIsLoading(true);
        setError(null);
        
        try {
          const projectsData = await fetchJiraProjects(authState.accessToken, authState.cloudId);
          setProjects(projectsData);
        } catch (error) {
          console.error('Error loading projects:', error);
          setError('Failed to load JIRA projects. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProjects();
  }, [authState.isAuthenticated, authState.accessToken, authState.cloudId]);

  // Fetch issues when a project is selected
  useEffect(() => {
    const loadIssues = async () => {
      if (
        authState.isAuthenticated && 
        authState.accessToken && 
        authState.cloudId && 
        authState.selectedProjectId
      ) {
        setIsLoading(true);
        setError(null);
        
        try {
          const selectedProject = projects.find(p => p.id === authState.selectedProjectId);
          
          if (selectedProject) {
            const issuesData = await fetchJiraIssues(
              authState.accessToken, 
              authState.cloudId, 
              selectedProject.key
            );
            setIssues(issuesData);
          }
        } catch (error) {
          console.error('Error loading issues:', error);
          setError('Failed to load JIRA issues. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadIssues();
  }, [authState.selectedProjectId, authState.accessToken, authState.cloudId, authState.isAuthenticated, projects]);

  const handleProjectChange = (projectId: string) => {
    setAuthState({ selectedProjectId: projectId });
  };

  const handleLogin = () => {
    window.location.href = '/api/jira/auth';
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      // Call logout API endpoint to clear server-side cookies
      const response = await fetch('/api/jira/logout');
      if (!response.ok) {
        console.error('Failed to logout from JIRA API');
      }
      
      // Clear client-side state
      logout();
      setProjects([]);
      setIssues([]);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JIRA Integration</CardTitle>
          <CardDescription>
            Connect to your JIRA account to view and manage your projects and issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!authState.isAuthenticated ? (
            <Button onClick={handleLogin}>
              Connect to JIRA
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Connected to JIRA</h3>
                <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
                  {isLoading ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </div>
              
              {projects.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Project</label>
                  <Select 
                    value={authState.selectedProjectId} 
                    onValueChange={handleProjectChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {isLoading && <p className="text-sm">Loading...</p>}
              
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {authState.isAuthenticated && authState.selectedProjectId && issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Issues
              {projects.find(p => p.id === authState.selectedProjectId)?.name && 
                ` - ${projects.find(p => p.id === authState.selectedProjectId)?.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {issues.map(issue => (
                <div key={issue.id} className="p-4 border rounded-md">
                  <div className="flex justify-between">
                    <div className="font-medium">{issue.key}</div>
                    {issue.fields.status && (
                      <div className="text-sm px-2 py-1 rounded-full bg-gray-100">
                        {issue.fields.status.name}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mt-2">
                    {issue.fields.summary}
                  </h3>
                  {issue.fields.description && (
                    <p className="text-sm mt-2 line-clamp-2">
                      {extractTextFromDocument(issue.fields.description)}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div>
                      {issue.fields.issuetype?.name && (
                        <span className="mr-3">{issue.fields.issuetype.name}</span>
                      )}
                      {issue.fields.priority?.name && (
                        <span>Priority: {issue.fields.priority.name}</span>
                      )}
                    </div>
                    {issue.fields.assignee && (
                      <div>{issue.fields.assignee.displayName}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 