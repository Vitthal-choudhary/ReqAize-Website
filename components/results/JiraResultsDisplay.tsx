'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { generateJiraItemsForDemo, JiraDemoResult, JiraItem } from '@/utils/mistralJiraGenerator';

interface JiraResultsDisplayProps {
  extractedText: string;
}

export default function JiraResultsDisplay({ extractedText }: JiraResultsDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JiraDemoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [jiraProjects, setJiraProjects] = useState<{id: string, key: string, name: string}[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isJiraAuthenticated, setIsJiraAuthenticated] = useState(false);
  const [isSendingToJira, setIsSendingToJira] = useState(false);
  const [jiraSendResult, setJiraSendResult] = useState<{success: boolean, message: string} | null>(null);

  // Check JIRA authentication status when component mounts
  useEffect(() => {
    checkJiraAuth();
  }, []);

  // Generate JIRA items when component mounts if extractedText is available
  useEffect(() => {
    if (extractedText) {
      generateJiraItems();
    }
  }, [extractedText]);

  // Fetch JIRA projects when authentication status changes
  useEffect(() => {
    if (isJiraAuthenticated) {
      fetchJiraProjects();
    }
  }, [isJiraAuthenticated]);

  // Check if user is authenticated with JIRA
  const checkJiraAuth = async () => {
    try {
      const response = await fetch('/api/jira/auth-data');
      const data = await response.json();
      
      setIsJiraAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error('Error checking JIRA auth:', error);
      setIsJiraAuthenticated(false);
    }
  };

  // Fetch JIRA projects
  const fetchJiraProjects = async () => {
    try {
      // First, get the cloud ID
      const authResponse = await fetch('/api/jira/auth-data');
      const authData = await authResponse.json();
      
      if (!authData.isAuthenticated || !authData.accessToken || !authData.cloudId) {
        return;
      }
      
      // Get the list of projects
      const projectsResponse = await fetch(`/api/jira/projects?cloudId=${authData.cloudId}`, {
        headers: {
          'Authorization': `Bearer ${authData.accessToken}`
        }
      });
      
      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch JIRA projects');
      }
      
      const projectsData = await projectsResponse.json();
      setJiraProjects(projectsData);
    } catch (error) {
      console.error('Error fetching JIRA projects:', error);
    }
  };

  const generateJiraItems = async () => {
    if (!extractedText || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const demoResult = await generateJiraItemsForDemo(extractedText);
      setResult(demoResult);
    } catch (err) {
      console.error('Error generating JIRA items:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadStructuredData = () => {
    if (!result) return;
    
    // Create a blob with the JSON data
    const jsonString = JSON.stringify(result.structuredItems, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link and click it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jira-items-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  const downloadRawData = () => {
    if (!result) return;
    
    // Create a blob with the JSON data
    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link and click it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jira-full-result-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  const sendToJira = async () => {
    if (!result || !selectedProject || isSendingToJira) return;
    
    setIsSendingToJira(true);
    setJiraSendResult(null);
    setError(null);
    
    try {
      const response = await fetch('/api/jira/create-issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectKey: selectedProject,
          items: result.structuredItems
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create JIRA issues');
      }
      
      setJiraSendResult({
        success: true,
        message: data.message
      });
    } catch (err) {
      console.error('Error sending to JIRA:', err);
      setJiraSendResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to create JIRA issues'
      });
    } finally {
      setIsSendingToJira(false);
    }
  };
  
  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProject(event.target.value);
  };
  
  const connectToJira = () => {
    window.location.href = '/api/jira/auth';
  };
  
  const tryAgain = () => {
    generateJiraItems();
  };

  // Organize items by type and hierarchy
  const getHierarchicalItems = () => {
    if (!result || !result.structuredItems.length) return null;
    
    // Get all epics (top level items)
    const epics = result.structuredItems.filter(item => item.type === 'Epic');
    
    // For each epic, get its stories
    const hierarchicalItems = epics.map(epic => {
      const stories = result.structuredItems.filter(
        item => item.type === 'Story' && item.parent === epic.summary
      );
      
      // For each story, get its tasks
      const storiesWithTasks = stories.map(story => {
        const tasks = result.structuredItems.filter(
          item => item.type === 'Task' && item.parent === story.summary
        );
        
        // For each task, get its subtasks
        const tasksWithSubtasks = tasks.map(task => {
          const subtasks = result.structuredItems.filter(
            item => item.type === 'Sub-task' && item.parent === task.summary
          );
          
          return { ...task, subtasks };
        });
        
        return { ...story, tasks: tasksWithSubtasks };
      });
      
      return { ...epic, stories: storiesWithTasks };
    });
    
    return hierarchicalItems;
  };
  
  // Get counts for the statistics
  const getCountsByType = () => {
    if (!result || !result.structuredItems.length) return {};
    
    return {
      epics: result.structuredItems.filter(item => item.type === 'Epic').length,
      stories: result.structuredItems.filter(item => item.type === 'Story').length,
      tasks: result.structuredItems.filter(item => item.type === 'Task').length,
      subtasks: result.structuredItems.filter(item => item.type === 'Sub-task').length,
      total: result.structuredItems.length
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <h3 className="text-lg font-medium text-white">Generating JIRA Items...</h3>
        <p className="text-muted-foreground mt-2">
          Analyzing requirements and creating structured JIRA items...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-red-500">
        <p>Error generating JIRA items: {error}</p>
        <Button variant="default" className="mt-4" onClick={tryAgain}>Try Again</Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No JIRA items generated yet.</p>
        <Button variant="default" className="mt-4" onClick={generateJiraItems}>Generate JIRA Items</Button>
      </div>
    );
  }

  // Get the organized items and counts
  const hierarchicalItems = getHierarchicalItems();
  const counts = getCountsByType();

  return (
    <div className="flex flex-col h-full">
      {/* Success Header */}
      <div className="text-center mb-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-3">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white">JIRA Items Generated!</h2>
        <p className="text-muted-foreground mt-1">
          Successfully created {result.structuredItems.length} JIRA items from your requirements
        </p>
        
        {/* Item statistics */}
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          <div className="px-3 py-1 bg-blue-600/20 rounded-full text-xs">
            {counts.epics} Epics
          </div>
          <div className="px-3 py-1 bg-green-600/20 rounded-full text-xs">
            {counts.stories} Stories
          </div>
          <div className="px-3 py-1 bg-yellow-600/20 rounded-full text-xs">
            {counts.tasks} Tasks
          </div>
          <div className="px-3 py-1 bg-purple-600/20 rounded-full text-xs">
            {counts.subtasks} Sub-tasks
          </div>
        </div>
      </div>
      
      {/* JIRA Integration Section */}
      <div className="bg-gray-800 rounded-md p-4 mb-4">
        <h3 className="text-sm font-semibold mb-3">Send to JIRA</h3>
        
        {!isJiraAuthenticated ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Connect to JIRA to import these items directly into your JIRA project.
            </p>
            <Button variant="default" size="sm" onClick={connectToJira}>
              Connect to JIRA
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-full">
                <label htmlFor="project-select" className="text-xs text-muted-foreground mb-1 block">
                  Select JIRA Project
                </label>
                <select 
                  id="project-select"
                  value={selectedProject}
                  onChange={handleProjectChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isSendingToJira || jiraProjects.length === 0}
                >
                  <option value="">Select a project</option>
                  {jiraProjects.map(project => (
                    <option key={project.id} value={project.key}>
                      {project.name} ({project.key})
                    </option>
                  ))}
                </select>
              </div>
              <Button 
                variant="default" 
                size="sm" 
                className="self-end"
                disabled={!selectedProject || isSendingToJira}
                onClick={sendToJira}
              >
                {isSendingToJira ? 'Sending...' : 'Send to JIRA'}
              </Button>
            </div>
            
            {jiraSendResult && (
              <div className={`text-sm p-2 rounded-md ${jiraSendResult.success ? 'bg-green-800/30 text-green-400' : 'bg-red-800/30 text-red-400'}`}>
                {jiraSendResult.message}
              </div>
            )}
            
            {jiraProjects.length === 0 && !isSendingToJira && (
              <p className="text-xs text-amber-400">
                No JIRA projects found. Make sure you have access to at least one project.
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* JIRA Items Display - Hierarchical View */}
      {hierarchicalItems && hierarchicalItems.length > 0 && (
        <div className="flex-grow overflow-auto mb-4 border border-gray-800 rounded-md">
          <div className="p-4 space-y-4">
            {hierarchicalItems.map((epic, epicIndex) => (
              <div key={epicIndex} className="border-l-4 border-blue-600 pl-4 py-2">
                <div className="flex items-center">
                  <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full mr-2">Epic</span>
                  <h3 className="font-semibold">{epic.summary}</h3>
                </div>
                
                {showAll && (
                  <p className="text-sm text-muted-foreground mt-1 mb-2">{epic.description}</p>
                )}
                
                {epic.stories && epic.stories.length > 0 && (
                  <div className="mt-3 ml-4 space-y-3">
                    {epic.stories.map((story, storyIndex) => (
                      <div key={storyIndex} className="border-l-4 border-green-600 pl-4 py-2">
                        <div className="flex items-center">
                          <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full mr-2">Story</span>
                          <h4 className="font-medium text-sm">{story.summary}</h4>
                        </div>
                        
                        {showAll && (
                          <p className="text-xs text-muted-foreground mt-1 mb-2">{story.description}</p>
                        )}
                        
                        {story.tasks && story.tasks.length > 0 && (
                          <div className="mt-2 ml-4 space-y-2">
                            {story.tasks.map((task, taskIndex) => (
                              <div key={taskIndex} className="border-l-4 border-yellow-600 pl-4 py-2">
                                <div className="flex items-center">
                                  <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded-full mr-2">Task</span>
                                  <h5 className="text-sm">{task.summary}</h5>
                                </div>
                                
                                {showAll && (
                                  <p className="text-xs text-muted-foreground mt-1 mb-2">{task.description}</p>
                                )}
                                
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <div className="mt-2 ml-4 space-y-2">
                                    {task.subtasks.map((subtask, subtaskIndex) => (
                                      <div key={subtaskIndex} className="border-l-4 border-purple-600 pl-4 py-1">
                                        <div className="flex items-center">
                                          <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full mr-2">Sub-task</span>
                                          <h6 className="text-xs">{subtask.summary}</h6>
                                        </div>
                                        
                                        {showAll && (
                                          <p className="text-xs text-muted-foreground mt-1">{subtask.description}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "Show More Details"}
            </Button>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-between mt-auto">
        <Button variant="outline" className="flex-1 mr-2" onClick={downloadStructuredData}>
          Download Structured Data
        </Button>
        <Button variant="outline" className="flex-1 mx-2" onClick={downloadRawData}>
          Download Raw Data
        </Button>
        <Button variant="default" className="flex-1 ml-2" onClick={tryAgain}>
          Try Again
        </Button>
      </div>
    </div>
  );
} 