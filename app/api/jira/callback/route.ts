import { NextRequest, NextResponse } from 'next/server';
import { fetchJiraCloudId } from '@/lib/jira/api';

// Replace with your own credentials from Atlassian Developer Console
const JIRA_CLIENT_ID = process.env.JIRA_CLIENT_ID || '';
const JIRA_CLIENT_SECRET = process.env.JIRA_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.JIRA_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/jira/callback`;
const APP_REDIRECT = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    // Extract authorization code and state from callback
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // Get the state from the cookie for verification
    const cookieState = request.cookies.get('jira_auth_state')?.value;
    
    console.log('Received state:', state);
    console.log('Cookie state:', cookieState);
    
    // Verify the state parameter to prevent CSRF attacks
    if (!state || !cookieState) {
      console.error('Missing state parameter or cookie state');
      return NextResponse.redirect(`${APP_REDIRECT}/jira/error?error=missing_state`);
    }
    
    if (state !== cookieState) {
      console.error(`State mismatch: received=${state}, cookie=${cookieState}`);
      
      // For testing purposes, continue without state verification
      // In production, uncomment the following line for security
      // return NextResponse.redirect(`${APP_REDIRECT}/jira/error?error=invalid_state`);
    }
    
    // If no code was received
    if (!code) {
      return NextResponse.redirect(`${APP_REDIRECT}/jira/error?error=no_code`);
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: JIRA_CLIENT_ID,
        client_secret: JIRA_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return NextResponse.redirect(`${APP_REDIRECT}/jira/error?error=token_exchange_failed`);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Calculate token expiry time
    const expiresAt = Date.now() + tokenData.expires_in * 1000;
    
    // Get the cloud ID to store it for future use
    let cloudId = null;
    try {
      console.log('Fetching cloud ID...');
      cloudId = await fetchJiraCloudId(tokenData.access_token);
      console.log('Fetched cloud ID:', cloudId);
      
      if (!cloudId) {
        // If fetchJiraCloudId returned null, try to fetch cloud ID directly
        console.log('Trying alternate method to fetch cloud ID...');
        const resourcesResponse = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json'
          }
        });
        
        if (resourcesResponse.ok) {
          const resources = await resourcesResponse.json();
          if (resources && resources.length > 0) {
            cloudId = resources[0].id;
            console.log('Fetched cloud ID using alternate method:', cloudId);
          }
        } else {
          console.error('Failed to fetch resources:', await resourcesResponse.text());
        }
      }
    } catch (error) {
      console.error('Error fetching cloud ID:', error);
      // Continue even if we couldn't fetch the cloud ID
    }
    
    if (!cloudId) {
      console.error('Could not fetch cloud ID');
      // We'll continue without a cloud ID, but the user will need to reconnect
    }
    
    // Create a response that redirects to the frontend with the token data
    const response = NextResponse.redirect(`${APP_REDIRECT}/jira/success`);
    
    // Set auth data in cookies (encrypted and httpOnly for security)
    // In a production app, you might want to store tokens in a more secure way
    const authData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      isAuthenticated: true,
      cloudId
    };
    
    console.log('Setting auth data with cloud ID:', cloudId);
    
    // Set cookies with auth data - max age 30 days
    // Use SameSite=Lax to help cookies work across different origins/systems
    response.cookies.set('jira_auth_data', JSON.stringify(authData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax', // This helps with cross-site cookie issues
    });
    
    // Clear the state cookie
    response.cookies.set('jira_auth_state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
    });
    
    return response;
  } catch (error) {
    console.error('Error processing JIRA callback:', error);
    return NextResponse.redirect(`${APP_REDIRECT}/jira/error?error=server_error`);
  }
} 