/**
 * Peekaboo type command - type text or send keyboard input
 * Named "input" to avoid TypeScript keyword conflict
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { FocusOptions, TypingProfile } from "./types";

export interface TypeOptions extends FocusOptions {
  /** Text to type */
  text?: string;
  /** Delay between keystrokes in milliseconds */
  delay?: number;
  /** Typing profile: human (default) or linear */
  profile?: TypingProfile;
  /** Approximate human typing speed (words per minute) */
  wpm?: number;
  /** Press tab N times */
  tab?: number;
  /** Press return/enter after typing */
  return?: boolean;
  /** Press escape */
  escape?: boolean;
  /** Press delete/backspace */
  delete?: boolean;
  /** Clear the field before typing (Cmd+A, Delete) */
  clear?: boolean;
}

export interface TypeResult {
  success?: boolean;
  typed?: string;
}

/**
 * Type text or send keyboard input
 */
export async function type<T = TypeResult>(
  options: TypeOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  // Positional text argument
  if (options.text) {
    args.push(options.text);
  }

  // Typing options
  if (options.delay !== undefined) {
    args.push("--delay", String(options.delay));
  }
  if (options.profile) {
    args.push("--profile", options.profile);
  }
  if (options.wpm !== undefined) {
    args.push("--wpm", String(options.wpm));
  }
  if (options.tab !== undefined) {
    args.push("--tab", String(options.tab));
  }

  // Special keys
  if (options.return) {
    args.push("--return");
  }
  if (options.escape) {
    args.push("--escape");
  }
  if (options.delete) {
    args.push("--delete");
  }
  if (options.clear) {
    args.push("--clear");
  }

  // Snapshot
  if (options.snapshot) {
    args.push("--snapshot", options.snapshot);
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

  return peekabooExec<T>("type", args);
}
