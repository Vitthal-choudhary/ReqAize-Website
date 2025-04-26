'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JiraAuthState } from './types';
import { fetchJiraCloudId } from './api';

const initialState: JiraAuthState = {
  isAuthenticated: false,
};

type JiraContextType = {
  authState: JiraAuthState;
  setAuthState: (state: Partial<JiraAuthState>) => void;
  logout: () => void;
};

const JiraContext = createContext<JiraContextType | undefined>(undefined);

export const JiraProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with default state to prevent hydration errors
  const [authState, setAuthStateInternal] = useState<JiraAuthState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from localStorage only after the component mounts (client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('jiraAuthState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          // Check if token is expired
          if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
            localStorage.removeItem('jiraAuthState');
          } else {
            setAuthStateInternal(parsed);
          }
        } catch (e) {
          // If there's a parsing error, use initial state
          console.error("Error parsing saved JIRA state:", e);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && authState.isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem('jiraAuthState', JSON.stringify(authState));
    }
  }, [authState, isInitialized]);

  useEffect(() => {
    const fetchCloudId = async () => {
      if (isInitialized && authState.isAuthenticated && authState.accessToken && !authState.cloudId) {
        try {
          const cloudId = await fetchJiraCloudId(authState.accessToken);
          if (cloudId) {
            setAuthStateInternal(prev => ({ ...prev, cloudId }));
          }
        } catch (error) {
          console.error('Failed to fetch cloud ID:', error);
        }
      }
    };

    fetchCloudId();
  }, [authState.isAuthenticated, authState.accessToken, authState.cloudId, isInitialized]);

  const setAuthState = (newState: Partial<JiraAuthState>) => {
    setAuthStateInternal(prev => ({ ...prev, ...newState }));
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jiraAuthState');
    }
    setAuthStateInternal(initialState);
  };

  return (
    <JiraContext.Provider value={{ authState, setAuthState, logout }}>
      {children}
    </JiraContext.Provider>
  );
};

export const useJira = () => {
  const context = useContext(JiraContext);
  if (context === undefined) {
    throw new Error('useJira must be used within a JiraProvider');
  }
  return context;
}; 