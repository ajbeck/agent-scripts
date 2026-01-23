/**
 * Peekaboo dock command - interact with macOS Dock
 */

import { peekabooExec, type PeekabooResult } from "./base";

export interface DockRightClickOptions {
  /** Application name */
  app: string;
  /** Menu item to select after right-click */
  select?: string;
}

export interface DockItem {
  name?: string;
  bundleId?: string;
  isRunning?: boolean;
  isPersistent?: boolean;
}

export interface DockListResult {
  items?: DockItem[];
}

/**
 * Launch an application from the Dock
 */
async function launch<T = unknown>(appName: string): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("dock launch", [appName]);
}

/**
 * Right-click a Dock item and optionally select from menu
 *
 * @example
 * // Right-click and select menu item
 * await dock.rightClick({ app: "Finder", select: "New Window" });
 */
async function rightClick<T = unknown>(
  options: DockRightClickOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = ["--app", options.app];

  if (options.select) {
    args.push("--select", options.select);
  }

  return peekabooExec<T>("dock right-click", args);
}

/**
 * Hide the Dock
 */
async function hide<T = unknown>(): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("dock hide");
}

/**
 * Show the Dock
 */
async function show<T = unknown>(): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("dock show");
}

/**
 * List all Dock items
 */
async function listDock<T = DockListResult>(): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("dock list");
}

/** Dock namespace */
export const dock = {
  launch,
  rightClick,
  hide,
  show,
  list: listDock,
};
