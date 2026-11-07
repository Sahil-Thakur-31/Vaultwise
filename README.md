# 🛡️ Vaultwise

> **Next-Generation Zero-Knowledge Client-Side Encrypted Password & Secret Enclave**  
> Built with Next.js 16, React 19, WebCrypto (AES-GCM-256 + PBKDF2), Tailwind CSS, and standalone desktop runtime.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)](https://www.typescriptlang.org/)
[![Security](https://img.shields.io/badge/Security-Zero--Knowledge-emerald)](https://github.com/Sahil-Thakur-31/Vaultwise)

---

## ✨ Overview

**Vaultwise** is an ultra-secure, privacy-first credential manager designed for developers, professionals, and teams. Built from the ground up around a **strict zero-knowledge architecture**, all sensitive data—including passwords, TOTP seeds, passkey credentials, secure notes, API tokens, and encrypted file attachments—are encrypted and decrypted strictly on the client using authenticated **AES-GCM-256** and **PBKDF2** key derivation.

No plaintext passwords, master passwords, or encryption keys ever leave your device.

---

## 🚀 Key Features

### 🔐 Zero-Knowledge Cryptography
- **AES-GCM 256-bit Authenticated Encryption**: Cryptographic guarantees against tampering and eavesdropping via modern WebCrypto APIs.
- **PBKDF2-HMAC-SHA256 Key Derivation**: Master keys are stretched over 100,000+ iterations with unique cryptographic salts.
- **Deterministic Checksums & Fingerprints**: Immediate verification of vault integrity without exposing underlying data.

### 🔑 FIDO2 / WebAuthn Passkeys
- First-class support for WebAuthn passkey credentials.
- Register, store, and manage hardware/device-bound biometric passkeys directly in vault items.

### ⏱️ RFC 6238 TOTP Two-Factor Authenticator
- Built-in time-based one-time password (TOTP) generator conforming to RFC 6238.
- Real-time animated 30-second countdown wheel with color-coded warning states when a token is expiring.
- One-click instant token copy with auto-clearing clipboard protection.

### 🔍 k-Anonymity HIBP Breach Checker
- Zero-knowledge breach detection powered by the HaveIBeenPwned API using mathematical **k-Anonymity**.
- Only the first 5 characters of a SHA-1 password hash are transmitted over the network; the remaining hash suffix is matched locally, ensuring passwords are never exposed.

### 📎 Client-Side Encrypted File Attachments
- Store sensitive private keys, certificates, recovery documents, and backup codes.
- Files are encrypted in-memory before saving and decrypted on-the-fly upon export/download.

### 🛠️ Developer Secret & SSH Key Generator
- Cryptographically secure password generator with customizable symbol, numeral, and character sets.
- Diceware memorable passphrase generator with adjustable word count and separators.
- Developer API tokens (Stripe, GitHub PAT, JWT, Base64 secrets) and SSH key-pair simulator (`ed25519` / `rsa-4096`).

### 📄 Emergency Recovery Kit
- Export and print a physical zero-knowledge emergency recovery kit containing vault fingerprint, account metadata, QR code, and safe-deposit recovery instructions.

### 🛡️ Privacy Shield & Anti-Shoulder Surfing
- Automatic blur overlay and screen shield activates when switching browser tabs or minimizing the application window.
- Inactivity auto-lock with configurable timeouts (1 min to 1 hour).
- Memory-safe clipboard with 30-second automatic wipe mechanism.

### ⚡ Keyboard Accelerators & Command Palette
- Full global command palette (`Ctrl+K` / `Cmd+K`) for rapid navigation.
- Native vim-inspired shortcut navigation (`J` / `K` or `↑` / `↓`) and quick actions (`E` to edit, `Delete` to remove, `?` for shortcuts modal).

---

## 🏗️ Architecture & Security Model

```
+-------------------------------------------------------------+
|                     Client Device                           |
|                                                             |
|  [ User Master Password ]                                   |
|             │                                               |
|             ▼                                               |
|  [ PBKDF2 (100,000 iterations, SHA-256, Unique Salt) ]      |
|             │                                               |
|             ▼                                               |
|  [ AES-GCM 256-bit Encryption Key ]                         |
|             │                                               |
|     ┌───────┴──────────────────────────┐                    |
|     ▼                                  ▼                    |
|  Encrypt Items, TOTP, Attachments   Decrypt on Demand       |
|  (Never sent in plaintext)          (Stored in session)     |
+-------------------------------------------------------------+
                              │
                      Encrypted Blobs Only
                              │
                              ▼
                [ Local Storage / Enclave Sync ]
```

---

## 💻 Getting Started

### Prerequisites

- **Node.js** 18.18.0 or higher
- **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sahil-Thakur-31/Vaultwise.git
   cd Vaultwise
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🖥️ Standalone Desktop Mode

Vaultwise can run as an isolated standalone desktop application window:

```bash
npm run desktop
```

Or for pure web development mode:
```bash
npm run dev:web
```

---

## 🧪 Production Build & Linting

Run ESLint verification:
```bash
npm run lint
```

Create a production build:
```bash
npm run build
```

---

## 🔒 Security Best Practices

- Always keep your Master Password secure and store your Emergency Recovery Kit in a fireproof safe or safety deposit box.
- Never share your vault encryption key or unencrypted exported backups over insecure channels.
- Vaultwise operates strictly client-side; no server has access to your unencrypted vault data.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

**Developed with ❤️ by [Sahil Thakur](https://github.com/Sahil-Thakur-31)**
