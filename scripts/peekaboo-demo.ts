#!/usr/bin/env bun
/**
 * Peekaboo Demo Script
 *
 * Demonstrates common automation patterns with the peekaboo TypeScript interface.
 *
 * Usage:
 *   bun scripts/peekaboo-demo.ts [demo-name]
 *
 * Available demos:
 *   list       - List running apps, windows, screens
 *   screenshot - Capture a screenshot
 *   see        - Detect UI elements
 *   safari     - Launch Safari, navigate, screenshot
 *   clipboard  - Clipboard operations
 */

import { peekaboo } from "./lib";

const demos: Record<string, () => Promise<void>> = {
  /**
   * List running applications, windows, and screens
   */
  async list() {
    console.log("📋 Listing running applications...\n");
    const apps = await peekaboo.list.apps();
    if (apps.success && apps.data) {
      console.log("Running applications:", JSON.stringify(apps.data, null, 2));
    }

    console.log("\n📺 Listing screens...\n");
    const screens = await peekaboo.list.screens();
    if (screens.success && screens.data) {
      console.log("Screens:", JSON.stringify(screens.data, null, 2));
    }

    console.log("\n🔐 Checking permissions...\n");
    const perms = await peekaboo.list.permissions();
    if (perms.success && perms.data) {
      console.log("Permissions:", JSON.stringify(perms.data, null, 2));
    }
  },

  /**
   * Capture a screenshot of the frontmost window
   */
  async screenshot() {
    const outputPath = "/tmp/peekaboo-demo-screenshot.png";
    console.log(`📸 Capturing screenshot to ${outputPath}...\n`);

    const result = await peekaboo.image({
      mode: "frontmost",
      path: outputPath,
    });

    if (result.success) {
      console.log("Screenshot captured successfully!");
      console.log("Result:", JSON.stringify(result.data, null, 2));
    } else {
      console.error("Failed:", result.error);
    }
  },

  /**
   * Detect UI elements in the frontmost window
   */
  async see() {
    console.log("👀 Detecting UI elements in frontmost window...\n");

    const result = await peekaboo.see({
      annotate: true,
      path: "/tmp/peekaboo-demo-annotated.png",
    });

    if (result.success && result.data) {
      console.log("Snapshot ID:", result.data.snapshot_id);
      console.log("Elements found:", result.data.elements?.length || 0);
      console.log("\nFirst 10 elements:");
      result.data.elements?.slice(0, 10).forEach((el) => {
        console.log(`  ${el.id}: ${el.type} - "${el.label || "(no label)"}"`);
      });
      console.log("\nAnnotated image saved to: /tmp/peekaboo-demo-annotated.png");
    } else {
      console.error("Failed:", result.error);
    }
  },

  /**
   * Launch Safari, navigate to a URL, and take a screenshot
   */
  async safari() {
    console.log("🌐 Safari automation demo\n");

    // Launch Safari
    console.log("1. Launching Safari...");
    const launchResult = await peekaboo.app.launch({
      name: "Safari",
      waitUntilReady: true,
    });
    if (!launchResult.success) {
      console.error("Failed to launch Safari:", launchResult.error);
      return;
    }

    // Wait for Safari to be ready
    await peekaboo.sleep(1000);

    // Detect UI elements
    console.log("2. Detecting UI elements...");
    const seeResult = await peekaboo.see({ app: "Safari" });
    if (!seeResult.success) {
      console.error("Failed to see Safari UI:", seeResult.error);
      return;
    }

    // Open a new URL using hotkey + type
    console.log("3. Opening URL bar (Cmd+L)...");
    await peekaboo.hotkey({ keys: "cmd,l", app: "Safari" });
    await peekaboo.sleep(300);

    console.log("4. Typing URL...");
    await peekaboo.type({
      text: "https://example.com",
      return: true,
      app: "Safari",
    });

    // Wait for page to load
    console.log("5. Waiting for page to load...");
    await peekaboo.sleep(2000);

    // Take a screenshot
    console.log("6. Taking screenshot...");
    const screenshotResult = await peekaboo.image({
      app: "Safari",
      path: "/tmp/peekaboo-safari-demo.png",
    });

    if (screenshotResult.success) {
      console.log("\n✅ Demo complete!");
      console.log("Screenshot saved to: /tmp/peekaboo-safari-demo.png");
    } else {
      console.error("Screenshot failed:", screenshotResult.error);
    }
  },

  /**
   * Clipboard operations demo
   */
  async clipboard() {
    console.log("📋 Clipboard demo\n");

    // Save current clipboard
    console.log("1. Saving current clipboard...");
    await peekaboo.clipboard.save({ slot: "demo" });

    // Set new clipboard content
    console.log("2. Setting clipboard to 'Hello from Peekaboo!'...");
    await peekaboo.clipboard.set({ text: "Hello from Peekaboo!" });

    // Read it back
    console.log("3. Reading clipboard...");
    const readResult = await peekaboo.clipboard.get();
    if (readResult.success) {
      console.log("Clipboard content:", JSON.stringify(readResult.data, null, 2));
    }

    // Restore original clipboard
    console.log("4. Restoring original clipboard...");
    await peekaboo.clipboard.restore({ slot: "demo" });

    console.log("\n✅ Clipboard demo complete!");
  },
};

// Main
async function main() {
  const demoName = process.argv[2];

  if (!demoName || !demos[demoName]) {
    console.log("Peekaboo Demo Script\n");
    console.log("Usage: bun scripts/peekaboo-demo.ts [demo-name]\n");
    console.log("Available demos:");
    Object.keys(demos).forEach((name) => {
      console.log(`  ${name}`);
    });
    console.log("\nExample: bun scripts/peekaboo-demo.ts list");
    process.exit(1);
  }

  try {
    await demos[demoName]();
  } catch (error) {
    console.error("Demo failed:", error);
    process.exit(1);
  }
}

main();
