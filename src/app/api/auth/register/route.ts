import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/userService';
import { isValidEmail, isValidPassword, createJWT } from '@/lib/auth';
import { config, checkRateLimit, getClientIP, getUserAgent, sanitizeInput } from '@/lib/utils';

// Force Node.js runtime for this route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check if registration is enabled
    if (!config.features.enableRegistration) {
      return NextResponse.json(
        { error: 'Registration is currently disabled' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    // Input validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email);
    const trimmedName = name.trim();

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`register:${clientIP}`, 3, 60 * 60 * 1000); // 3 attempts per hour

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many registration attempts. Please try again later.',
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      );
    }

    // Create user
    const user = await UserService.createUser({
      email: sanitizedEmail,
      password,
      name: trimmedName
    });

    // Create email verification token
    const verificationToken = await UserService.createEmailVerificationToken(user.id);

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

    // Prepare user data
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
      token: jwtToken,
      message: 'User created successfully. Please check your email for verification.',
      verification_token: verificationToken // In production, this should be sent via email
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
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
