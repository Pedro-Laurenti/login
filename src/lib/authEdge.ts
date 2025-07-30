// Edge Runtime compatible authentication utilities
// These functions work in the middleware environment

// Simple JWT token validation for Edge Runtime
export function isValidJWTFormat(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Try to parse the header and payload
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    // Basic checks
    return !!(header.alg && payload.exp && payload.iat);
  } catch {
    return false;
  }
}

// Check if JWT token is expired (Edge Runtime compatible)
export function isJWTExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp;
    
    if (!exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return now >= exp;
  } catch {
    return true;
  }
}

// Extract user ID from JWT token (Edge Runtime compatible)
export function extractUserIdFromJWT(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
}

// Simple access token format validation
export function isValidAccessTokenFormat(token: string): boolean {
  // Access tokens should be hex strings of specific length
  return /^[a-f0-9]{64,128}$/i.test(token);
}

// Determine if user is likely authenticated based on token presence and format
export function isLikelyAuthenticated(token: string | undefined): boolean {
  if (!token) return false;
  
  // Check if it's a valid JWT format and not expired
  if (isValidJWTFormat(token)) {
    return !isJWTExpired(token);
  }
  
  // Check if it's a valid access token format
  if (isValidAccessTokenFormat(token)) {
    return true;
  }
  
  return false;
}
