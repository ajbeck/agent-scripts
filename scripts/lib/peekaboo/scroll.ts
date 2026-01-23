/**
 * Peekaboo scroll command - scroll the mouse wheel
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { FocusOptions, ScrollDirection } from "./types";

export interface ScrollOptions extends FocusOptions {
  /** Scroll direction */
  direction: ScrollDirection;
  /** Number of scroll ticks */
  amount?: number;
  /** Element ID to scroll on (from see command) */
  on?: string;
  /** Delay between scroll ticks in milliseconds */
  delay?: number;
  /** Use smooth scrolling with smaller increments */
  smooth?: boolean;
}

export interface ScrollResult {
  success?: boolean;
  direction?: ScrollDirection;
  amount?: number;
}

/**
 * Scroll the mouse wheel in any direction
 *
 * @example
 * // Scroll down 5 ticks
 * await scroll({ direction: "down", amount: 5 });
 *
 * // Smooth scroll up on element
 * await scroll({ direction: "up", amount: 10, on: "S1", smooth: true });
 */
export async function scroll<T = ScrollResult>(
  options: ScrollOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  args.push("--direction", options.direction);

  if (options.amount !== undefined) {
    args.push("--amount", String(options.amount));
  }
  if (options.on) {
    args.push("--on", options.on);
  }
  if (options.delay !== undefined) {
    args.push("--delay", String(options.delay));
  }
  if (options.smooth) {
    args.push("--smooth");
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

  return peekabooExec<T>("scroll", args);
}
