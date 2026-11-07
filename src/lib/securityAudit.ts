import { BreachCheckResult, SecurityAuditResult, VaultItem } from "@/types/vault";
import { getCrackTimeEstimate } from "./crypto";

const SERVICES_KNOWN_FOR_2FA = [
  "github", "aws", "amazon", "google", "stripe", "slack", "discord", "figma",
  "linear", "notion", "cloudflare", "twitter", "x", "microsoft", "apple", "binance", "coinbase"
];

export function runSecurityAudit(items: VaultItem[]): SecurityAuditResult {
  const activeItems = items.filter((i) => !i.isTrashed);
  const loginItems = activeItems.filter((i) => i.type === "Login");

  const weakItems: VaultItem[] = [];
  const unencryptedHttpItems: VaultItem[] = [];
  const inactive2faItems: VaultItem[] = [];
  const passwordMap = new Map<string, VaultItem[]>();
  let totpCount = 0;

  for (const item of activeItems) {
    if (item.totpSecret) {
      totpCount++;
    }

    // Check Insecure HTTP
    if (item.url && item.url.toLowerCase().startsWith("http://")) {
      unencryptedHttpItems.push(item);
    }

    // Check Inactive 2FA on services that support it
    if (item.type === "Login" && !item.totpSecret) {
      const lowerName = item.name.toLowerCase();
      const lowerUrl = (item.url || "").toLowerCase();
      const isKnown2FA = SERVICES_KNOWN_FOR_2FA.some(
        (s) => lowerName.includes(s) || lowerUrl.includes(s)
      );
      if (isKnown2FA) {
        inactive2faItems.push(item);
      }
    }

    if (item.password) {
      const { strengthLabel } = getCrackTimeEstimate(item.password);
      if (strengthLabel === "Very Weak" || strengthLabel === "Weak") {
        weakItems.push(item);
      }

      // Track password reuse
      const existing = passwordMap.get(item.password) || [];
      existing.push(item);
      passwordMap.set(item.password, existing);
    }
  }

  const reusedItems: Array<{ password: string; count: number; items: VaultItem[] }> = [];
  passwordMap.forEach((vaultItems, password) => {
    if (vaultItems.length > 1) {
      reusedItems.push({
        password,
        count: vaultItems.length,
        items: vaultItems,
      });
    }
  });

  // Dynamic score calculation
  let deductions = 0;
  deductions += weakItems.length * 10;
  deductions += reusedItems.length * 12;
  deductions += unencryptedHttpItems.length * 8;
  deductions += inactive2faItems.length * 5;

  const overallScore = Math.max(20, Math.min(100, 100 - deductions));
  const healthyCount = Math.max(
    0,
    activeItems.length - weakItems.length - reusedItems.length - unencryptedHttpItems.length
  );

  return {
    overallScore,
    weakItems,
    reusedItems,
    unencryptedHttpItems,
    inactive2faItems,
    totpProtectedCount: totpCount,
    totalLogins: loginItems.length,
    healthyCount,
  };
}

export const MOCK_BREACH_DB: Record<string, BreachCheckResult["breaches"]> = {
  default: [
    {
      name: "Canva Design Platform",
      domain: "canva.com",
      breachDate: "May 2019",
      pwnCount: 137000000,
      description: "In May 2019, graphic design tool Canva suffered a data breach impacting 137 million subscribers.",
      dataClasses: ["Email addresses", "Names", "Passwords (salted bcrypt)", "Cities"],
    },
    {
      name: "LinkedIn Scraping & Credential Leak",
      domain: "linkedin.com",
      breachDate: "April 2021",
      pwnCount: 500000000,
      description: "An archive containing 500M user profiles was scraped and circulated on dark web forums.",
      dataClasses: ["Email addresses", "Full names", "Phone numbers", "Workplace details"],
    },
    {
      name: "Dropbox Cloud Storage",
      domain: "dropbox.com",
      breachDate: "August 2012",
      pwnCount: 68648009,
      description: "In mid-2012, Dropbox suffered a breach resulting in hashed passwords and email records leaked.",
      dataClasses: ["Email addresses", "Passwords (salted sha1)"],
    },
  ],
};

export function checkEmailBreaches(email: string): BreachCheckResult {
  const clean = email.trim().toLowerCase();
  // Return realistic breach matches for demo
  return {
    email: clean,
    breaches: MOCK_BREACH_DB.default,
  };
}
