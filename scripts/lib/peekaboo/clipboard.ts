/**
 * Peekaboo clipboard command - read/write clipboard
 */

import { peekabooExec, type PeekabooResult } from "./base";

export interface ClipboardGetOptions {
  /** Preferred UTI when reading */
  prefer?: string;
  /** Output path for binary reads ('-' for stdout) */
  output?: string;
}

export interface ClipboardSetOptions {
  /** Text to set */
  text?: string;
  /** Path to file to copy */
  filePath?: string;
  /** Path to image to copy */
  imagePath?: string;
  /** Base64 data to copy */
  dataBase64?: string;
  /** UTI for base64 payload or to force type */
  uti?: string;
  /** Optional plain-text companion when setting binary */
  alsoText?: string;
  /** Allow payloads larger than 10 MB */
  allowLarge?: boolean;
  /** Read back clipboard after set and validate */
  verify?: boolean;
}

export interface ClipboardSaveRestoreOptions {
  /** Slot name for save/restore (default: "0") */
  slot?: string;
}

export interface ClipboardGetResult {
  content?: string;
  uti?: string;
  size?: number;
}

/**
 * Read the clipboard
 */
async function get<T = ClipboardGetResult>(
  options?: ClipboardGetOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = ["--action", "get"];

  if (options?.prefer) {
    args.push("--prefer", options.prefer);
  }
  if (options?.output) {
    args.push("--output", options.output);
  }

  return peekabooExec<T>("clipboard", args);
}

/**
 * Write to the clipboard
 */
async function set<T = unknown>(
  options: ClipboardSetOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = ["--action", "set"];

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
  if (options.allowLarge) {
    args.push("--allow-large");
  }
  if (options.verify) {
    args.push("--verify");
  }

  return peekabooExec<T>("clipboard", args);
}

/**
 * Clear the clipboard
 */
async function clear<T = unknown>(): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("clipboard", ["--action", "clear"]);
}

/**
 * Save clipboard to a slot
 */
async function save<T = unknown>(
  options?: ClipboardSaveRestoreOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = ["--action", "save"];

  if (options?.slot) {
    args.push("--slot", options.slot);
  }

  return peekabooExec<T>("clipboard", args);
}

/**
 * Restore clipboard from a slot
 */
async function restore<T = unknown>(
  options?: ClipboardSaveRestoreOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = ["--action", "restore"];

  if (options?.slot) {
    args.push("--slot", options.slot);
  }

  return peekabooExec<T>("clipboard", args);
}

/**
 * Load a file to clipboard (shortcut for set with file-path)
 */
async function load<T = unknown>(filePath: string): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("clipboard", ["--action", "load", "--file-path", filePath]);
}

/** Clipboard namespace */
export const clipboard = {
  get,
  set,
  clear,
  save,
  restore,
  load,
};
