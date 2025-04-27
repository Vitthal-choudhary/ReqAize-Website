import { NextRequest, NextResponse } from 'next/server';
import { createJiraIssue, fetchJiraCloudId } from '@/lib/jira/api';
import { JiraItem } from '@/utils/mistralJiraGenerator';

export async function POST(request: NextRequest) {
  try {
    // Get auth data from cookie
    const authDataCookie = request.cookies.get('jira_auth_data')?.value;
    
    if (!authDataCookie) {
      return NextResponse.json(
        { error: 'Authentication required. Please connect to JIRA first.' }, 
        { status: 401 }
      );
    }
    
    // Parse auth data
    const authData = JSON.parse(authDataCookie);
    
    // Check if token is expired
    if (authData.expiresAt && authData.expiresAt < Date.now()) {
      return NextResponse.json(
        { error: 'JIRA session expired. Please reconnect to JIRA.' }, 
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { projectKey, items } = body;
    
    if (!projectKey) {
      return NextResponse.json(
        { error: 'Project key is required' }, 
        { status: 400 }
      );
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No JIRA items provided' }, 
        { status: 400 }
      );
    }
    
    // Ensure we have a cloud ID
    let cloudId = authData.cloudId;
    if (!cloudId) {
      cloudId = await fetchJiraCloudId(authData.accessToken);
      
      if (!cloudId) {
        return NextResponse.json(
          { error: 'Failed to retrieve JIRA cloud ID' }, 
          { status: 500 }
        );
      }
    }
    
    // Create issues in hierarchical order: Epics -> Stories -> Tasks -> Sub-tasks
    const createdIssues = {
      epics: [] as any[],
      stories: [] as any[],
      tasks: [] as any[],
      subtasks: [] as any[],
    };
    
    const issueMap = new Map<string, string>(); // Map original summary to created issue key
    
    // Process items by type to maintain hierarchy
    const epics = items.filter(item => item.type === 'Epic');
    const stories = items.filter(item => item.type === 'Story');
    const tasks = items.filter(item => item.type === 'Task');
    const subtasks = items.filter(item => item.type === 'Sub-task');
    
    // Create epics first
    for (const epic of epics) {
      try {
        const createdIssue = await createJiraIssue(
          authData.accessToken,
          cloudId,
          projectKey,
          {
            summary: epic.summary,
            description: epic.description,
            issueType: 'Epic',
            priority: epic.priority || 'Medium',
            labels: epic.labels || []
          }
        );
        
        createdIssues.epics.push(createdIssue);
        issueMap.set(epic.summary, createdIssue.key);
      } catch (error) {
        console.error(`Error creating epic "${epic.summary}":`, error);
      }
    }
    
    // Create stories next
    for (const story of stories) {
      try {
        // Find parent epic key if it exists
        let parentKey = undefined;
        if (story.parent && issueMap.has(story.parent)) {
          parentKey = issueMap.get(story.parent);
        }
        
        const createdIssue = await createJiraIssue(
          authData.accessToken,
          cloudId,
          projectKey,
          {
            summary: story.summary,
            description: story.description,
            issueType: 'Story',
            parentKey: parentKey,
            priority: story.priority || 'Medium',
            labels: story.labels || []
          }
        );
        
        createdIssues.stories.push(createdIssue);
        issueMap.set(story.summary, createdIssue.key);
      } catch (error) {
        console.error(`Error creating story "${story.summary}":`, error);
      }
    }
    
    // Create tasks
    for (const task of tasks) {
      try {
        // Find parent story/epic key if it exists
        let parentKey = undefined;
        if (task.parent && issueMap.has(task.parent)) {
          parentKey = issueMap.get(task.parent);
        }
        
        const createdIssue = await createJiraIssue(
          authData.accessToken,
          cloudId,
          projectKey,
          {
            summary: task.summary,
            description: task.description,
            issueType: 'Task',
            parentKey: parentKey,
            priority: task.priority || 'Medium',
            labels: task.labels || []
          }
        );
        
        createdIssues.tasks.push(createdIssue);
        issueMap.set(task.summary, createdIssue.key);
      } catch (error) {
        console.error(`Error creating task "${task.summary}":`, error);
      }
    }
    
    // Create sub-tasks last
    for (const subtask of subtasks) {
      try {
        // Find parent task key - required for subtasks
        if (subtask.parent && issueMap.has(subtask.parent)) {
          const parentKey = issueMap.get(subtask.parent);
          
          const createdIssue = await createJiraIssue(
            authData.accessToken,
            cloudId,
            projectKey,
            {
              summary: subtask.summary,
              description: subtask.description,
              issueType: 'Sub-task',
              parentKey: parentKey,
              priority: subtask.priority || 'Medium',
              labels: subtask.labels || []
            }
          );
          
          createdIssues.subtasks.push(createdIssue);
          issueMap.set(subtask.summary, createdIssue.key);
        }
      } catch (error) {
        console.error(`Error creating sub-task "${subtask.summary}":`, error);
      }
    }
    
    // Return success with created issues
    return NextResponse.json({
      success: true,
      message: `Created ${createdIssues.epics.length} epics, ${createdIssues.stories.length} stories, ${createdIssues.tasks.length} tasks, and ${createdIssues.subtasks.length} sub-tasks in JIRA project ${projectKey}`,
      createdIssues
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error creating JIRA issues:', error);
    return NextResponse.json({ 
      error: 'Failed to create JIRA issues', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 