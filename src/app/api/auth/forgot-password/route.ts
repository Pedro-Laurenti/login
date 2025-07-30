import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/userService';
import { isValidEmail } from '@/lib/auth';
import { config, checkRateLimit, getClientIP, sanitizeInput } from '@/lib/utils';

// Force Node.js runtime for this route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check if password recovery is enabled
    if (!config.features.enablePasswordRecovery) {
      return NextResponse.json(
        { error: 'Password recovery is currently disabled' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Input validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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
    const rateLimit = checkRateLimit(`forgot-password:${clientIP}`, 3, 60 * 60 * 1000); // 3 attempts per hour

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many password reset attempts. Please try again later.',
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      );
    }

    // Check if user exists
    const user = await UserService.getUserByEmail(sanitizedEmail);

    // Always return success to prevent email enumeration
    // but only send email if user exists
    if (user) {
      const resetToken = await UserService.createPasswordResetToken(user.id);
      
      // In production, you would send this token via email
      // For now, we'll return it in the response (for testing only)
      console.log(`Password reset token for ${user.email}: ${resetToken}`);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
