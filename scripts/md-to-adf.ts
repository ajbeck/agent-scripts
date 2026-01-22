#!/usr/bin/env bun

import { markdownToAdf } from "./lib/md-to-adf";

// Parse CLI args
const args = process.argv.slice(2);
let markdown = "";

const inputFlagIndex = args.findIndex((a) => a === "--input" || a === "-i");
if (inputFlagIndex !== -1 && args[inputFlagIndex + 1]) {
  markdown = await Bun.file(args[inputFlagIndex + 1]).text();
} else if (!process.stdin.isTTY) {
  markdown = await Bun.stdin.text();
} else {
  console.error("Usage: md-to-adf [--input <file>] or pipe markdown via stdin");
  console.error("  echo '# Hello' | md-to-adf");
  console.error("  md-to-adf --input README.md");
  process.exit(1);
}

const adf = markdownToAdf(markdown);
console.log(JSON.stringify(adf, null, 2));
