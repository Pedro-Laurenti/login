import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/userService';
import { verifyJWT } from '@/lib/auth';

// Force Node.js runtime for this route
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Try to get token from cookie first, then from Authorization header
    let token = request.cookies.get('access_token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // First try to verify as access token (database token)
    let user = await UserService.verifyAccessToken(token);

    // If not found, try to verify as JWT token
    if (!user) {
      const jwtPayload = await verifyJWT(token);
      if (jwtPayload) {
        user = await UserService.getUserById(jwtPayload.userId);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Return user data (without sensitive information)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    return NextResponse.json({
      success: true,
      user: userData,
      authenticated: true
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // First try to verify as access token (database token)
    let user = await UserService.verifyAccessToken(token);

    // If not found, try to verify as JWT token
    if (!user) {
      const jwtPayload = await verifyJWT(token);
      if (jwtPayload) {
        user = await UserService.getUserById(jwtPayload.userId);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Return user data (without sensitive information)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    return NextResponse.json({
      success: true,
      user: userData,
      authenticated: true
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}