/**
 * Peekaboo list commands - list apps, windows, screens, permissions
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { AppInfo, WindowInfo, ScreenInfo } from "./types";

export interface ListAppsResult {
  applications?: AppInfo[];
}

export interface ListWindowsOptions {
  app: string;
  includeDetails?: ("bounds" | "ids")[];
}

export interface ListWindowsResult {
  windows?: WindowInfo[];
}

export interface ListScreensResult {
  screens?: ScreenInfo[];
}

export interface PermissionsResult {
  screenRecording?: boolean;
  accessibility?: boolean;
}

export interface MenubarItem {
  title?: string;
  index: number;
}

export interface ListMenubarResult {
  items?: MenubarItem[];
}

/**
 * List running applications
 */
export async function apps<T = ListAppsResult>(): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("list apps");
}

/**
 * List windows for a specific application
 */
export async function windows<T = ListWindowsResult>(
  options: ListWindowsOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = ["--app", options.app];

  if (options.includeDetails?.length) {
    args.push("--include-details", options.includeDetails.join(","));
  }

  return peekabooExec<T>("list windows", args);
}

/**
 * List all displays/monitors
 */
export async function screens<T = ListScreensResult>(): Promise<
  PeekabooResult<T>
> {
  return peekabooExec<T>("list screens");
}

/**
 * Check permissions required for Peekaboo
 */
export async function permissions<T = PermissionsResult>(): Promise<
  PeekabooResult<T>
> {
  return peekabooExec<T>("list permissions");
}

/**
 * List all menu bar items (status icons)
 */
export async function menubar<T = ListMenubarResult>(): Promise<
  PeekabooResult<T>
> {
  return peekabooExec<T>("list menubar");
}

/** List commands namespace */
export const list = {
  apps,
  windows,
  screens,
  permissions,
  menubar,
};
