/**
 * Terminal UI Development Convenience Functions
 *
 * Workflows for testing and developing terminal-based user interfaces
 * using Peekaboo for visual inspection and interaction.
 */

import {
  peekaboo,
  captureForReview,
  withFocusPreservation,
  detectElements,
  clickElement,
  type UIElement,
  type SeeData,
} from "../peekaboo";

// Common terminal emulator app names
const TERMINAL_APPS = [
  "ghostty",
  "iTerm2",
  "Terminal",
  "Alacritty",
  "kitty",
  "Hyper",
  "Warp",
];

/**
 * Detect which terminal emulator is frontmost
 */
async function detectTerminal(): Promise<string | null> {
  try {
    const result =
      await Bun.$`osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`.quiet();
    const frontmost = result.stdout.toString().trim();

    // Check if frontmost is a known terminal
    if (TERMINAL_APPS.some((t) => frontmost.toLowerCase().includes(t.toLowerCase()))) {
      return frontmost;
    }

    // Check if running inside VS Code terminal
    if (frontmost === "Code") {
      return "Code";
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Capture terminal window for review
 *
 * @example
 * const capture = await captureTerminal();
 * // Review capture.path
 * await capture.cleanup();
 *
 * @example
 * const capture = await captureTerminal({ app: "iTerm2" });
 */
export async function captureTerminal(options?: {
  app?: string;
  preserveFocus?: boolean;
}): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const { preserveFocus = true } = options || {};
  let app = options?.app;

  // Auto-detect terminal if not specified
  if (!app) {
    app = (await detectTerminal()) || "Terminal";
  }

  return captureForReview({ app, preserveFocus });
}

/**
 * Interactive TUI testing session
 *
 * @example
 * await testTUI({ app: "ghostty" }, async (session) => {
 *   await session.type("vim test.txt");
 *   await session.press("Return");
 *   await session.screenshot("/tmp/vim.png");
 * });
 */
export async function testTUI<T>(
  params: { app?: string },
  fn: (session: TUISession) => Promise<T>
): Promise<T> {
  let app = params.app;

  // Auto-detect terminal if not specified
  if (!app) {
    app = (await detectTerminal()) || "Terminal";
  }

  return withFocusPreservation(async () => {
    // Focus the terminal
    await Bun.$`osascript -e 'tell application "${app}" to activate'`.quiet();
    await new Promise((resolve) => setTimeout(resolve, 200));

    const session = new TUISession(app!);
    return fn(session);
  });
}

/**
 * TUI testing session providing terminal interaction methods
 */
class TUISession {
  private app: string;

  constructor(app: string) {
    this.app = app;
  }

  /**
   * Type text into the terminal
   */
  async type(text: string): Promise<void> {
    await peekaboo.type({ text, app: this.app });
  }

  /**
   * Press a special key (Return, Escape, Tab, Arrow keys, etc.)
   */
  async press(key: string): Promise<void> {
    await peekaboo.press({ key, app: this.app });
  }

  /**
   * Press a keyboard shortcut
   * @example hotkey(["Control", "c"]) // Ctrl+C
   * @example hotkey(["Command", "k"]) // Cmd+K
   */
  async hotkey(keys: string[]): Promise<void> {
    await peekaboo.hotkey({ keys, app: this.app });
  }

  /**
   * Take screenshot of the terminal
   */
  async screenshot(filePath: string): Promise<void> {
    await peekaboo.image({ path: filePath, app: this.app });
  }

  /**
   * Detect UI elements in the terminal (OCR-based)
   */
  async detectElements(): Promise<SeeData> {
    return detectElements({ app: this.app });
  }

  /**
   * Click an element by ID
   */
  async clickElement(elementId: string): Promise<void> {
    await clickElement(elementId);
  }

  /**
   * Click at coordinates relative to terminal window
   */
  async clickAt(x: number, y: number): Promise<void> {
    await peekaboo.click({ coords: { x, y }, app: this.app });
  }

  /**
   * Scroll in the terminal
   */
  async scroll(
    direction: "up" | "down",
    amount: number = 3
  ): Promise<void> {
    await peekaboo.scroll({ direction, amount, app: this.app });
  }

  /**
   * Sleep for specified milliseconds
   */
  async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get the terminal app name
   */
  getApp(): string {
    return this.app;
  }
}

/**
 * Run a command in terminal and capture result
 *
 * @example
 * const result = await runAndCapture("ls -la", { app: "ghostty" });
 * // Review result.path
 * await result.cleanup();
 */
export async function runAndCapture(
  command: string,
  options?: { app?: string; waitMs?: number }
): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const { waitMs = 1000 } = options || {};
  let app = options?.app;

  if (!app) {
    app = (await detectTerminal()) || "Terminal";
  }

  return withFocusPreservation(async () => {
    // Focus terminal
    await Bun.$`osascript -e 'tell application "${app}" to activate'`.quiet();
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Type and run command
    await peekaboo.type({ text: command, app });
    await peekaboo.press({ key: "Return", app });

    // Wait for output
    await new Promise((resolve) => setTimeout(resolve, waitMs));

    // Capture result
    return captureForReview({ app, preserveFocus: false });
  });
}

/**
 * TUI development namespace
 */
export const tui = {
  captureTerminal,
  testTUI,
  runAndCapture,
  detectTerminal,
};
