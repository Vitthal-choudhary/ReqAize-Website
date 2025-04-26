'use client';

import JiraIntegration from '@/components/jira/JiraIntegration';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function JiraIntegrationPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-6">JIRA Integration</h1>
        <p className="mb-8 text-gray-600">
          Connect your JIRA account to manage projects and issues directly within ReQAize.
        </p>
        
        <JiraIntegration />
      </div>
      <Footer />
    </main>
  );
} 