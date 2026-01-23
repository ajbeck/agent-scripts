/**
 * Peekaboo image command - capture screenshots
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { CaptureMode, ImageFormat } from "./types";

export interface ImageOptions {
  /** Target application name, bundle ID, 'PID:12345', 'menubar', or 'frontmost' */
  app?: string;
  /** Target application by process ID */
  pid?: number;
  /** Output path for saved image */
  path?: string;
  /** Capture mode */
  mode?: CaptureMode;
  /** Capture window with specific title */
  windowTitle?: string;
  /** Window index to capture */
  windowIndex?: number;
  /** Capture window by CoreGraphics window ID */
  windowId?: number;
  /** Screen index for screen captures */
  screenIndex?: number;
  /** Image format */
  format?: ImageFormat;
  /** Capture at native Retina resolution */
  retina?: boolean;
  /** Analyze the captured image with AI */
  analyze?: string;
}

export interface ImageResult {
  path?: string;
  width?: number;
  height?: number;
  analysis?: string;
}

/**
 * Capture a screenshot
 */
export async function image<T = ImageResult>(
  options?: ImageOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options?.app) {
    args.push("--app", options.app);
  }
  if (options?.pid) {
    args.push("--pid", String(options.pid));
  }
  if (options?.path) {
    args.push("--path", options.path);
  }
  if (options?.mode) {
    args.push("--mode", options.mode);
  }
  if (options?.windowTitle) {
    args.push("--window-title", options.windowTitle);
  }
  if (options?.windowIndex !== undefined) {
    args.push("--window-index", String(options.windowIndex));
  }
  if (options?.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }
  if (options?.screenIndex !== undefined) {
    args.push("--screen-index", String(options.screenIndex));
  }
  if (options?.format) {
    args.push("--format", options.format);
  }
  if (options?.retina) {
    args.push("--retina");
  }
  if (options?.analyze) {
    args.push("--analyze", options.analyze);
  }

  return peekabooExec<T>("image", args);
}
