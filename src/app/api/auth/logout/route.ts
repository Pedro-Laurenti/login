import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/userService';

// Force Node.js runtime for this route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('access_token')?.value;

    if (accessToken) {
      // Revoke the access token
      await UserService.revokeAccessToken(accessToken);
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the access token cookie
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Logout from all devices
export async function DELETE(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('access_token')?.value;

    if (accessToken) {
      // First verify the token to get user ID
      const user = await UserService.verifyAccessToken(accessToken);
      
      if (user) {
        // Revoke all tokens for this user
        await UserService.revokeAllUserTokens(user.id);
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });

    // Clear the access token cookie
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout all error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}