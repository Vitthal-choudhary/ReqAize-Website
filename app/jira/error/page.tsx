'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const errorMessages = {
  invalid_state: 'Invalid state parameter. This could be a security concern.',
  no_code: 'No authorization code was received from JIRA.',
  token_exchange_failed: 'Failed to exchange the authorization code for an access token.',
  server_error: 'A server error occurred during the authentication process.',
};

export default function JiraErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('An unknown error occurred');
  
  useEffect(() => {
    const errorCode = searchParams.get('error') || 'server_error';
    setErrorMessage(errorMessages[errorCode as keyof typeof errorMessages] || 'An unknown error occurred');
  }, [searchParams]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <h1 className="text-2xl font-bold text-red-600">JIRA Authentication Failed</h1>
      <p className="max-w-md">{errorMessage}</p>
      <p className="text-sm text-gray-600">Please try again or contact support if the issue persists.</p>
      <Button asChild>
        <Link href="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
} 