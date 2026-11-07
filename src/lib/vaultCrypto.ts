/**
 * Vaultwise Cryptographic Enclave
 * Zero-Knowledge Client-Side AES-256-GCM + PBKDF2-SHA256 (600,000 iterations)
 * 
 * Cryptographic Specifications:
 * - Cipher: AES-256-GCM (Galois/Counter Mode, 256-bit symmetric key, authenticated encryption)
 * - Key Derivation Function (KDF): PBKDF2 with SHA-256, 600,000 iterations (OWASP 2024+ benchmark)
 * - Salt: Cryptographically secure pseudo-random 32 bytes (256-bit) via Web Crypto CSPRNG
 * - IV: Fresh cryptographically secure pseudo-random 12 bytes (96-bit) per encryption operation
 * - Integrity: Built-in 128-bit authentication tag verification on every decryption
 */

export interface EncryptedEnvelope {
  version: 2;
  cipher: "AES-GCM-256";
  kdf: "PBKDF2-SHA256";
  iterations: 600000;
  iv: string; // Base64
  ciphertext: string; // Base64 (includes 128-bit GCM auth tag)
  updatedAt: string;
}

export interface MasterVerifierEnvelope {
  version: 2;
  salt: string; // Base64 (32 bytes)
  iv: string; // Base64 (12 bytes)
  ciphertext: string; // Base64 (Encrypted challenge token)
  iterations: 600000;
}

const MASTER_CHALLENGE_STRING = "VAULTWISE_ZERO_KNOWLEDGE_AUTHENTICATION_CHALLENGE_V2";

// Helper: Convert ArrayBuffer / Uint8Array to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: Convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from a user's master passphrase
 * using PBKDF2 with SHA-256 and 600,000 iterations.
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
  const subtle = cryptoObj.subtle;

  // Import passphrase as raw key material
  const rawKeyMaterial = await subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Derive 256-bit AES-GCM key
  return await subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 600000,
      hash: "SHA-256",
    },
    rawKeyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // Non-extractable for memory protection
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts arbitrary serializable data using AES-256-GCM with a fresh random 12-byte IV.
 */
export async function encryptData<T>(
  data: T,
  key: CryptoKey
): Promise<EncryptedEnvelope> {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
  const subtle = cryptoObj.subtle;

  // Generate fresh 12-byte initialization vector
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(JSON.stringify(data));

  const ciphertextBuffer = await subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encodedData as BufferSource
  );

  return {
    version: 2,
    cipher: "AES-GCM-256",
    kdf: "PBKDF2-SHA256",
    iterations: 600000,
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBuffer),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Decrypts an EncryptedEnvelope using AES-256-GCM.
 * Throws an error if the key is incorrect or ciphertext has been tampered with.
 */
export async function decryptData<T>(
  envelope: EncryptedEnvelope,
  key: CryptoKey
): Promise<T> {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
  const subtle = cryptoObj.subtle;

  const iv = base64ToBuffer(envelope.iv);
  const ciphertext = base64ToBuffer(envelope.ciphertext);

  const decryptedBuffer = await subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );

  const decodedJson = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decodedJson) as T;
}

/**
 * Generates a master verifier challenge token envelope for a new passphrase.
 * Used to verify the master passphrase without storing the passphrase anywhere.
 */
export async function createMasterVerifier(
  passphrase: string
): Promise<{ verifier: MasterVerifierEnvelope; key: CryptoKey }> {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
  const salt = cryptoObj.getRandomValues(new Uint8Array(32)); // 256-bit random salt
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  const iv = cryptoObj.getRandomValues(new Uint8Array(12));
  const challengeBuffer = new TextEncoder().encode(MASTER_CHALLENGE_STRING);

  const ciphertextBuffer = await cryptoObj.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    challengeBuffer as BufferSource
  );

  const verifier: MasterVerifierEnvelope = {
    version: 2,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBuffer),
    iterations: 600000,
  };

  return { verifier, key };
}

/**
 * Attempts to unlock and derive the session CryptoKey from the provided passphrase.
 * Returns the active CryptoKey if valid, or null if incorrect/tampered.
 */
export async function verifyAndDeriveKey(
  passphrase: string,
  verifier: MasterVerifierEnvelope
): Promise<CryptoKey | null> {
  try {
    const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
    const salt = base64ToBuffer(verifier.salt);
    const key = await deriveKeyFromPassphrase(passphrase, salt);

    const iv = base64ToBuffer(verifier.iv);
    const ciphertext = base64ToBuffer(verifier.ciphertext);

    const decryptedBuffer = await cryptoObj.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ciphertext as BufferSource
    );

    const decryptedText = new TextDecoder().decode(decryptedBuffer);
    if (decryptedText === MASTER_CHALLENGE_STRING) {
      return key;
    }
    return null;
  } catch {
    // Cryptographic tag verification failure (wrong passphrase or tampered ciphertext)
    return null;
  }
}

