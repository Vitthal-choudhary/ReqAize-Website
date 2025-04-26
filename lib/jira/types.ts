export interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrls?: Record<string, string>;
  simplified?: boolean;
}

// Atlassian Document Format types
export interface AtlassianDocumentContent {
  type: string;
  content?: AtlassianDocumentContent[];
  text?: string;
  attrs?: Record<string, any>;
  marks?: Array<{type: string; attrs?: Record<string, any>}>;
  [key: string]: any;
}

export interface AtlassianDocument {
  type: string;
  version: number;
  content?: AtlassianDocumentContent[];
  [key: string]: any;
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description?: string | AtlassianDocument;
    status?: {
      name: string;
      statusCategory?: {
        name: string;
        colorName: string;
      };
    };
    issuetype?: {
      name: string;
      iconUrl?: string;
    };
    priority?: {
      name: string;
      iconUrl?: string;
    };
    assignee?: {
      displayName: string;
      avatarUrls?: Record<string, string>;
    };
    created?: string;
    updated?: string;
    duedate?: string;
  };
}

export interface JiraAuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  cloudId?: string;
  selectedProjectId?: string;
} 