import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/userService';
import { checkRateLimit, getClientIP } from '@/lib/utils';

// Force Node.js runtime for this route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Input validation
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`verify-email:${clientIP}`, 10, 60 * 60 * 1000); // 10 attempts per hour

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many verification attempts. Please try again later.',
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      );
    }

    // Verify email token
    const userId = await UserService.verifyEmailVerificationToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Mark email as verified
    await UserService.verifyUserEmail(userId);

    // Mark token as used
    await UserService.useEmailVerificationToken(token);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Resend verification email
export async function PUT(request: NextRequest) {
  try {
    // Get user from access token
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await UserService.verifyAccessToken(accessToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Check if email is already verified
    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`resend-verification:${user.id}`, 3, 60 * 60 * 1000); // 3 attempts per hour per user

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many verification email requests. Please try again later.',
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      );
    }

    // Create new verification token
    const verificationToken = await UserService.createEmailVerificationToken(user.id);

    // In production, this should be sent via email
    console.log(`Email verification token for ${user.email}: ${verificationToken}`);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      verification_token: verificationToken // For testing only
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
