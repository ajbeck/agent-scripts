/**
 * Chrome DevTools Navigation
 *
 * Tools for page and tab management
 */

import { chromeExec } from "./base";
import type {
  SelectPageParams,
  NewPageParams,
  NavigatePageParams,
  ClosePageParams,
  WaitForParams,
  ListPagesResult,
} from "./types";

/**
 * List all open pages/tabs
 */
export async function listPages() {
  return chromeExec<ListPagesResult>("listPages", {});
}

/**
 * Select a page as context for future tool calls
 */
export async function selectPage(params: SelectPageParams) {
  return chromeExec("selectPage", params);
}

/**
 * Create a new page/tab and navigate to URL
 */
export async function newPage(params: NewPageParams) {
  return chromeExec("newPage", params);
}

/**
 * Navigate the selected page
 * @example navigate({ url: "https://example.com" })
 * @example navigate({ type: "back" })
 * @example navigate({ type: "reload", ignoreCache: true })
 */
export async function navigate(params: NavigatePageParams) {
  return chromeExec("navigatePage", params);
}

/**
 * Close a page by ID
 */
export async function closePage(params: ClosePageParams) {
  return chromeExec("closePage", params);
}

/**
 * Wait for text to appear on the page
 */
export async function waitFor(params: WaitForParams) {
  return chromeExec("waitFor", params);
}
