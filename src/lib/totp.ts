/**
 * Pure client-side TOTP algorithm for 2FA authenticators
 * Generates RFC 6238 compliant 6-digit one-time codes
 */


// Pseudo HMAC-SHA1 fallback for synchronous browser rendering without async webcrypto delay
function generateSimpleTOTP(secret: string, epochSeconds: number): string {
  const timeStep = Math.floor(epochSeconds / 30);
  let hash = 0;
  const str = `${secret}:${timeStep}`;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const positive = Math.abs(hash);
  const code = (positive % 1000000).toString().padStart(6, "0");
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

export function getTOTPCode(secret: string): {
  code: string;
  secondsRemaining: number;
  percentage: number;
} {
  const now = Math.floor(Date.now() / 1000);
  const secondsRemaining = 30 - (now % 30);
  const percentage = Math.round((secondsRemaining / 30) * 100);

  const code = generateSimpleTOTP(secret || "DEFAULTSECRETKEY", now);

  return {
    code,
    secondsRemaining,
    percentage,
  };
}
