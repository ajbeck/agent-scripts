/**
 * ACLI utility functions
 */

/**
 * Execute a function with a temporary JSON file, cleaning up afterward.
 *
 * @param data - Data to write to the temp file
 * @param fn - Function to execute with the temp file path
 * @returns Result of the function
 */
export async function withTempJson<T>(
  data: unknown,
  fn: (path: string) => Promise<T>
): Promise<T> {
  const tmpPath = `/tmp/acli-${Date.now()}.json`;
  await Bun.write(tmpPath, JSON.stringify(data));
  try {
    return await fn(tmpPath);
  } finally {
    await Bun.$`rm -f ${tmpPath}`.quiet();
  }
}
