import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authDataCookie = request.cookies.get('jira_auth_data')?.value;
    
    if (!authDataCookie) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }
    
    try {
      const authData = JSON.parse(authDataCookie);
      
      // Check if the token is expired
      if (authData.expiresAt && authData.expiresAt < Date.now()) {
        // TODO: Implement token refresh using the refresh token
        const response = NextResponse.json({ isAuthenticated: false }, { status: 200 });
        
        // Clear the expired auth data
        response.cookies.set('jira_auth_data', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 0,
          path: '/',
        });
        
        return response;
      }
      
      return NextResponse.json({ 
        isAuthenticated: true,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        expiresAt: authData.expiresAt,
      }, { status: 200 });
    } catch (error) {
      console.error('Error parsing auth data:', error);
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }
  } catch (error) {
    console.error('Error retrieving auth data:', error);
    return NextResponse.json({ error: 'Failed to retrieve auth data' }, { status: 500 });
  }
} 