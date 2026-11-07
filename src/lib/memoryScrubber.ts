/**
 * Vaultwise Volatile Memory & Clipboard Scrubber
 * Prevents credential lingering in memory buffers and clears OS clipboard history.
 */

import { copySensitiveText, copyTextSafely, clearClipboardSafely } from "./clipboard";

export { copyTextSafely, clearClipboardSafely };

/**
 * Zeroizes an ArrayBuffer or Uint8Array in memory.
 */
export function zeroizeBuffer(buffer: Uint8Array | ArrayBuffer): void {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  bytes.fill(0);
}

/**
 * Copies a sensitive credential to clipboard safely and schedules automatic memory zeroization.
 */
export async function secureCopyToClipboard(
  text: string,
  timeoutSeconds: number = 30,
  onClearCallback?: () => void
): Promise<boolean> {
  return copySensitiveText(
    text,
    "Sensitive data",
    timeoutSeconds,
    onClearCallback ? () => onClearCallback() : undefined
  );
}
