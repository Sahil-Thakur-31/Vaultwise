"use client";

import { FormEvent, useState } from "react";
import { Fingerprint, FolderPlus, RefreshCw, Star, Trash2 } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Actions, Field } from "@/components/common/FormControls";
import {
  CardDetails,
  CustomField,
  Folder,
  IdentityDetails,
  PasskeyCredential,
  VaultItemType,
  VaultScope,
} from "@/types/vault";
import { generatePassword } from "@/lib/crypto";

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: VaultScope;
  folders?: Folder[];
  onSave: (item: {
    name: string;
    username: string;
    type: VaultItemType;
    password?: string;
    url?: string;
    notes?: string;
    favorite?: boolean;
    folderId?: string;
    tags?: string[];
    totpSecret?: string;
    cardDetails?: CardDetails;
    identityDetails?: IdentityDetails;
    customFields?: CustomField[];
    passkey?: PasskeyCredential;
  }) => void;
  initialType?: VaultItemType;
  initialPassword?: string;
  initialFolderId?: string;
  onCreateFolder?: (name: string) => Folder;
}

function NewItemModalInner({
  onClose,
  scope,
  folders = [],
  onSave,
  initialType = "Login",
  initialPassword,
  initialFolderId,
  onCreateFolder,
}: Omit<NewItemModalProps, "isOpen">) {
  const [type, setType] = useState<VaultItemType>(initialType);
  const [favorite, setFavorite] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>(initialFolderId || "");
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [inlineFolderName, setInlineFolderName] = useState("");

  // Login fields
  const [password, setPassword] = useState(initialPassword || "");
  const [totpSecret, setTotpSecret] = useState("");
  const [attachPasskey, setAttachPasskey] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [brand, setBrand] = useState<CardDetails["brand"]>("Visa");
  const [expMonth, setExpMonth] = useState("12");
  const [expYear, setExpYear] = useState("2028");
  const [cvv, setCvv] = useState("");

  // Identity fields
  const [identityTitle, setIdentityTitle] = useState("Mr.");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [identityUsername, setIdentityUsername] = useState("");
  const [company, setCompany] = useState("");
  const [ssn, setSsn] = useState("");
  const [passport, setPassport] = useState("");
  const [license, setLicense] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");

  // Custom Fields
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const handleGeneratePassword = () => {
    const generated = generatePassword(20, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      avoidAmbiguous: true,
    });
    setPassword(generated);
  };

  const handleAddCustomField = (fieldType: "text" | "hidden") => {
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      name: `Field ${customFields.length + 1}`,
      value: "",
      type: fieldType,
    };
    setCustomFields((prev) => [...prev, newField]);
  };

  const handleUpdateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim() || "Untitled Item";
    const notes = String(formData.get("notes") || "").trim();

    let computedUsername = "";
    let itemPassword: string | undefined = undefined;
    let url: string | undefined = undefined;
    let cardDetails: CardDetails | undefined = undefined;
    let identityDetails: IdentityDetails | undefined = undefined;

    if (type === "Login") {
      computedUsername = String(formData.get("username") || "").trim() || "No username";
      itemPassword = password.trim() || undefined;
      url = String(formData.get("url") || "").trim() || undefined;
    } else if (type === "Card") {
      const last4 = cardNumber.replace(/\s+/g, "").slice(-4);
      computedUsername = last4 ? `•••• ${last4}` : cardholderName || "Payment Card";
      itemPassword = cvv ? `CVV: ${cvv}` : undefined;
      cardDetails = {
        cardNumber: cardNumber.trim(),
        cardholderName: cardholderName.trim(),
        brand,
        expMonth,
        expYear,
        cvv: cvv.trim(),
      };
    } else if (type === "Identity") {
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      computedUsername = email || identityUsername || fullName || "Identity";
      identityDetails = {
        title: identityTitle,
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        username: identityUsername.trim() || undefined,
        company: company.trim() || undefined,
        ssn: ssn.trim() || undefined,
        passportNumber: passport.trim() || undefined,
        licenseNumber: license.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address1: address1.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: country.trim() || undefined,
      };
    } else {
      // Secure note
      computedUsername = String(formData.get("username") || "").trim() || "Encrypted Note";
      itemPassword = String(formData.get("password") || "").trim() || undefined;
    }

    let generatedPasskey: PasskeyCredential | undefined = undefined;
    if (attachPasskey && type === "Login") {
      let domain = "login.vaultwise.io";
      if (url) {
        try {
          domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
        } catch {
          domain = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
        }
      } else {
        domain = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
      }
      const randomBytes = new Uint8Array(12);
      if (typeof window !== "undefined" && window.crypto) {
        window.crypto.getRandomValues(randomBytes);
      }
      generatedPasskey = {
        credentialId: `cred_${Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("")}`,
        rpId: domain,
        userHandle: computedUsername,
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        algorithm: "ES256",
        backedUp: true,
      };
    }

    onSave({
      name,
      username: computedUsername,
      type,
      password: itemPassword,
      url,
      notes: notes || undefined,
      favorite,
      folderId: selectedFolder || undefined,
      tags: [type],
      totpSecret: type === "Login" && totpSecret.trim() ? totpSecret.trim() : undefined,
      cardDetails,
      identityDetails,
      customFields: customFields.length > 0 ? customFields : undefined,
      passkey: generatedPasskey,
    });
    onClose();
  };

  const scopeTitle = scope === "personal" ? "Personal Vault" : "Northstar Studio";

  return (
    <Modal title={`Add to ${scopeTitle}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto pr-1 space-y-4">
        {/* Title & Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Field label="Item Title" hint="e.g. AWS Production, Chase Sapphire, Personal ID">
              <input required name="name" placeholder="Name" autoFocus />
            </Field>
          </div>
          <div>
            <Field label="Type">
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as VaultItemType)}
              >
                <option value="Login">Login</option>
                <option value="Card">Payment Card</option>
                <option value="Identity">Identity</option>
                <option value="Secure note">Secure Note</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Folder Selection (Always visible for all item types) */}
        <Field label="Folder" hint="Assign to an organizational folder">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full rounded border border-[var(--border-subtle)] bg-[var(--input-bg)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="">(No Folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
            {onCreateFolder && (
              <button
                type="button"
                onClick={() => setIsCreatingNewFolder((prev) => !prev)}
                className="flex items-center gap-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-app)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500 transition cursor-pointer shrink-0"
                title="Create a new folder"
              >
                <FolderPlus className="size-3 text-blue-500" />
                <span>+ Folder</span>
              </button>
            )}
          </div>
          {isCreatingNewFolder && onCreateFolder && (
            <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-card)] border border-blue-500/30">
              <input
                type="text"
                autoFocus
                value={inlineFolderName}
                onChange={(e) => setInlineFolderName(e.target.value)}
                placeholder="New folder name..."
                className="flex-1 rounded border border-[var(--border-subtle)] bg-[var(--input-bg)] px-2.5 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (inlineFolderName.trim()) {
                      const created = onCreateFolder(inlineFolderName.trim());
                      setSelectedFolder(created.id);
                      setInlineFolderName("");
                      setIsCreatingNewFolder(false);
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (inlineFolderName.trim()) {
                    const created = onCreateFolder(inlineFolderName.trim());
                    setSelectedFolder(created.id);
                    setInlineFolderName("");
                    setIsCreatingNewFolder(false);
                  }
                }}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500 transition cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNewFolder(false);
                  setInlineFolderName("");
                }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </Field>

        {/* --- LOGIN SPECIFIC FIELDS --- */}
        {type === "Login" && (
          <div className="space-y-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3">
            <Field label="Username or Email">
              <input name="username" placeholder="name@domain.com or user handle" />
            </Field>

            <Field label="Password">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="font-mono flex-1"
                />
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] flex items-center gap-1.5 shrink-0"
                  title="Generate high-entropy password"
                >
                  <RefreshCw className="size-3" />
                  Generate
                </button>
              </div>
            </Field>

            <Field label="Website URL">
              <input name="url" placeholder="https://app.service.com" />
            </Field>

            <Field label="Authenticator Key (TOTP)" hint="Base32 secret for 2FA ticking code">
              <input
                type="text"
                value={totpSecret}
                onChange={(e) => setTotpSecret(e.target.value)}
                placeholder="e.g. JBSWY3DPEHPK3PXP"
                className="font-mono uppercase text-xs"
              />
            </Field>

            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="size-4 text-violet-500" />
                <div>
                  <span className="block text-xs font-semibold text-[var(--text-primary)]">
                    Register FIDO2 Passkey
                  </span>
                  <small className="text-[10px] text-[var(--text-muted)]">
                    Generates hardware-backed ES256 credentials for this domain
                  </small>
                </div>
              </div>
              <input
                type="checkbox"
                checked={attachPasskey}
                onChange={(e) => setAttachPasskey(e.target.checked)}
                className="size-4 rounded accent-violet-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* --- CARD SPECIFIC FIELDS --- */}
        {type === "Card" && (
          <div className="space-y-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3">
            <Field label="Cardholder Name">
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Full name on card"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Card Number">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4147 2038 9102 4892"
                  className="font-mono"
                />
              </Field>

              <Field label="Brand">
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value as CardDetails["brand"])}
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">American Express</option>
                  <option value="Discover">Discover</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Exp Month">
                <select value={expMonth} onChange={(e) => setExpMonth(e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = String(i + 1).padStart(2, "0");
                    return (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    );
                  })}
                </select>
              </Field>

              <Field label="Exp Year">
                <select value={expYear} onChange={(e) => setExpYear(e.target.value)}>
                  {Array.from({ length: 10 }, (_, i) => {
                    const y = String(2024 + i);
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
                </select>
              </Field>

              <Field label="Security Code (CVV)">
                <input
                  type="text"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="3-4 digits"
                  className="font-mono"
                />
              </Field>
            </div>
          </div>
        )}

        {/* --- IDENTITY SPECIFIC FIELDS --- */}
        {type === "Identity" && (
          <div className="space-y-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3">
            <div className="grid grid-cols-4 gap-2">
              <Field label="Title">
                <select value={identityTitle} onChange={(e) => setIdentityTitle(e.target.value)}>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                </select>
              </Field>
              <Field label="First Name">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First"
                />
              </Field>
              <Field label="Middle">
                <input
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Middle"
                />
              </Field>
              <Field label="Last Name">
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                />
              </Field>
              <Field label="Phone">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Username / Handle">
                <input
                  value={identityUsername}
                  onChange={(e) => setIdentityUsername(e.target.value)}
                  placeholder="handle"
                />
              </Field>
              <Field label="Country">
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Company / Employer">
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Organization"
                />
              </Field>
              <Field label="Social Security Number">
                <input
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value)}
                  placeholder="•••-••-••••"
                  className="font-mono"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Passport Number">
                <input
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                  placeholder="Passport ID"
                  className="font-mono"
                />
              </Field>
              <Field label="Driver's License">
                <input
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="License ID"
                  className="font-mono"
                />
              </Field>
            </div>

            <Field label="Street Address">
              <input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="123 Main St, Apt 4"
              />
            </Field>

            <div className="grid grid-cols-3 gap-2">
              <Field label="City">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </Field>
              <Field label="State / Province">
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                />
              </Field>
              <Field label="Postal Code">
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="ZIP / Postal"
                  className="font-mono"
                />
              </Field>
            </div>
          </div>
        )}

        {/* --- SECURE NOTE SPECIFIC FIELDS --- */}
        {type === "Secure note" && (
          <div className="space-y-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-app)] p-3">
            <Field label="Subject / Identifier">
              <input name="username" placeholder="e.g. Master Seed Phrase, Safe Combination" />
            </Field>
          </div>
        )}

        {/* --- CUSTOM FIELDS --- */}
        <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Custom Fields ({customFields.length})
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAddCustomField("text")}
                className="rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
              >
                + Text Field
              </button>
              <button
                type="button"
                onClick={() => handleAddCustomField("hidden")}
                className="rounded border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]"
              >
                + Hidden (Secret)
              </button>
            </div>
          </div>

          {customFields.map((field) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                value={field.name}
                onChange={(e) => handleUpdateCustomField(field.id, { name: e.target.value })}
                placeholder="Field Name"
                className="w-1/3 rounded border border-[var(--border-subtle)] bg-[var(--input-bg)] px-2 py-1 text-xs text-[var(--text-primary)]"
              />
              <input
                type={field.type === "hidden" ? "password" : "text"}
                value={field.value}
                onChange={(e) => handleUpdateCustomField(field.id, { value: e.target.value })}
                placeholder={field.type === "hidden" ? "Secret Value" : "Text Value"}
                className="flex-1 rounded border border-[var(--border-subtle)] bg-[var(--input-bg)] px-2 py-1 font-mono text-xs text-[var(--text-primary)]"
              />
              <button
                type="button"
                onClick={() => handleRemoveCustomField(field.id)}
                className="p-1 text-[var(--text-muted)] hover:text-rose-500"
                title="Remove field"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Notes (All Types) */}
        <Field label="Notes" hint="Markdown or plaintext notes">
          <textarea
            name="notes"
            rows={2}
            placeholder="Additional context, backup codes, security questions..."
          />
        </Field>

        {/* Favorite Pin */}
        <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] cursor-pointer select-none py-1">
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
            className="size-3.5 rounded accent-amber-500 cursor-pointer"
          />
          <Star className={`size-3.5 ${favorite ? "fill-amber-500 text-amber-500" : ""}`} />
          Pin to Favorites
        </label>

        <Actions close={onClose} label="Save to Vault" />
      </form>
    </Modal>
  );
}

export function NewItemModal(props: NewItemModalProps) {
  if (!props.isOpen) return null;
  return (
    <NewItemModalInner
      key={`${props.initialFolderId || ""}-${props.initialPassword || ""}`}
      {...props}
    />
  );
}
