/**
 * Peekaboo dialog command - interact with system dialogs
 */

import { peekabooExec, type PeekabooResult } from "./base";

export interface DialogTargetOptions {
  /** Application name */
  app?: string;
  /** Process ID */
  pid?: number;
  /** Window ID */
  windowId?: number;
  /** Window title */
  windowTitle?: string;
  /** Window index */
  windowIndex?: number;
}

export interface DialogClickOptions extends DialogTargetOptions {
  /** Button to click (or "default" for default action) */
  button: string;
}

export interface DialogInputOptions extends DialogTargetOptions {
  /** Text to enter */
  text: string;
  /** Field name (optional) */
  field?: string;
  /** Clear field before typing */
  clear?: boolean;
}

export interface DialogFileOptions extends DialogTargetOptions {
  /** Directory path */
  path?: string;
  /** File name */
  name?: string;
  /** Button to select ("Save", "Open", or "default") */
  select?: string;
  /** Ensure the dialog is expanded (show full file browser) */
  ensureExpanded?: boolean;
}

export interface DialogDismissOptions extends DialogTargetOptions {
  /** Press Escape to force dismiss */
  force?: boolean;
}

export interface DialogElement {
  type?: string;
  title?: string;
  role?: string;
}

export interface DialogListResult {
  elements?: DialogElement[];
}

/**
 * List elements in current dialog
 */
async function listDialog<T = DialogListResult>(
  options?: DialogTargetOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

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

  return peekabooExec<T>("dialog list", args);
}

/**
 * Click a button in a dialog
 *
 * @example
 * // Click OK button
 * await dialog.click({ button: "OK", app: "TextEdit" });
 *
 * // Click default button
 * await dialog.click({ button: "default", app: "Safari" });
 */
async function clickDialog<T = unknown>(
  options: DialogClickOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = ["--button", options.button];

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

  return peekabooExec<T>("dialog click", args);
}

/**
 * Enter text in a dialog field
 *
 * @example
 * await dialog.input({ text: "password123", field: "Password", app: "Safari" });
 */
async function inputDialog<T = unknown>(
  options: DialogInputOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = ["--text", options.text];

  if (options.field) {
    args.push("--field", options.field);
  }
  if (options.clear) {
    args.push("--clear");
  }
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

  return peekabooExec<T>("dialog input", args);
}

/**
 * Handle file save/open dialogs
 *
 * @example
 * await dialog.file({
 *   path: "/tmp",
 *   name: "document.txt",
 *   select: "Save",
 *   app: "TextEdit"
 * });
 */
async function fileDialog<T = unknown>(
  options: DialogFileOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options.path) {
    args.push("--path", options.path);
  }
  if (options.name) {
    args.push("--name", options.name);
  }
  if (options.select) {
    args.push("--select", options.select);
  }
  if (options.ensureExpanded) {
    args.push("--ensure-expanded");
  }
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

  return peekabooExec<T>("dialog file", args);
}

/**
 * Dismiss a dialog
 *
 * @example
 * await dialog.dismiss({ app: "Safari" });
 * await dialog.dismiss({ force: true }); // Press Escape
 */
async function dismissDialog<T = unknown>(
  options?: DialogDismissOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [];

  if (options?.force) {
    args.push("--force");
  }
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

  return peekabooExec<T>("dialog dismiss", args);
}

/** Dialog namespace */
export const dialog = {
  list: listDialog,
  click: clickDialog,
  input: inputDialog,
  file: fileDialog,
  dismiss: dismissDialog,
};
