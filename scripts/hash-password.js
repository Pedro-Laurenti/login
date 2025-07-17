#!/usr/bin/env node
/**
 * Password Hash Generator Utility
 * Usage: node scripts/hash-password.js <password>
 */

const crypto = require('crypto');

async function hashPassword(password) {
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

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/hash-password.js <password>');
  console.log('Example: node scripts/hash-password.js mypassword123');
  process.exit(1);
}

hashPassword(password).then(hash => {
  console.log(`Password: ${password}`);
  console.log(`SHA-256 Hash: ${hash}`);
  console.log('\nUse this hash in your SQL INSERT statement:');
  console.log(`INSERT INTO users (name, email, password_hash, role) VALUES ('User Name', 'user@example.com', '${hash}', 'user');`);
}).catch(err => {
  console.error('Error generating hash:', err);
});
