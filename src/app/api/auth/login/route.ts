import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/userService';
import { verifyPassword, createJWT } from '@/lib/auth';
import { isValidEmail } from '@/lib/auth';
import { checkRateLimit, getClientIP, getUserAgent, sanitizeInput } from '@/lib/utils';

// Force Node.js runtime for this route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email);

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`login:${clientIP}`, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      );
    }

    // Get user with password hash
    const user = await UserService.getUserWithPassword(sanitizedEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const jwtToken = await createJWT({
      userId: user.id,
      email: user.email
    });

    // Create access token for session management
    const userAgent = getUserAgent(request);
    const accessToken = await UserService.createAccessToken(
      user.id,
      userAgent,
      clientIP
    );

    // Prepare user data (without password hash)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    // Create response
    const response = NextResponse.json({
      success: true,
      user: userData,
      token: jwtToken
    });

    // Set secure HTTP-only cookie with access token
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}