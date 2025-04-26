import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function JiraSuccessPage() {
  // In a client component we would use useEffect to load the auth data
  // Since Next.js pages are server components by default, we'll redirect to home

  return redirect('/');
  
  // The code below would be used if we make this a client component with 'use client'
  /*
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const response = await fetch('/api/jira/auth-data');
        const data = await response.json();
        
        if (data.isAuthenticated) {
          // Set the auth data in our context or state management
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      }
    };
    
    loadAuthData();
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <h1 className="text-2xl font-bold">Successfully connected to JIRA!</h1>
      <p>You can now access your JIRA projects and issues.</p>
      <Button asChild>
        <Link href="/">Go to Dashboard</Link>
      </Button>
    </div>
  );
  */
} 