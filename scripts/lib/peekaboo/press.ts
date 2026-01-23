/**
 * Peekaboo press command - press individual keys or sequences
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { FocusOptions } from "./types";

export interface PressOptions extends FocusOptions {
  /** Key(s) to press */
  keys: string | string[];
  /** Repeat count for all keys */
  count?: number;
  /** Delay between key presses in milliseconds */
  delay?: number;
  /** Hold duration for each key in milliseconds */
  hold?: number;
}

export interface PressResult {
  success?: boolean;
  keys?: string[];
}

/**
 * Press individual keys or key sequences
 *
 * @example
 * // Press return
 * await press({ keys: "return" });
 *
 * // Press tab 3 times
 * await press({ keys: "tab", count: 3 });
 *
 * // Arrow key sequence
 * await press({ keys: ["up", "down", "left", "right"] });
 */
export async function press<T = PressResult>(
  options: PressOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  // Keys (positional)
  const keys = Array.isArray(options.keys) ? options.keys : [options.keys];
  args.push(...keys);

  if (options.count !== undefined) {
    args.push("--count", String(options.count));
  }
  if (options.delay !== undefined) {
    args.push("--delay", String(options.delay));
  }
  if (options.hold !== undefined) {
    args.push("--hold", String(options.hold));
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

  return peekabooExec<T>("press", args);
}
