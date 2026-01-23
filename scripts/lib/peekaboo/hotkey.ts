/**
 * Peekaboo hotkey command - press keyboard shortcuts
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { FocusOptions } from "./types";

export interface HotkeyOptions extends FocusOptions {
  /** Keys to press (comma or space separated) */
  keys: string;
  /** Delay between key press and release in milliseconds */
  holdDuration?: number;
}

export interface HotkeyResult {
  success?: boolean;
  keys?: string[];
}

/**
 * Press keyboard shortcuts and key combinations
 *
 * @example
 * // Copy (Cmd+C)
 * await hotkey({ keys: "cmd,c" });
 *
 * // Spotlight (Cmd+Space)
 * await hotkey({ keys: "cmd space" });
 *
 * // Reopen closed tab (Cmd+Shift+T)
 * await hotkey({ keys: "cmd,shift,t" });
 */
export async function hotkey<T = HotkeyResult>(
  options: HotkeyOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  // Positional keys argument
  args.push(options.keys);

  if (options.holdDuration !== undefined) {
    args.push("--hold-duration", String(options.holdDuration));
  }
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

  return peekabooExec<T>("hotkey", args);
}
