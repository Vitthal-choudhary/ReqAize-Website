'use client';

import { useState, useEffect } from 'react';
import { useJira } from '@/lib/jira/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interface for debug info
interface JiraDebugInfo {
  authData: {
    isAuthenticated: boolean;
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    expiresAt: string;
    isExpired: boolean;
  };
  clientState: {
    isAuthenticated: boolean;
    hasAccessToken: boolean;
    hasCloudId: boolean;
    cloudId: string;
    selectedProjectId: string;
  };
  resources?: {
    error?: string;
    [key: string]: any;
  }[];
  cloudIdError?: string;
  projects?: {
    count?: number;
    names?: string[];
    error?: string;
  };
}

export default function JiraDebug() {
  const { authState } = useJira();
  const [debugInfo, setDebugInfo] = useState<JiraDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fetchDebugInfo = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Get auth data
      const authResponse = await fetch('/api/jira/auth-data');
      const authData = await authResponse.json();
      
      // Create debug info object
      const info: JiraDebugInfo = {
        authData: {
          isAuthenticated: authData.isAuthenticated,
          hasAccessToken: !!authData.accessToken,
          hasRefreshToken: !!authData.refreshToken,
          expiresAt: authData.expiresAt ? new Date(authData.expiresAt).toLocaleString() : 'Not set',
          isExpired: authData.expiresAt && authData.expiresAt < Date.now(),
        },
        clientState: {
          isAuthenticated: authState.isAuthenticated,
          hasAccessToken: !!authState.accessToken,
          hasCloudId: !!authState.cloudId,
          cloudId: authState.cloudId || 'Not set',
          selectedProjectId: authState.selectedProjectId || 'None'
        }
      };
      
      // If authenticated, try to fetch cloud ID and resources
      if (authData.isAuthenticated && authData.accessToken) {
        try {
          const cloudIdResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
            headers: { 
              'Authorization': `Bearer ${authData.accessToken}`,
              'Accept': 'application/json'
            }
          });
          
          if (cloudIdResponse.ok) {
            const resourcesData = await cloudIdResponse.json();
            info.resources = resourcesData;
            
            // If we have resources, try to fetch projects
            if (resourcesData && resourcesData.length > 0) {
              const cloudId = resourcesData[0].id;
              try {
                const projectsResponse = await fetch(
                  `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/search`,
                  {
                    headers: { 
                      'Authorization': `Bearer ${authData.accessToken}`,
                      'Accept': 'application/json'
                    }
                  }
                );
                
                if (projectsResponse.ok) {
                  const projectsData = await projectsResponse.json();
                  info.projects = {
                    count: projectsData.values ? projectsData.values.length : 0,
                    names: projectsData.values ? projectsData.values.map((p: any) => p.name) : []
                  };
                } else {
                  info.projects = {
                    error: `Failed to fetch projects: ${projectsResponse.status} ${projectsResponse.statusText}`
                  };
                }
              } catch (error) {
                info.projects = { error: 'Error fetching projects' };
              }
            }
          } else {
            info.resources = [{ 
              error: `Failed to fetch resources: ${cloudIdResponse.status} ${cloudIdResponse.statusText}`
            }];
          }
        } catch (error) {
          info.cloudIdError = 'Error fetching cloud ID';
        }
      }
      
      setDebugInfo(info);
    } catch (error) {
      console.error('Error fetching debug info:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="mt-4 bg-gray-800 text-white">
      <CardHeader>
        <CardTitle className="text-lg flex justify-between">
          <span>JIRA Debug Information</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDebugInfo} 
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Info'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasError && (
          <div className="p-4 bg-red-900/30 rounded border border-red-700 mb-4">
            Failed to fetch debug information
          </div>
        )}
        
        {!debugInfo && !isLoading && !hasError && (
          <div className="text-center py-4">
            <Button onClick={fetchDebugInfo}>Fetch Debug Info</Button>
          </div>
        )}
        
        {debugInfo && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-bold mb-2">Server Auth State:</h3>
              <pre className="bg-gray-900 p-3 rounded overflow-auto">
                {JSON.stringify(debugInfo.authData, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Client Auth State:</h3>
              <pre className="bg-gray-900 p-3 rounded overflow-auto">
                {JSON.stringify(debugInfo.clientState, null, 2)}
              </pre>
            </div>
            
            {debugInfo.resources && (
              <div>
                <h3 className="font-bold mb-2">JIRA Resources:</h3>
                <pre className="bg-gray-900 p-3 rounded overflow-auto">
                  {JSON.stringify(debugInfo.resources, null, 2)}
                </pre>
              </div>
            )}
            
            {debugInfo.projects && (
              <div>
                <h3 className="font-bold mb-2">JIRA Projects:</h3>
                <pre className="bg-gray-900 p-3 rounded overflow-auto">
                  {JSON.stringify(debugInfo.projects, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="p-4 bg-yellow-900/30 rounded border border-yellow-700">
              <h3 className="font-bold mb-2">Troubleshooting:</h3>
              <ul className="list-disc list-inside space-y-1">
                {!debugInfo.authData.isAuthenticated && (
                  <li>Not authenticated with JIRA. Try connecting again.</li>
                )}
                {debugInfo.authData.isExpired && (
                  <li>Your JIRA token has expired. Please reconnect.</li>
                )}
                {!debugInfo.clientState.hasCloudId && (
                  <li>Missing Cloud ID. This is required to connect to your JIRA instance.</li>
                )}
                {debugInfo.resources && debugInfo.resources[0]?.error && (
                  <li>Error accessing JIRA resources: {debugInfo.resources[0].error}</li>
                )}
                {debugInfo.projects && debugInfo.projects.error && (
                  <li>Error fetching projects: {debugInfo.projects.error}</li>
                )}
                {debugInfo.projects && debugInfo.projects.count === 0 && (
                  <li>No projects found in your JIRA account. Make sure you have access to at least one project.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 