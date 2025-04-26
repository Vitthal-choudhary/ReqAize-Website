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
  const [authState, setAuthStateInternal] = useState<JiraAuthState>(() => {
    // Try to load from localStorage on client-side
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('jiraAuthState');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          // Check if token is expired
          if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
            localStorage.removeItem('jiraAuthState');
            return initialState;
          }
          return parsed;
        } catch (e) {
          return initialState;
        }
      }
    }
    return initialState;
  });

  useEffect(() => {
    if (authState.isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem('jiraAuthState', JSON.stringify(authState));
    }
  }, [authState]);

  useEffect(() => {
    const fetchCloudId = async () => {
      if (authState.isAuthenticated && authState.accessToken && !authState.cloudId) {
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
  }, [authState.isAuthenticated, authState.accessToken]);

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