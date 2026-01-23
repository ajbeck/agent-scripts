/**
 * Peekaboo paste command - set clipboard, paste, restore
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { FocusOptions } from "./types";

export interface PasteOptions extends FocusOptions {
  /** Text to paste */
  text?: string;
  /** Path to file to paste */
  filePath?: string;
  /** Path to image to paste */
  imagePath?: string;
  /** Base64 data to paste */
  dataBase64?: string;
  /** UTI for base64 payload or to force type */
  uti?: string;
  /** Optional plain-text companion when setting binary */
  alsoText?: string;
  /** Delay before restoring previous clipboard (ms) */
  restoreDelayMs?: number;
  /** Allow payloads larger than 10 MB */
  allowLarge?: boolean;
}

export interface PasteResult {
  success?: boolean;
  pasted?: boolean;
}

/**
 * Set clipboard, paste (Cmd+V), then restore previous clipboard
 *
 * @example
 * // Paste text into TextEdit
 * await paste({ text: "Hello World", app: "TextEdit" });
 *
 * // Paste image
 * await paste({ filePath: "/tmp/image.png", app: "Notes" });
 */
export async function paste<T = PasteResult>(
  options: PasteOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  // Content to paste
  if (options.text) {
    args.push("--text", options.text);
  }
  if (options.filePath) {
    args.push("--file-path", options.filePath);
  }
  if (options.imagePath) {
    args.push("--image-path", options.imagePath);
  }
  if (options.dataBase64) {
    args.push("--data-base64", options.dataBase64);
  }
  if (options.uti) {
    args.push("--uti", options.uti);
  }
  if (options.alsoText) {
    args.push("--also-text", options.alsoText);
  }
  if (options.restoreDelayMs !== undefined) {
    args.push("--restore-delay-ms", String(options.restoreDelayMs));
  }
  if (options.allowLarge) {
    args.push("--allow-large");
  }

  // Window targeting
  if (options.app) {
    args.push("--app", options.app);
  }
  if (options.pid) {
    args.push("--pid", String(options.pid));
  }
  if (options.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }
  if (options.windowTitle) {
    args.push("--window-title", options.windowTitle);
  }
  if (options.windowIndex !== undefined) {
    args.push("--window-index", String(options.windowIndex));
  }

  // Focus options
  if (options.noAutoFocus) {
    args.push("--no-auto-focus");
  }
  if (options.spaceSwitch) {
    args.push("--space-switch");
  }
  if (options.bringToCurrentSpace) {
    args.push("--bring-to-current-space");
  }
  if (options.focusTimeoutSeconds !== undefined) {
    args.push("--focus-timeout-seconds", String(options.focusTimeoutSeconds));
  }
  if (options.focusRetryCount !== undefined) {
    args.push("--focus-retry-count", String(options.focusRetryCount));
  }

  return peekabooExec<T>("paste", args);
}
