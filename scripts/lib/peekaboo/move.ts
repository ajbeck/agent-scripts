/**
 * Peekaboo move command - move the mouse cursor
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { FocusOptions, Coordinates, MovementProfile } from "./types";

export interface MoveOptions extends FocusOptions {
  /** Coordinates to move to */
  coords?: Coordinates;
  /** Move to element by text/label */
  to?: string;
  /** Move to element by ID */
  id?: string;
  /** Movement duration in milliseconds */
  duration?: number;
  /** Number of steps for smooth movement */
  steps?: number;
  /** Movement profile */
  profile?: MovementProfile;
  /** Move to screen center */
  center?: boolean;
  /** Use smooth movement animation */
  smooth?: boolean;
}

export interface MoveResult {
  success?: boolean;
  position?: Coordinates;
}

/**
 * Move the mouse cursor to coordinates or UI elements
 *
 * @example
 * // Move to coordinates
 * await move({ coords: { x: 100, y: 200 } });
 *
 * // Move to element by text
 * await move({ to: "Submit Button" });
 *
 * // Smooth movement to center
 * await move({ center: true, smooth: true });
 */
export async function move<T = MoveResult>(
  options?: MoveOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  // Coordinates (positional)
  if (options?.coords) {
    args.push(`${options.coords.x},${options.coords.y}`);
  }

  if (options?.to) {
    args.push("--to", options.to);
  }
  if (options?.id) {
    args.push("--id", options.id);
  }
  if (options?.duration !== undefined) {
    args.push("--duration", String(options.duration));
  }
  if (options?.steps !== undefined) {
    args.push("--steps", String(options.steps));
  }
  if (options?.profile) {
    args.push("--profile", options.profile);
  }
  if (options?.center) {
    args.push("--center");
  }
  if (options?.smooth) {
    args.push("--smooth");
  }
  if (options?.snapshot) {
    args.push("--snapshot", options.snapshot);
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

  return peekabooExec<T>("move", args);
}
