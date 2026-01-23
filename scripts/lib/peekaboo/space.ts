/**
 * Peekaboo space command - manage macOS Spaces (virtual desktops)
 */

import { peekabooExec, type PeekabooResult } from "./base";

export interface SpaceListOptions {
  /** Include detailed information */
  detailed?: boolean;
}

export interface SpaceSwitchOptions {
  /** Space number to switch to */
  to: number;
}

export interface SpaceMoveWindowOptions {
  /** Application name */
  app: string;
  /** Target space number */
  to?: number;
  /** Move window to current space */
  toCurrent?: boolean;
  /** Follow the window to the new space */
  follow?: boolean;
  /** Window title (optional) */
  windowTitle?: string;
}

export interface SpaceInfo {
  index?: number;
  isCurrent?: boolean;
  windows?: number;
}

export interface SpaceListResult {
  spaces?: SpaceInfo[];
  currentSpace?: number;
}

/**
 * List all Spaces
 */
async function listSpaces<T = SpaceListResult>(
  options?: SpaceListOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options?.detailed) {
    args.push("--detailed");
  }

  return peekabooExec<T>("space list", args);
}

/**
 * Switch to a different Space
 *
 * @example
 * await space.switch({ to: 2 });
 */
async function switchSpace<T = unknown>(
  options: SpaceSwitchOptions
): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("space switch", ["--to", String(options.to)]);
}

/**
 * Move a window to a different Space
 *
 * @example
 * // Move to space 3
 * await space.moveWindow({ app: "Safari", to: 3 });
 *
 * // Move to current space
 * await space.moveWindow({ app: "TextEdit", toCurrent: true });
 *
 * // Move and follow
 * await space.moveWindow({ app: "Terminal", to: 2, follow: true });
 */
async function moveWindow<T = unknown>(
  options: SpaceMoveWindowOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = ["--app", options.app];

  if (options.to !== undefined) {
    args.push("--to", String(options.to));
  }
  if (options.toCurrent) {
    args.push("--to-current");
  }
  if (options.follow) {
    args.push("--follow");
  }
  if (options.windowTitle) {
    args.push("--window-title", options.windowTitle);
  }

  return peekabooExec<T>("space move-window", args);
}

/** Space namespace */
export const space = {
  list: listSpaces,
  switch: switchSpace,
  moveWindow,
};
