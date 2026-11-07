export type VaultItemType = "Login" | "Card" | "Identity" | "Secure note";

export type CustomFieldType = "text" | "hidden" | "boolean";

export type CustomField = {
  id: string;
  name: string;
  value: string;
  type: CustomFieldType;
};

export type UriMatch = "default" | "base-domain" | "exact" | "never";

export type UriEntry = {
  id: string;
  uri: string;
  match?: UriMatch;
};

export type CardDetails = {
  cardNumber?: string;
  cardholderName?: string;
  brand?: "Visa" | "Mastercard" | "Amex" | "Discover" | "Other";
  expMonth?: string;
  expYear?: string;
  cvv?: string;
};

export type IdentityDetails = {
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  username?: string;
  company?: string;
  ssn?: string;
  passportNumber?: string;
  licenseNumber?: string;
  email?: string;
  phone?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type PasswordHistoryEntry = {
  password: string;
  changedAt: string;
};

export type PasskeyCredential = {
  credentialId: string;
  rpId: string;
  userHandle?: string;
  createdAt: string;
  algorithm: "ES256" | "Ed25519" | "RS256";
  backedUp: boolean;
};

export type VaultAttachment = {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  dataUrl?: string;
};

export type EmergencyContactAccessType = "read-only" | "full-takeover";
export type EmergencyContactStatus = "active" | "pending" | "revoked";

export type EmergencyContact = {
  id: string;
  email: string;
  name: string;
  relation: string;
  accessType: EmergencyContactAccessType;
  waitingPeriodDays: number;
  status: EmergencyContactStatus;
  addedAt: string;
};

export type VaultItem = {
  id: number;
  name: string;
  username: string;
  password?: string;
  url?: string;
  uris?: UriEntry[];
  notes?: string;
  type: VaultItemType;
  color: string;
  updated: string;
  createdAt?: string;
  favorite?: boolean;
  folderId?: string;
  tags?: string[];
  cardDetails?: CardDetails;
  identityDetails?: IdentityDetails;
  customFields?: CustomField[];
  totpSecret?: string;
  isTrashed?: boolean;
  passwordHistory?: PasswordHistoryEntry[];
  passkey?: PasskeyCredential;
  attachments?: VaultAttachment[];
  passwordUpdatedAt?: string;
};

export type Folder = {
  id: string;
  name: string;
  scope: VaultScope;
};

export type VaultSend = {
  id: string;
  name: string;
  type: "text" | "file";
  text?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  maxAccessCount?: number;
  accessCount: number;
  expiresAt: string;
  createdAt: string;
  password?: string;
  notes?: string;
  disabled?: boolean;
};

export type MemberRole = "Owner" | "Admin" | "Member";
export type MemberStatus = "Active" | "Invited";

export type Member = {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  initials: string;
  joinedAt?: string;
  accessCount?: number;
};

export type VaultScope = "personal" | "organization";

export type ViewType =
  | "vault"
  | "send"
  | "generator"
  | "reports"
  | "members"
  | "tools"
  | "settings";

export type ThemeMode = "system" | "dark" | "light";

export type UiDensity = "comfortable" | "compact";

export type AccentColor = "blue" | "emerald" | "violet" | "rose";

export type FilterCategory = "all" | VaultItemType | "favorites" | "trash";

export type SortOption = "name" | "updated" | "type";

export type VaultSettings = {
  vaultTimeout: "immediate" | "1min" | "5min" | "15min" | "1hour" | "never";
  vaultTimeoutAction: "lock" | "logout";
  clearClipboardDelay: number; // in seconds, 0 = never
  biometricsEnabled: boolean;
  masterPasswordHint: string;
  density: UiDensity;
  accentColor: AccentColor;
  enablePrivacyBlur: boolean;
};

export type SecurityAuditResult = {
  overallScore: number;
  weakItems: VaultItem[];
  reusedItems: Array<{ password: string; count: number; items: VaultItem[] }>;
  unencryptedHttpItems: VaultItem[];
  inactive2faItems: VaultItem[];
  totpProtectedCount: number;
  totalLogins: number;
  healthyCount: number;
};

export type BreachCheckResult = {
  email: string;
  breaches: Array<{
    name: string;
    domain: string;
    breachDate: string;
    pwnCount: number;
    description: string;
    dataClasses: string[];
  }>;
};

export type MerkleAuditAction =
  | "ITEM_CREATED"
  | "ITEM_UPDATED"
  | "ITEM_DELETED"
  | "VAULT_LOCKED"
  | "VAULT_UNLOCKED"
  | "KEY_ROTATED"
  | "EXPORT_PERFORMED"
  | "INTEGRITY_VERIFIED";

export type MerkleAuditBlock = {
  index: number;
  timestamp: string;
  action: MerkleAuditAction;
  actor: string;
  itemHash: string;
  previousHash: string;
  blockHash: string;
  merkleRoot: string;
};

export type EmergencyKit = {
  accountName: string;
  email: string;
  secretKey: string;
  createdDate: string;
  cipher: string;
  kdf: string;
  iterations: number;
};

export type UserProfile = {
  name: string;
  email: string;
  role?: string;
  avatarColor?: string;
};

