/**
 * Peekaboo click command - click on UI elements or coordinates
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { FocusOptions, Coordinates } from "./types";

export interface ClickOptions extends FocusOptions {
  /** Element text or query to click */
  query?: string;
  /** Element ID to click (e.g., B1, T2) */
  on?: string;
  /** Element ID to click (alias for on) */
  id?: string;
  /** Click at coordinates */
  coords?: Coordinates;
  /** Maximum milliseconds to wait for element */
  waitFor?: number;
  /** Double-click instead of single click */
  double?: boolean;
  /** Right-click (secondary click) */
  right?: boolean;
}

export interface ClickResult {
  success?: boolean;
  clicked?: {
    x: number;
    y: number;
  };
}

/**
 * Click on UI elements or coordinates
 */
export async function click<T = ClickResult>(
  options?: ClickOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  // Positional query argument
  if (options?.query) {
    args.push(options.query);
  }

  // Targeting
  if (options?.on) {
    args.push("--on", options.on);
  }
  if (options?.id) {
    args.push("--id", options.id);
  }
  if (options?.coords) {
    args.push("--coords", `${options.coords.x},${options.coords.y}`);
  }
  if (options?.snapshot) {
    args.push("--snapshot", options.snapshot);
  }
  if (options?.waitFor !== undefined) {
    args.push("--wait-for", String(options.waitFor));
  }

  // Click type
  if (options?.double) {
    args.push("--double");
  }
  if (options?.right) {
    args.push("--right");
  }

  // Window targeting
  if (options?.app) {
    args.push("--app", options.app);
  }
  if (options?.pid) {
    args.push("--pid", String(options.pid));
  }
  if (options?.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }
  if (options?.windowTitle) {
    args.push("--window-title", options.windowTitle);
  }
  if (options?.windowIndex !== undefined) {
    args.push("--window-index", String(options.windowIndex));
  }

  // Focus options
  if (options?.noAutoFocus) {
    args.push("--no-auto-focus");
  }
  if (options?.spaceSwitch) {
    args.push("--space-switch");
  }
  if (options?.bringToCurrentSpace) {
    args.push("--bring-to-current-space");
  }
  if (options?.focusTimeoutSeconds !== undefined) {
    args.push("--focus-timeout-seconds", String(options.focusTimeoutSeconds));
  }
  if (options?.focusRetryCount !== undefined) {
    args.push("--focus-retry-count", String(options.focusRetryCount));
  }

  return peekabooExec<T>("click", args);
}
