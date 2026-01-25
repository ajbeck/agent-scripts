---
name: tui-dev-assist
description: Workflow for terminal UI (TUI) development using Peekaboo. Use when testing CLI apps, TUI interfaces, or terminal-based applications.
source: agent-scripts
version: "0.6.0"
disable-model-invocation: true
---

# Terminal UI Development Assistant

Workflow for developing and testing terminal-based user interfaces (TUIs) using **Peekaboo** for visual inspection and interaction.

## When to Use This Skill

Invoke `/tui-dev-assist` when:

- Testing terminal UI applications (ncurses, blessed, ink, etc.)
- Debugging CLI tool output formatting
- Automating terminal application interactions
- Visual regression testing for TUI components
- Testing keyboard navigation in terminal apps

## Quick Start

```typescript
import { tui } from "./agent-scripts";

// Capture terminal for review
const capture = await tui.captureTerminal();
// Review capture.path to see terminal state
await capture.cleanup();

// Capture specific terminal app
const capture = await tui.captureTerminal({ app: "ghostty" });

// Interactive TUI testing
await tui.testTUI({ app: "ghostty" }, async (session) => {
  await session.type("vim test.txt");
  await session.press("Return");
  await session.sleep(500);
  await session.screenshot("/tmp/vim.png");
  await session.hotkey(["Escape"]);
  await session.type(":q!");
  await session.press("Return");
});
```

## Tool Selection Guide

| Task                | Method                     | Notes                          |
| ------------------- | -------------------------- | ------------------------------ |
| Screenshot terminal | `captureTerminal()`        | Captures terminal window       |
| Type text           | `session.type()`           | Sends keystrokes               |
| Press special key   | `session.press()`          | Enter, Escape, Tab, Arrow keys |
| Keyboard shortcut   | `session.hotkey()`         | Ctrl+C, Cmd+K, etc.            |
| Detect UI elements  | `session.detectElements()` | OCR-based element detection    |
| Click UI element    | `session.click()`          | For mouse-enabled TUIs         |

## Workflows

### 1. Capture Terminal for Review

```typescript
import { tui } from "./agent-scripts";

// Capture the frontmost terminal
const capture = await tui.captureTerminal();
// Review capture.path to see terminal state
await capture.cleanup();

// Capture specific terminal emulator
const capture = await tui.captureTerminal({ app: "iTerm2" });
```

### 2. Test TUI Application

```typescript
import { tui } from "./agent-scripts";

await tui.testTUI({ app: "ghostty" }, async (session) => {
  // Launch a TUI app
  await session.type("htop");
  await session.press("Return");
  await session.sleep(1000);

  // Take screenshot
  await session.screenshot("/tmp/htop.png");

  // Navigate with keyboard
  await session.press("Down");
  await session.press("Down");

  // Quit
  await session.type("q");
});
```

### 3. Test Vim/Neovim

```typescript
import { tui } from "./agent-scripts";

await tui.testTUI({ app: "ghostty" }, async (session) => {
  // Open vim
  await session.type("vim test.txt");
  await session.press("Return");
  await session.sleep(500);

  // Enter insert mode
  await session.type("i");
  await session.type("Hello, World!");

  // Exit insert mode
  await session.press("Escape");

  // Save and quit
  await session.type(":wq");
  await session.press("Return");

  // Verify file was created
  await session.type("cat test.txt");
  await session.press("Return");
  await session.screenshot("/tmp/vim-result.png");
});
```

### 4. Test Interactive CLI

```typescript
import { tui } from "./agent-scripts";

await tui.testTUI({ app: "ghostty" }, async (session) => {
  // Run interactive CLI
  await session.type("npm init");
  await session.press("Return");
  await session.sleep(500);

  // Answer prompts
  await session.type("my-package"); // package name
  await session.press("Return");
  await session.press("Return"); // version (default)
  await session.type("A test package"); // description
  await session.press("Return");

  // Screenshot the prompts
  await session.screenshot("/tmp/npm-init.png");

  // Cancel
  await session.hotkey(["Control", "c"]);
});
```

### 5. Test Mouse-Enabled TUI

```typescript
import { tui } from "./agent-scripts";

await tui.testTUI({ app: "ghostty" }, async (session) => {
  // Launch mouse-enabled TUI
  await session.type("lazygit");
  await session.press("Return");
  await session.sleep(1000);

  // Detect clickable elements
  const elements = await session.detectElements();
  console.log("Found elements:", elements.elementCount);

  // Find and click a button
  const stageBtn = elements.elements.find((e) =>
    e.label?.toLowerCase().includes("stage"),
  );
  if (stageBtn) {
    await session.clickElement(stageBtn.id);
  }

  await session.screenshot("/tmp/lazygit.png");

  // Quit
  await session.type("q");
});
```

### 6. Visual Regression Testing

```typescript
import { tui } from "./agent-scripts";

// Take baseline screenshots at different states
await tui.testTUI({ app: "ghostty" }, async (session) => {
  await session.type("./my-tui-app");
  await session.press("Return");
  await session.sleep(500);

  // Capture different states
  await session.screenshot("/tmp/tui-initial.png");

  await session.press("Tab");
  await session.screenshot("/tmp/tui-tab1.png");

  await session.press("Tab");
  await session.screenshot("/tmp/tui-tab2.png");

  await session.hotkey(["Control", "c"]);
});
```

## Terminal Emulator Support

| Terminal         | App Name    | Notes               |
| ---------------- | ----------- | ------------------- |
| Ghostty          | `ghostty`   | Recommended         |
| iTerm2           | `iTerm2`    | Full support        |
| Terminal.app     | `Terminal`  | macOS built-in      |
| Alacritty        | `Alacritty` | GPU-accelerated     |
| Kitty            | `kitty`     | GPU-accelerated     |
| VS Code Terminal | `Code`      | Integrated terminal |

## Common Key Names

For `session.press()` and `session.hotkey()`:

| Key          | Name            |
| ------------ | --------------- |
| Enter/Return | `Return`        |
| Escape       | `Escape`        |
| Tab          | `Tab`           |
| Backspace    | `Delete`        |
| Delete       | `ForwardDelete` |
| Arrow Up     | `Up`            |
| Arrow Down   | `Down`          |
| Arrow Left   | `Left`          |
| Arrow Right  | `Right`         |
| Space        | `Space`         |
| Control      | `Control`       |
| Option/Alt   | `Option`        |
| Command      | `Command`       |

## Source Files

- `agent-scripts/lib/tui/index.ts` - TUI convenience functions
- `agent-scripts/lib/peekaboo/` - Peekaboo macOS functions

## Related Skills

- `/peekaboo-macos` - Full Peekaboo API reference
