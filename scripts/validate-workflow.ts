#!/usr/bin/env bun

/**
 * GitHub Workflow Validator
 *
 * Validates GitHub Actions workflow YAML files against the official JSON schema.
 *
 * Usage:
 *   ./scripts/validate-workflow.ts <workflow.yml>
 *   ./scripts/validate-workflow.ts .github/workflows/ci.yml
 */

import Ajv from "ajv";
import addFormats from "ajv-formats";

const SCHEMA_URL =
  "https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/github-workflow.json";

function printHelp() {
  console.log(`
validate-workflow - Validate GitHub Actions workflow files

Usage:
  validate-workflow.ts <file.yml>

Arguments:
  <file.yml>    Path to GitHub workflow YAML file

Examples:
  ./scripts/validate-workflow.ts .github/workflows/ci.yml
  ./scripts/validate-workflow.ts workflow.yaml
`);
}

async function readWorkflow(filePath: string): Promise<unknown> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = await file.text();
  return Bun.YAML.parse(content);
}

async function fetchSchema(): Promise<unknown> {
  const response = await fetch(SCHEMA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch schema: ${response.status}`);
  }
  return response.json();
}

async function validate(workflow: unknown, schema: unknown): Promise<boolean> {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema as object);
  const valid = validate(workflow);

  if (!valid && validate.errors) {
    console.error(`\nValidation failed!\n`);
    for (const err of validate.errors) {
      console.error(`  Path: ${err.instancePath || "/"}`);
      console.error(`  Error: ${err.message}`);
      if (err.params) {
        console.error(`  Details: ${JSON.stringify(err.params)}`);
      }
      console.error("");
    }
  }
  return !!valid;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const filePath = args[0];
  const workflow = await readWorkflow(filePath);
  const schema = await fetchSchema();
  const valid = await validate(workflow, schema);

  if (valid) {
    console.log(`Valid workflow: ${filePath}`);
    process.exit(0);
  } else {
    console.error(`Invalid workflow: ${filePath}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
