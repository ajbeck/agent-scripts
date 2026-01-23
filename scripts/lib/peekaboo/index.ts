/**
 * Peekaboo TypeScript Interface
 *
 * Usage:
 *   import { peekaboo } from "./scripts";
 *
 *   // Take a screenshot
 *   await peekaboo.image({ path: "/tmp/screenshot.png" });
 *
 *   // Detect UI elements
 *   const { data } = await peekaboo.see({ annotate: true });
 *
 *   // Click on an element
 *   await peekaboo.click({ on: "B1" });
 *
 *   // Launch an app
 *   await peekaboo.app.launch({ name: "Safari" });
 */

// Base exports
export { exec, peekabooExec, peekabooExecRaw, type PeekabooResult } from "./base";

// Type exports
export * from "./types";

// Module imports
import { image } from "./image";
import { see } from "./see";
import { click } from "./click";
import { type as typeInput } from "./input";
import { hotkey } from "./hotkey";
import { press } from "./press";
import { scroll } from "./scroll";
import { move } from "./move";
import { drag } from "./drag";
import { paste } from "./paste";
import { app } from "./app";
import { window } from "./window";
import { clipboard } from "./clipboard";
import { menu } from "./menu";
import { dialog } from "./dialog";
import { dock } from "./dock";
import { space } from "./space";
import { open } from "./open";
import { agent } from "./agent";
import { list } from "./list";
import { peekabooExec } from "./base";

/**
 * Sleep for a specified duration
 */
async function sleep(ms: number) {
  return peekabooExec("sleep", [String(ms)]);
}

/**
 * Peekaboo namespace - macOS automation interface
 */
export const peekaboo = {
  // Core
  image,
  see,
  list,
  sleep,

  // Interaction
  click,
  type: typeInput,
  hotkey,
  press,
  scroll,
  move,
  drag,
  paste,

  // System
  app,
  window,
  clipboard,
  menu,
  dialog,
  dock,
  open,
  space,

  // AI
  agent,
};

// Export individual modules for direct access
export { image } from "./image";
export { see } from "./see";
export { click } from "./click";
export { type } from "./input";
export { hotkey } from "./hotkey";
export { press } from "./press";
export { scroll } from "./scroll";
export { move } from "./move";
export { drag } from "./drag";
export { paste } from "./paste";
export { app } from "./app";
export { window } from "./window";
export { clipboard } from "./clipboard";
export { menu } from "./menu";
export { dialog } from "./dialog";
export { dock } from "./dock";
export { space } from "./space";
export { open } from "./open";
export { agent } from "./agent";
export { list } from "./list";
