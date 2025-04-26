import { NextRequest, NextResponse } from 'next/server';

// Replace with your own credentials from Atlassian Developer Console
const JIRA_CLIENT_ID = process.env.JIRA_CLIENT_ID || '';
const JIRA_CLIENT_SECRET = process.env.JIRA_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.JIRA_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/jira/callback`;

// Generate a random state for CSRF protection
const generateState = () => {
  return Math.random().toString(36).substring(2, 15);
};

export async function GET(request: NextRequest) {
  try {
    const state = generateState();
    console.log('Generated state:', state);
    
    // Store state in a cookie for verification during callback
    const stateExpiry = new Date();
    stateExpiry.setMinutes(stateExpiry.getMinutes() + 10); // 10-minute expiry
    
    // Create the authorization URL
    const authUrl = new URL('https://auth.atlassian.com/authorize');
    authUrl.searchParams.set('audience', 'api.atlassian.com');
    authUrl.searchParams.set('client_id', JIRA_CLIENT_ID);
    authUrl.searchParams.set('scope', 'read:jira-user read:jira-work write:jira-work offline_access');
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('prompt', 'consent');
    
    console.log('Auth URL:', authUrl.toString());
    console.log('Redirect URI:', REDIRECT_URI);
    
    const response = NextResponse.redirect(authUrl.toString());
    
    // Set the state in a cookie
    response.cookies.set('jira_auth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: stateExpiry,
      path: '/',
      sameSite: 'lax', // Helps with cross-site cookie issues
    });
    
    return response;
  } catch (error) {
    console.error('Error initiating JIRA auth:', error);
    return NextResponse.json({ error: 'Failed to initiate JIRA authentication' }, { status: 500 });
  }
} 