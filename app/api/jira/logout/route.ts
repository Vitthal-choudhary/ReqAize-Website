import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Create a response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Successfully logged out from JIRA' 
    });
    
    // Clear the auth data cookie
    response.cookies.set('jira_auth_data', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
    });
    
    // Also clear the state cookie if it exists
    response.cookies.set('jira_auth_state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error logging out from JIRA:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to logout from JIRA' 
    }, { status: 500 });
  }
} 