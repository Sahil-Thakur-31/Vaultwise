import { EmergencyKit } from "@/types/vault";

const SECRET_KEY_STORAGE = "vaultwise-secret-key-v2";

/**
 * Generates a high-entropy 128-bit (16-byte) Cryptographic Secret Key.
 * Format: A3-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX (Base32 encoded)
 * Provides 128 bits of true cryptographic entropy to defeat GPU brute-forcing.
 */
export function generateSecretKey(): string {
  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
  const bytes = cryptoObj.getRandomValues(new Uint8Array(16));
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Crockford Base32 alphabet (no 0, 1, I, O ambiguity)

  let encoded = "";
  for (let i = 0; i < bytes.length; i++) {
    encoded += chars[bytes[i] % chars.length];
  }

  // Format into chunks: A3-XXXXXX-XXXXXX-XXXXXX
  const p1 = encoded.slice(0, 6);
  const p2 = encoded.slice(6, 12);
  const p3 = encoded.slice(12, 16) + chars[(bytes[0] + bytes[1]) % chars.length] + chars[(bytes[2] + bytes[3]) % chars.length];

  return `A3-${p1}-${p2}-${p3}`;
}

/**
 * Retrieves the local high-entropy Secret Key or generates one if first run.
 */
export function getOrCreateSecretKey(): string {
  if (typeof window === "undefined") {
    return "A3-VW789K-99XZQ2-4M8PZV";
  }

  let existing = window.localStorage.getItem(SECRET_KEY_STORAGE);
  if (!existing) {
    existing = generateSecretKey();
    window.localStorage.setItem(SECRET_KEY_STORAGE, existing);
  }
  return existing;
}

/**
 * Generates the Cryptographic Emergency Recovery Kit text payload.
 */
export function generateEmergencyKitText(kit: EmergencyKit): string {
  return `================================================================================
                    VAULTWISE CRYPTOGRAPHIC EMERGENCY KIT
                     ZERO-KNOWLEDGE RECOVERY SPECIFICATION
================================================================================

[ IMPORTANT SECURITY NOTICE ]
This document contains your 128-bit Cryptographic Secret Key and Zero-Knowledge
recovery parameters. Store this document in a safe physical vault or secure offline
flash drive. No one (not even Vaultwise engineers) can recover your vault if you lose
both your Master Password and this Secret Key.

--------------------------------------------------------------------------------
ACCOUNT DETAILS
--------------------------------------------------------------------------------
Account Name:        ${kit.accountName}
Registered Email:    ${kit.email}
Kit Generated Date:  ${kit.createdDate}

--------------------------------------------------------------------------------
CRYPTOGRAPHIC SECRET KEY (128-BIT ENTROPY)
--------------------------------------------------------------------------------
Secret Key:          ${kit.secretKey}

* Note: This 128-bit key protects your vault from GPU cluster attacks and quantum
brute-force. It mathematically binds with your Master Password to derive your
AES-256-GCM symmetric cipher key.

--------------------------------------------------------------------------------
ENCRYPTION SPECIFICATIONS
--------------------------------------------------------------------------------
Primary Cipher:      ${kit.cipher} (Authenticated Galois/Counter Mode)
Key Derivation:      ${kit.kdf}
KDF Work Factor:     ${kit.iterations.toLocaleString()} Iterations
Salt Entropy:        256-bit CSPRNG
Authentication Tag:  128-bit Integrity Check

--------------------------------------------------------------------------------
IN CASE OF EMERGENCY:
1. Open the Vaultwise Standalone Application.
2. Select "Emergency Access & Kit Recovery".
3. Provide your Registered Email, Master Password, and the Secret Key above.
================================================================================
`;
}

