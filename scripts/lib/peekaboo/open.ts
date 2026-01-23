/**
 * Peekaboo open command - open URLs or files
 */

import { peekabooExec, type PeekabooResult } from "./base";

export interface OpenOptions {
  /** URL or file path to open */
  target: string;
  /** Application name or path to handle the target */
  app?: string;
  /** Bundle ID of the application */
  bundleId?: string;
  /** Wait until the handling application finishes launching */
  waitUntilReady?: boolean;
  /** Do not bring the application to foreground */
  noFocus?: boolean;
}

export interface OpenResult {
  success?: boolean;
  app?: string;
  target?: string;
}

/**
 * Open a URL or file with its default (or specified) application
 *
 * @example
 * // Open URL in default browser
 * await open({ target: "https://example.com" });
 *
 * // Open file in specific app
 * await open({ target: "~/Documents/report.pdf", app: "Preview" });
 *
 * // Open in background
 * await open({ target: "https://google.com", noFocus: true });
 */
export async function open<T = OpenResult>(
  options: OpenOptions
): Promise<PeekabooResult<T>> {
  const args: string[] = [options.target];

  if (options.app) {
    args.push("--app", options.app);
  }
  if (options.bundleId) {
    args.push("--bundle-id", options.bundleId);
  }
  if (options.waitUntilReady) {
    args.push("--wait-until-ready");
  }
  if (options.noFocus) {
    args.push("--no-focus");
  }

  return peekabooExec<T>("open", args);
}
