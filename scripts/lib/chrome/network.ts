/**
 * Chrome DevTools Network
 *
 * Tools for network request inspection
 */

import { chromeExec } from "./base";
import type {
  ListNetworkRequestsParams,
  GetNetworkRequestParams,
} from "./types";

/**
 * List all network requests since last navigation
 * @example listRequests({ resourceTypes: ["fetch", "xhr"] })
 * @example listRequests({ pageSize: 20, pageIdx: 0 })
 */
export async function listRequests(params: ListNetworkRequestsParams = {}) {
  return chromeExec("listNetworkRequests", params);
}

/**
 * Get details of a specific network request
 * @example getRequest({ reqid: 5 })
 * @example getRequest({ reqid: 5, responseFilePath: "/tmp/response.json" })
 */
export async function getRequest(params: GetNetworkRequestParams = {}) {
  return chromeExec("getNetworkRequest", params);
}
