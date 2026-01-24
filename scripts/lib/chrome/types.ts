/**
 * Chrome DevTools MCP Type Definitions
 *
 * Types for the 26 tools provided by chrome-devtools-mcp
 */

// Result type from mcporter calls
export interface ChromeResult<T = unknown> {
  content: string;
  data?: T;
  snapshot?: string;
  image?: { mimeType: string; data: string };
}

// Input Automation Types
export interface ClickParams {
  uid: string;
  dblClick?: boolean;
  includeSnapshot?: boolean;
}

export interface HoverParams {
  uid: string;
  includeSnapshot?: boolean;
}

export interface FillParams {
  uid: string;
  value: string;
  includeSnapshot?: boolean;
}

export interface FillFormParams {
  elements: Array<{ uid: string; value: string }>;
  includeSnapshot?: boolean;
}

export interface DragParams {
  from_uid: string;
  to_uid: string;
  includeSnapshot?: boolean;
}

export interface PressKeyParams {
  key: string; // e.g., "Enter", "Control+A", "Control+Shift+R"
  includeSnapshot?: boolean;
}

export interface UploadFileParams {
  uid: string;
  filePath: string;
  includeSnapshot?: boolean;
}

export interface HandleDialogParams {
  action: "accept" | "dismiss";
  promptText?: string;
}

// Navigation Types
export interface ListPagesResult {
  pages: Array<{ id: number; url: string; title: string }>;
}

export interface SelectPageParams {
  pageId: number;
  bringToFront?: boolean;
}

export interface NewPageParams {
  url: string;
  timeout?: number;
}

export interface NavigatePageParams {
  type?: "url" | "back" | "forward" | "reload";
  url?: string;
  ignoreCache?: boolean;
  handleBeforeUnload?: "accept" | "decline";
  timeout?: number;
}

export interface ClosePageParams {
  pageId: number;
}

export interface WaitForParams {
  text: string;
  timeout?: number;
}

// Emulation Types
export type NetworkCondition =
  | "No emulation"
  | "Offline"
  | "Slow 3G"
  | "Fast 3G"
  | "Slow 4G"
  | "Fast 4G";

export interface ViewportParams {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  isLandscape?: boolean;
}

export interface GeolocationParams {
  latitude: number;
  longitude: number;
}

export interface EmulateParams {
  networkConditions?: NetworkCondition;
  cpuThrottlingRate?: number; // 1-20
  geolocation?: GeolocationParams | null;
  userAgent?: string | null;
  viewport?: ViewportParams | null;
}

export interface ResizePageParams {
  width: number;
  height: number;
}

// Performance Types
export interface PerformanceStartTraceParams {
  reload: boolean;
  autoStop: boolean;
  filePath?: string;
}

export interface PerformanceStopTraceParams {
  filePath?: string;
}

export interface PerformanceAnalyzeInsightParams {
  insightSetId: string;
  insightName: string;
}

// Network Types
export type ResourceType =
  | "document"
  | "stylesheet"
  | "image"
  | "media"
  | "font"
  | "script"
  | "texttrack"
  | "xhr"
  | "fetch"
  | "prefetch"
  | "eventsource"
  | "websocket"
  | "manifest"
  | "signedexchange"
  | "ping"
  | "cspviolationreport"
  | "preflight"
  | "fedcm"
  | "other";

export interface ListNetworkRequestsParams {
  pageSize?: number;
  pageIdx?: number;
  resourceTypes?: ResourceType[];
  includePreservedRequests?: boolean;
}

export interface GetNetworkRequestParams {
  reqid?: number;
  requestFilePath?: string;
  responseFilePath?: string;
}

// Debugging Types
export interface TakeSnapshotParams {
  verbose?: boolean;
  filePath?: string;
}

export interface TakeScreenshotParams {
  format?: "png" | "jpeg" | "webp";
  quality?: number; // 0-100 for jpeg/webp
  uid?: string;
  fullPage?: boolean;
  filePath?: string;
}

export interface EvaluateScriptParams {
  function: string;
  args?: Array<{ uid: string }>;
}

export type ConsoleMessageType =
  | "log"
  | "debug"
  | "info"
  | "error"
  | "warn"
  | "dir"
  | "dirxml"
  | "table"
  | "trace"
  | "clear"
  | "startGroup"
  | "startGroupCollapsed"
  | "endGroup"
  | "assert"
  | "profile"
  | "profileEnd"
  | "count"
  | "timeEnd"
  | "verbose"
  | "issue";

export interface ListConsoleMessagesParams {
  pageSize?: number;
  pageIdx?: number;
  types?: ConsoleMessageType[];
  includePreservedMessages?: boolean;
}

export interface GetConsoleMessageParams {
  msgid: number;
}
