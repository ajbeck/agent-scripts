/**
 * Peekaboo window command - manipulate windows
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { WindowInfo, Coordinates, Bounds } from "./types";

export interface WindowTargetOptions {
  /** Application name */
  app?: string;
  /** Window title (partial match) */
  title?: string;
  /** Window index (0-based) */
  index?: number;
  /** Window ID from CoreGraphics */
  windowId?: number;
}

export interface WindowMoveOptions extends WindowTargetOptions {
  x: number;
  y: number;
}

export interface WindowResizeOptions extends WindowTargetOptions {
  width: number;
  height: number;
}

export interface WindowSetBoundsOptions extends WindowTargetOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowListResult {
  windows?: WindowInfo[];
}

/**
 * Close a window
 */
async function close<T = unknown>(
  options: WindowTargetOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options.app) {
    args.push("--app", options.app);
  }
  if (options.title) {
    args.push("--window-title", options.title);
  }
  if (options.index !== undefined) {
    args.push("--window-index", String(options.index));
  }
  if (options.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }

  return peekabooExec<T>("window close", args);
}

/**
 * Minimize a window
 */
async function minimize<T = unknown>(
  options: WindowTargetOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options.app) {
    args.push("--app", options.app);
  }
  if (options.title) {
    args.push("--window-title", options.title);
  }
  if (options.index !== undefined) {
    args.push("--window-index", String(options.index));
  }
  if (options.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }

  return peekabooExec<T>("window minimize", args);
}

/**
 * Maximize a window
 */
async function maximize<T = unknown>(
  options: WindowTargetOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options.app) {
    args.push("--app", options.app);
  }
  if (options.title) {
    args.push("--window-title", options.title);
  }
  if (options.index !== undefined) {
    args.push("--window-index", String(options.index));
  }
  if (options.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }

  return peekabooExec<T>("window maximize", args);
}

/**
 * Move a window to a new position
 */
async function moveWindow<T = unknown>(
  options: WindowMoveOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = ["--x", String(options.x), "--y", String(options.y)];

  if (options.app) {
    args.push("--app", options.app);
  }
  if (options.title) {
    args.push("--window-title", options.title);
  }
  if (options.index !== undefined) {
    args.push("--window-index", String(options.index));
  }
  if (options.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }

  return peekabooExec<T>("window move", args);
}

/**
 * Resize a window
 */
async function resize<T = unknown>(
  options: WindowResizeOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [
    "--width", String(options.width),
    "--height", String(options.height),
  ];

  if (options.app) {
    args.push("--app", options.app);
  }
  if (options.title) {
    args.push("--window-title", options.title);
  }
  if (options.index !== undefined) {
    args.push("--window-index", String(options.index));
  }
  if (options.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }

  return peekabooExec<T>("window resize", args);
}

/**
 * Set window position and size in one operation
 */
async function setBounds<T = unknown>(
  options: WindowSetBoundsOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [
    "--x", String(options.x),
    "--y", String(options.y),
    "--width", String(options.width),
    "--height", String(options.height),
  ];

  if (options.app) {
    args.push("--app", options.app);
  }
  if (options.title) {
    args.push("--window-title", options.title);
  }
  if (options.index !== undefined) {
    args.push("--window-index", String(options.index));
  }
  if (options.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }

  return peekabooExec<T>("window set-bounds", args);
}

/**
 * Bring a window to the foreground
 */
async function focus<T = unknown>(
  options: WindowTargetOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options.app) {
    args.push("--app", options.app);
  }
  if (options.title) {
    args.push("--window-title", options.title);
  }
  if (options.index !== undefined) {
    args.push("--window-index", String(options.index));
  }
  if (options.windowId !== undefined) {
    args.push("--window-id", String(options.windowId));
  }

  return peekabooExec<T>("window focus", args);
}

/**
 * List windows for an application
 */
async function listWindows<T = WindowListResult>(
  appName: string
): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("window list", ["--app", appName]);
}

/** Window control namespace */
export const window = {
  close,
  minimize,
  maximize,
  move: moveWindow,
  resize,
  setBounds,
  focus,
  list: listWindows,
};
