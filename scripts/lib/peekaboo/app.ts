/**
 * Peekaboo app command - control applications
 */

import { peekabooExec, type PeekabooResult } from "./base";
import type { AppInfo } from "./types";

export interface AppLaunchOptions {
  /** Application name */
  name?: string;
  /** Bundle ID */
  bundleId?: string;
  /** URLs or files to open */
  open?: string[];
  /** Wait until the app finishes launching */
  waitUntilReady?: boolean;
  /** Do not bring the app to foreground */
  noFocus?: boolean;
}

export interface AppQuitOptions {
  /** Application name */
  app?: string;
  /** Quit all apps */
  all?: boolean;
  /** Apps to exclude when using --all */
  except?: string[];
  /** Force quit without saving */
  force?: boolean;
}

export interface AppSwitchOptions {
  /** Switch to this application */
  to?: string;
  /** Cmd+Tab equivalent */
  cycle?: boolean;
}

export interface AppRelaunchOptions {
  /** Application name */
  name: string;
  /** Wait seconds between quit and launch */
  wait?: number;
  /** Wait until the app finishes launching */
  waitUntilReady?: boolean;
}

export interface AppListResult {
  applications?: AppInfo[];
}

/**
 * Launch an application
 */
async function launch<T = unknown>(
  options: AppLaunchOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options.name) {
    args.push(options.name);
  }
  if (options.bundleId) {
    args.push("--bundle-id", options.bundleId);
  }
  if (options.open?.length) {
    for (const item of options.open) {
      args.push("--open", item);
    }
  }
  if (options.waitUntilReady) {
    args.push("--wait-until-ready");
  }
  if (options.noFocus) {
    args.push("--no-focus");
  }

  return peekabooExec<T>("app launch", args);
}

/**
 * Quit one or more applications
 */
async function quit<T = unknown>(
  options: AppQuitOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options.app) {
    args.push("--app", options.app);
  }
  if (options.all) {
    args.push("--all");
  }
  if (options.except?.length) {
    args.push("--except", options.except.join(","));
  }
  if (options.force) {
    args.push("--force");
  }

  return peekabooExec<T>("app quit", args);
}

/**
 * Switch to another application
 */
async function switchTo<T = unknown>(
  options: AppSwitchOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options.to) {
    args.push("--to", options.to);
  }
  if (options.cycle) {
    args.push("--cycle");
  }

  return peekabooExec<T>("app switch", args);
}

/**
 * Hide an application
 */
async function hide<T = unknown>(appName: string): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("app hide", ["--app", appName]);
}

/**
 * Show a hidden application
 */
async function unhide<T = unknown>(appName: string): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("app unhide", ["--app", appName]);
}

/**
 * List running applications
 */
async function listApps<T = AppListResult>(): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("app list");
}

/**
 * Relaunch an application
 */
async function relaunch<T = unknown>(
  options: AppRelaunchOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [options.name];

  if (options.wait !== undefined) {
    args.push("--wait", String(options.wait));
  }
  if (options.waitUntilReady) {
    args.push("--wait-until-ready");
  }

  return peekabooExec<T>("app relaunch", args);
}

/** App control namespace */
export const app = {
  launch,
  quit,
  switch: switchTo,
  hide,
  unhide,
  list: listApps,
  relaunch,
};
