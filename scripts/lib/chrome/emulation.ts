/**
 * Chrome DevTools Emulation
 *
 * Tools for device and network emulation
 */

import { chromeExec } from "./base";
import type { EmulateParams, ResizePageParams } from "./types";

/**
 * Emulate various device/network conditions
 * @example emulate({ networkConditions: "Slow 3G" })
 * @example emulate({ viewport: { width: 375, height: 812, isMobile: true } })
 * @example emulate({ geolocation: { latitude: 37.7749, longitude: -122.4194 } })
 */
export async function emulate(params: EmulateParams) {
  return chromeExec("emulate", params);
}

/**
 * Resize the page viewport
 */
export async function resize(params: ResizePageParams) {
  return chromeExec("resizePage", params);
}
