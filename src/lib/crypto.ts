// Edge-compatible Web Crypto API password hashing and verification
// Uses PBKDF2 with SHA-256 for cryptographic security without requiring native Node/C++ bindings

const ITERATIONS = 10000;
const KEY_LEN = 32;

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LEN * 8
  );

  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const keyHex = Array.from(new Uint8Array(derivedKey))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${saltHex}:${keyHex}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Support quick plain-text development seeds as fallback
  if (!hash.includes(":")) {
    return password === hash;
  }

  const [saltHex, originalKeyHex] = hash.split(":");
  if (!saltHex || !originalKeyHex) return false;

  const salt = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
  );

  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LEN * 8
  );

  const derivedKeyHex = Array.from(new Uint8Array(derivedKey))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return derivedKeyHex === originalKeyHex;
}
