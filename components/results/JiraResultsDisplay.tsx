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

  // Generate JIRA items when component mounts if extractedText is available
  useEffect(() => {
    if (extractedText) {
      generateJiraItems();
    }
  }, [extractedText]);

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
      
      {/* JIRA Items Display - Hierarchical View */}
      {hierarchicalItems && (
        <div className="bg-slate-800 border border-slate-700 rounded-md overflow-auto flex-grow p-4 mb-4 max-h-[50vh]">
          <div className="space-y-6">
            {hierarchicalItems.map((epic, epicIndex) => (
              <div key={epicIndex} className="border-l-4 border-blue-600 pl-4 py-1">
                {/* Epic */}
                <div className="border border-slate-700 rounded-md p-3 bg-slate-800 hover:bg-slate-700 transition-colors mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        Epic
                      </span>
                      {epic.priority && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          epic.priority === 'Highest' ? 'bg-red-100 text-red-800' :
                          epic.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          epic.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          epic.priority === 'Low' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {epic.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-white font-medium text-base mb-2">{epic.summary}</h3>
                  <p className="text-slate-300 text-sm">{epic.description}</p>
                  
                  {epic.labels && epic.labels.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {epic.labels.map((label, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Stories under this Epic */}
                <div className="ml-4 space-y-4">
                  {epic.stories && epic.stories.map((story, storyIndex) => (
                    <div key={storyIndex} className="border-l-4 border-green-600 pl-4 py-1">
                      {/* Story */}
                      <div className="border border-slate-700 rounded-md p-3 bg-slate-800 hover:bg-slate-700 transition-colors mb-2">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                              Story
                            </span>
                            {story.priority && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                story.priority === 'Highest' ? 'bg-red-100 text-red-800' :
                                story.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                story.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                story.priority === 'Low' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {story.priority}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-white font-medium text-sm mb-2">{story.summary}</h3>
                        <p className="text-slate-300 text-xs">{showAll ? story.description : `${story.description.slice(0, 100)}${story.description.length > 100 ? '...' : ''}`}</p>
                        
                        {story.labels && story.labels.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {story.labels.map((label, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Tasks under this Story - Only show if showAll or if we have less than 5 stories */}
                      {(showAll || epic.stories.length < 5) && story.tasks && (
                        <div className="ml-4 space-y-3">
                          {story.tasks.map((task, taskIndex) => (
                            <div key={taskIndex} className="border-l-4 border-yellow-500 pl-4 py-1">
                              {/* Task */}
                              <div className="border border-slate-700 rounded-md p-2 bg-slate-800 hover:bg-slate-700 transition-colors mb-2">
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                                      Task
                                    </span>
                                    {task.priority && (
                                      <span className={`inline-flex items-center px-2 py-0 rounded-full text-xs font-medium ${
                                        task.priority === 'Highest' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                        task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        task.priority === 'Low' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                        {task.priority}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                
                                <h3 className="text-white font-medium text-xs mb-1">{task.summary}</h3>
                                
                                {/* Only show subtasks count by default */}
                                {!showAll && task.subtasks && task.subtasks.length > 0 && (
                                  <div className="text-xs text-slate-400 mt-1">
                                    + {task.subtasks.length} subtasks
                                  </div>
                                )}
                                
                                {/* Subtasks under this Task - Only visible if showAll is true */}
                                {showAll && task.subtasks && task.subtasks.length > 0 && (
                                  <div className="ml-4 mt-2 space-y-2">
                                    {task.subtasks.map((subtask, subtaskIndex) => (
                                      <div key={subtaskIndex} className="border-l-4 border-purple-500 pl-2 py-1">
                                        <div className="flex items-center">
                                          <span className="inline-flex items-center px-1 py-0 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-1">
                                            Sub
                                          </span>
                                          <span className="text-xs text-white">{subtask.summary}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Show/Hide details button */}
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