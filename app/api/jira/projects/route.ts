import { NextRequest, NextResponse } from 'next/server';
import { fetchJiraProjects } from '@/lib/jira/api';

export async function GET(request: NextRequest) {
  try {
    // Get the cloud ID from query parameter
    const cloudId = request.nextUrl.searchParams.get('cloudId');
    
    if (!cloudId) {
      return NextResponse.json({ error: 'Missing cloud ID' }, { status: 400 });
    }
    
    // Get auth data from cookie
    const authDataCookie = request.cookies.get('jira_auth_data')?.value;
    
    if (!authDataCookie) {
      return NextResponse.json({ error: 'Not authenticated with JIRA' }, { status: 401 });
    }
    
    // Parse auth data
    const authData = JSON.parse(authDataCookie);
    
    // Check if the token is valid
    if (!authData.accessToken || (authData.expiresAt && authData.expiresAt < Date.now())) {
      return NextResponse.json({ error: 'JIRA session expired' }, { status: 401 });
    }
    
    // Fetch projects from JIRA API
    const projects = await fetchJiraProjects(authData.accessToken, cloudId);
    
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Error fetching JIRA projects:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch JIRA projects',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 