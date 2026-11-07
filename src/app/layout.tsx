import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vaultwise — Zero-Knowledge Password Vault",
  description: "Ultra-secure, local-first credentials and secrets workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
