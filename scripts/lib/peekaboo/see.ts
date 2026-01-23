/**
 * Peekaboo see command - capture and analyze UI elements
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { CaptureMode, CaptureEngine, UIElement } from "./types";

export interface SeeOptions {
  /** Application name, 'menubar', or 'frontmost' */
  app?: string;
  /** Target application by process ID */
  pid?: number;
  /** Specific window title to capture */
  windowTitle?: string;
  /** Capture a specific window by CoreGraphics window ID */
  windowId?: number;
  /** Capture mode */
  mode?: CaptureMode;
  /** Output path for screenshot */
  path?: string;
  /** Capture engine */
  captureEngine?: CaptureEngine;
  /** Specific screen index to capture */
  screenIndex?: number;
  /** Analyze captured content with AI */
  analyze?: string;
  /** Overall timeout in seconds */
  timeoutSeconds?: number;
  /** Generate annotated screenshot with interaction markers */
  annotate?: boolean;
  /** Capture menu bar popovers via window list + OCR */
  menubar?: boolean;
  /** Skip web-content focus fallback */
  noWebFocus?: boolean;
}

export interface SeeResult {
  snapshot_id?: string;
  elements?: UIElement[];
  image_path?: string;
  analysis?: string;
}

/**
 * Capture and analyze UI elements for automation
 */
export async function see<T = SeeResult>(
  options?: SeeOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options?.app) {
    args.push("--app", options.app);
  }
  if (options?.pid) {
    args.push("--pid", String(options.pid));
  }
  if (options?.windowTitle) {
    args.push("--window-title", options.windowTitle);
  }
  if (options?.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }
  if (options?.mode) {
    args.push("--mode", options.mode);
  }
  if (options?.path) {
    args.push("--path", options.path);
  }
  if (options?.captureEngine) {
    args.push("--capture-engine", options.captureEngine);
  }
  if (options?.screenIndex !== undefined) {
    args.push("--screen-index", String(options.screenIndex));
  }
  if (options?.analyze) {
    args.push("--analyze", options.analyze);
  }
  if (options?.timeoutSeconds !== undefined) {
    args.push("--timeout-seconds", String(options.timeoutSeconds));
  }
  if (options?.annotate) {
    args.push("--annotate");
  }
  if (options?.menubar) {
    args.push("--menubar");
  }
  if (options?.noWebFocus) {
    args.push("--no-web-focus");
  }

  return peekabooExec<T>("see", args);
}
