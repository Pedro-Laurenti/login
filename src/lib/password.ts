/**
 * Password hashing utility using SHA-256
 * For production, consider using bcrypt for better security
 */

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  
  // Convert ArrayBuffer to hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  
  return hashHex;
}

export async function verifyPassword(inputPassword: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashPassword(inputPassword);
  return inputHash === storedHash;
}

// Console utility to generate password hashes
if (typeof window === "undefined") {
  // Only run in Node.js environment
  const args = process.argv.slice(2);
  if (args.length > 0 && args[0] === "--generate") {
    const password = args[1];
    if (password) {
      hashPassword(password).then(hash => {
        console.log(`Password: ${password}`);
        console.log(`Hash: ${hash}`);
      });
    } else {
      console.log("Usage: node -e \"require('./src/lib/password').hashPassword('your_password').then(console.log)\"");
    }
  }
}
