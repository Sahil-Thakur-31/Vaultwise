export interface PasswordOptions {
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  avoidAmbiguous?: boolean;
  minNumbers?: number;
  minSymbols?: number;
}

const UPPERCASE_ALL = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
const UPPERCASE_NO_AMBIGUOUS = "ABCDEFGHJKMNPQRSTUVWXYZ"; // removed I, O
const LOWERCASE_ALL = "abcdefghijkmnopqrstuvwxyz";
const LOWERCASE_NO_AMBIGUOUS = "abcdefghijkmnopqrstuvwxyz"; // removed l
const NUMBERS_ALL = "0123456789";
const NUMBERS_NO_AMBIGUOUS = "23456789"; // removed 0, 1
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export function generatePassword(length: number, options: PasswordOptions = {}): string {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    avoidAmbiguous = true,
    minNumbers = 1,
    minSymbols = 1,
  } = options;

  const upperPool = avoidAmbiguous ? UPPERCASE_NO_AMBIGUOUS : UPPERCASE_ALL;
  const lowerPool = avoidAmbiguous ? LOWERCASE_NO_AMBIGUOUS : LOWERCASE_ALL;
  const numberPool = avoidAmbiguous ? NUMBERS_NO_AMBIGUOUS : NUMBERS_ALL;
  const symbolPool = SYMBOLS;

  let totalPool = "";
  if (uppercase) totalPool += upperPool;
  if (lowercase) totalPool += lowerPool;
  if (numbers) totalPool += numberPool;
  if (symbols) totalPool += symbolPool;

  if (!totalPool) {
    totalPool = lowerPool + numberPool;
  }

  const lengthClamped = Math.max(8, Math.min(64, length));
  const chars: string[] = [];

  // Guarantee minimum numbers and symbols if requested
  if (numbers && minNumbers > 0) {
    for (let i = 0; i < minNumbers; i++) {
      chars.push(numberPool[Math.floor(Math.random() * numberPool.length)]);
    }
  }
  if (symbols && minSymbols > 0) {
    for (let i = 0; i < minSymbols; i++) {
      chars.push(symbolPool[Math.floor(Math.random() * symbolPool.length)]);
    }
  }

  // Fill remaining characters
  while (chars.length < lengthClamped) {
    chars.push(totalPool[Math.floor(Math.random() * totalPool.length)]);
  }

  // Shuffle using Fisher-Yates
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

export function getCrackTimeEstimate(password: string): {
  entropy: number;
  timeEstimate: string;
  strengthLabel: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
} {
  if (!password) {
    return { entropy: 0, timeEstimate: "Instantly", strengthLabel: "Very Weak", color: "text-rose-500" };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const entropy = Math.round(password.length * Math.log2(Math.max(2, poolSize)));

  let timeEstimate = "Instantly";
  let strengthLabel: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong" = "Very Weak";
  let color = "text-rose-500";

  if (entropy < 30) {
    timeEstimate = "A few seconds";
    strengthLabel = "Very Weak";
    color = "text-rose-500";
  } else if (entropy < 45) {
    timeEstimate = "3 to 5 hours";
    strengthLabel = "Weak";
    color = "text-amber-500";
  } else if (entropy < 65) {
    timeEstimate = "12 to 18 months";
    strengthLabel = "Fair";
    color = "text-yellow-500";
  } else if (entropy < 85) {
    timeEstimate = "1,400 years";
    strengthLabel = "Strong";
    color = "text-blue-500";
  } else {
    timeEstimate = "Centuries (Uncrackable)";
    strengthLabel = "Very Strong";
    color = "text-emerald-500";
  }

  return { entropy, timeEstimate, strengthLabel, color };
}
