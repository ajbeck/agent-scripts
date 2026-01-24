/**
 * Chrome DevTools Input Automation
 *
 * Tools for simulating user input: clicks, typing, drag, etc.
 */

import { chromeExec } from "./base";
import type {
  ClickParams,
  HoverParams,
  FillParams,
  FillFormParams,
  DragParams,
  PressKeyParams,
  UploadFileParams,
  HandleDialogParams,
} from "./types";

/**
 * Click on an element by UID (from snapshot)
 */
export async function click(params: ClickParams) {
  return chromeExec("click", params);
}

/**
 * Hover over an element
 */
export async function hover(params: HoverParams) {
  return chromeExec("hover", params);
}

/**
 * Fill a form field with a value
 */
export async function fill(params: FillParams) {
  return chromeExec("fill", params);
}

/**
 * Fill multiple form fields at once
 */
export async function fillForm(params: FillFormParams) {
  return chromeExec("fillForm", params);
}

/**
 * Drag one element onto another
 */
export async function drag(params: DragParams) {
  return chromeExec("drag", params);
}

/**
 * Press a key or key combination
 * @example pressKey({ key: "Enter" })
 * @example pressKey({ key: "Control+A" })
 * @example pressKey({ key: "Control+Shift+R" })
 */
export async function pressKey(params: PressKeyParams) {
  return chromeExec("pressKey", params);
}

/**
 * Upload a file through a file input element
 */
export async function uploadFile(params: UploadFileParams) {
  return chromeExec("uploadFile", params);
}

/**
 * Handle a browser dialog (alert, confirm, prompt)
 */
export async function handleDialog(params: HandleDialogParams) {
  return chromeExec("handleDialog", params);
}
