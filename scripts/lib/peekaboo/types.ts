/**
 * Shared types for peekaboo commands
 */

/** Log level options */
export type LogLevel =
  | "trace"
  | "verbose"
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "critical";

/** Coordinates for mouse/element positioning */
export interface Coordinates {
  x: number;
  y: number;
}

/** Bounds including position and size */
export interface Bounds extends Coordinates {
  width: number;
  height: number;
}

/** Base targeting options for commands */
export interface TargetOptions {
  /** Application name, bundle ID, or 'PID:12345' */
  app?: string;
  /** Process ID */
  pid?: number;
  /** CoreGraphics window ID */
  windowId?: number;
  /** Window title (partial match) */
  windowTitle?: string;
  /** Window index (0-based) */
  windowIndex?: number;
  /** Snapshot ID from see command */
  snapshot?: string;
}

/** Focus options for interaction commands */
export interface FocusOptions extends TargetOptions {
  /** Disable automatic focus before interaction */
  noAutoFocus?: boolean;
  /** Switch to window's Space if on different Space */
  spaceSwitch?: boolean;
  /** Bring window to current Space instead of switching */
  bringToCurrentSpace?: boolean;
  /** Timeout for focus operations in seconds */
  focusTimeoutSeconds?: number;
  /** Number of retries for focus operations */
  focusRetryCount?: number;
}

/** Global runtime options */
export interface GlobalOptions {
  /** Enable verbose logging */
  verbose?: boolean;
  /** Log level */
  logLevel?: LogLevel;
  /** Force local execution */
  noRemote?: boolean;
  /** Override bridge socket path */
  bridgeSocket?: string;
}

/** UI Element from see command */
export interface UIElement {
  /** Element ID (e.g., B1, T2, S3) */
  id: string;
  /** Element type */
  type: string;
  /** Element label/text */
  label?: string;
  /** Element bounds */
  bounds?: Bounds;
  /** Center coordinates */
  center?: Coordinates;
}

/** Application info from list */
export interface AppInfo {
  name: string;
  bundleId?: string;
  pid: number;
  isActive?: boolean;
  isHidden?: boolean;
}

/** Window info from list */
export interface WindowInfo {
  title: string;
  windowId: number;
  bounds?: Bounds;
  isOnScreen?: boolean;
  index?: number;
}

/** Screen/display info */
export interface ScreenInfo {
  index: number;
  name?: string;
  bounds: Bounds;
  isMain?: boolean;
}

/** Movement profile for mouse operations */
export type MovementProfile = "linear" | "human";

/** Typing profile */
export type TypingProfile = "linear" | "human";

/** Capture mode for screenshots */
export type CaptureMode = "auto" | "screen" | "window" | "frontmost";

/** Capture engine */
export type CaptureEngine = "auto" | "classic" | "cg" | "modern" | "sckit";

/** Image format */
export type ImageFormat = "png" | "jpg";

/** Scroll direction */
export type ScrollDirection = "up" | "down" | "left" | "right";

/** Space action */
export type SpaceAction = "list" | "switch" | "move-window";

/** Window action */
export type WindowAction =
  | "close"
  | "minimize"
  | "maximize"
  | "move"
  | "resize"
  | "set-bounds"
  | "focus";

/** App action */
export type AppAction =
  | "launch"
  | "quit"
  | "relaunch"
  | "hide"
  | "unhide"
  | "switch"
  | "list";

/** Clipboard action */
export type ClipboardAction =
  | "get"
  | "set"
  | "clear"
  | "save"
  | "restore"
  | "load";

/** Dialog action */
export type DialogAction = "list" | "click" | "input" | "file" | "dismiss";

/** Menu action */
export type MenuAction = "list" | "list-all" | "click" | "click-extra";

/** Dock action */
export type DockAction = "launch" | "right-click" | "hide" | "show" | "list";
