/**
 * Peekaboo menu command - interact with application menu bar
 */

import { peekabooExec, type PeekabooResult } from "./base";

export interface MenuClickOptions {
  /** Application name */
  app: string;
  /** Menu item path (e.g., "File > Save") */
  path: string;
}

export interface MenuClickExtraOptions {
  /** Title of the menu extra (status bar item) */
  title: string;
}

export interface MenuListOptions {
  /** Application name */
  app: string;
}

export interface MenuItem {
  title?: string;
  path?: string;
  enabled?: boolean;
  shortcut?: string;
}

export interface MenuListResult {
  menus?: MenuItem[];
}

/**
 * List all menu items for an application
 */
async function listMenus<T = MenuListResult>(
  options: MenuListOptions
): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("menu list", ["--app", options.app]);
}

/**
 * List all menus across all applications
 */
async function listAll<T = unknown>(): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("menu list-all");
}

/**
 * Click a menu item using path notation
 *
 * @example
 * // Save document
 * await menu.click({ app: "TextEdit", path: "File > Save" });
 *
 * // Copy selection
 * await menu.click({ app: "Safari", path: "Edit > Copy" });
 */
async function clickMenu<T = unknown>(
  options: MenuClickOptions
): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("menu click", [
    "--app", options.app,
    "--path", options.path,
  ]);
}

/**
 * Click a system menu extra (status bar item)
 *
 * @example
 * await menu.clickExtra({ title: "WiFi" });
 */
async function clickExtra<T = unknown>(
  options: MenuClickExtraOptions
): Promise<PeekabooResult<T>> {
  return peekabooExec<T>("menu click-extra", ["--title", options.title]);
}

/** Menu namespace */
export const menu = {
  list: listMenus,
  listAll,
  click: clickMenu,
  clickExtra,
};
