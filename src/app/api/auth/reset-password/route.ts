import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/userService';
import { isValidPassword } from '@/lib/auth';
import { config, checkRateLimit, getClientIP } from '@/lib/utils';

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
    const { token, newPassword } = body;

    // Input validation
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Password does not meet requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`reset-password:${clientIP}`, 5, 60 * 60 * 1000); // 5 attempts per hour

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many password reset attempts. Please try again later.',
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      );
    }

    // Verify reset token
    const userId = await UserService.verifyPasswordResetToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Update password
    await UserService.updatePassword(userId, newPassword);

    // Mark token as used
    await UserService.usePasswordResetToken(token);

    // Revoke all existing access tokens for security
    await UserService.revokeAllUserTokens(userId);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
