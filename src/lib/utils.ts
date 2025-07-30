// Configuration utilities
export const config = {
  features: {
    enableRegistration: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true',
    enablePasswordRecovery: process.env.NEXT_PUBLIC_ENABLE_PASSWORD_RECOVERY === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  app: {
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  }
};

// Check if required environment variables are set
export function validateConfig(): { valid: boolean; missingVars: string[] } {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  return {
    valid: missingVars.length === 0,
    missingVars
  };
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remainingAttempts: number; resetTime: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    // First attempt or window has reset
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      resetTime: now + windowMs
    };
  }

  if (userLimit.count >= maxAttempts) {
    // Rate limit exceeded
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: userLimit.resetTime
    };
  }

  // Increment count
  userLimit.count++;
  rateLimitMap.set(identifier, userLimit);

  return {
    allowed: true,
    remainingAttempts: maxAttempts - userLimit.count,
    resetTime: userLimit.resetTime
  };
}

// Request validation helpers
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const headers = request.headers;
  
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-client-ip') ||
    'unknown'
  );
}

export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

// Sanitize input data
export function sanitizeInput(input: string): string {
  return input.trim().toLowerCase();
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
