/**
 * Chrome DevTools Performance
 *
 * Tools for performance tracing and analysis
 */

import { chromeExec } from "./base";
import type {
  PerformanceStartTraceParams,
  PerformanceStopTraceParams,
  PerformanceAnalyzeInsightParams,
} from "./types";

/**
 * Start a performance trace recording
 * @example startTrace({ reload: true, autoStop: true })
 * @example startTrace({ reload: true, autoStop: false, filePath: "/tmp/trace.json.gz" })
 */
export async function startTrace(params: PerformanceStartTraceParams) {
  return chromeExec("performanceStartTrace", params);
}

/**
 * Stop the active trace recording
 */
export async function stopTrace(params: PerformanceStopTraceParams = {}) {
  return chromeExec("performanceStopTrace", params);
}

/**
 * Get detailed info on a specific performance insight
 * @example analyzeInsight({ insightSetId: "navigation-1", insightName: "LCPBreakdown" })
 */
export async function analyzeInsight(params: PerformanceAnalyzeInsightParams) {
  return chromeExec("performanceAnalyzeInsight", params);
}
