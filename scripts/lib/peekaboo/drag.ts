/**
 * Peekaboo drag command - drag and drop operations
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { FocusOptions, Coordinates, MovementProfile } from "./types";

export interface DragOptions extends FocusOptions {
  /** Starting element ID from snapshot */
  from?: string;
  /** Starting coordinates */
  fromCoords?: Coordinates;
  /** Target element ID from snapshot */
  to?: string;
  /** Target coordinates */
  toCoords?: Coordinates;
  /** Target application (e.g., 'Trash', 'Finder') */
  toApp?: string;
  /** Duration of drag in milliseconds */
  duration?: number;
  /** Number of intermediate steps */
  steps?: number;
  /** Modifier keys to hold during drag */
  modifiers?: string;
  /** Movement profile */
  profile?: MovementProfile;
}

export interface DragResult {
  success?: boolean;
  from?: Coordinates;
  to?: Coordinates;
}

/**
 * Perform drag and drop operations
 *
 * @example
 * // Drag element to element
 * await drag({ from: "B1", to: "T2" });
 *
 * // Drag coordinates to coordinates
 * await drag({
 *   fromCoords: { x: 100, y: 200 },
 *   toCoords: { x: 400, y: 300 }
 * });
 *
 * // Drag to Trash
 * await drag({ from: "S1", toApp: "Trash" });
 */
export async function drag<T = DragResult>(
  options: DragOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options.from) {
    args.push("--from", options.from);
  }
  if (options.fromCoords) {
    args.push("--from-coords", `${options.fromCoords.x},${options.fromCoords.y}`);
  }
  if (options.to) {
    args.push("--to", options.to);
  }
  if (options.toCoords) {
    args.push("--to-coords", `${options.toCoords.x},${options.toCoords.y}`);
  }
  if (options.toApp) {
    args.push("--to-app", options.toApp);
  }
  if (options.duration !== undefined) {
    args.push("--duration", String(options.duration));
  }
  if (options.steps !== undefined) {
    args.push("--steps", String(options.steps));
  }
  if (options.modifiers) {
    args.push("--modifiers", options.modifiers);
  }
  if (options.profile) {
    args.push("--profile", options.profile);
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

  return peekabooExec<T>("drag", args);
}
