# Peekaboo System Control

App, window, clipboard, menu, dialog, dock, and space management.

## app

Application lifecycle control.

```typescript
await peekaboo.app.launch({ name: "Safari" });
await peekaboo.app.launch({ name: "Safari", open: "https://example.com" });
await peekaboo.app.quit({ app: "Safari" });
await peekaboo.app.quit({ all: true, except: ["Finder"] });
await peekaboo.app.switch({ to: "Safari" });
await peekaboo.app.hide("Safari");
await peekaboo.app.unhide("Safari");
await peekaboo.app.list();
await peekaboo.app.relaunch({ name: "Safari" });
```

| Function    | Description                         |
| ----------- | ----------------------------------- |
| launch      | Start app, optionally open URL/file |
| quit        | Close app(s), with force option     |
| switch      | Switch to app or cycle (Cmd+Tab)    |
| hide/unhide | Show/hide app                       |
| list        | List running apps                   |
| relaunch    | Quit and restart app                |

## window

Window manipulation.

```typescript
await peekaboo.window.focus({ app: "Safari" });
await peekaboo.window.minimize({ app: "Safari" });
await peekaboo.window.maximize({ app: "Safari" });
await peekaboo.window.close({ app: "Safari" });
await peekaboo.window.move({ app: "Safari", x: 100, y: 100 });
await peekaboo.window.resize({ app: "Safari", width: 1200, height: 800 });
await peekaboo.window.setBounds({
  app: "Safari",
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
});
await peekaboo.window.list("Safari");
```

## clipboard

Clipboard operations.

```typescript
const content = await peekaboo.clipboard.get();
await peekaboo.clipboard.set({ text: "Hello" });
await peekaboo.clipboard.set({ filePath: "/path/to/file" });
await peekaboo.clipboard.clear();
await peekaboo.clipboard.save(); // Save to slot
await peekaboo.clipboard.restore(); // Restore from slot
```

## menu

Application menu interaction.

```typescript
const menus = await peekaboo.menu.list({ app: "Safari" });
await peekaboo.menu.click({ app: "Safari", path: "File > New Window" });
await peekaboo.menu.clickExtra({ title: "Wi-Fi" }); // Menu bar icons
```

## dialog

System dialog handling.

```typescript
const elements = await peekaboo.dialog.list();
await peekaboo.dialog.click({ button: "OK" });
await peekaboo.dialog.input({ text: "filename.txt", field: "Save As" });
await peekaboo.dialog.file({
  path: "/Users/me/Documents",
  name: "file.txt",
  select: "Save",
});
await peekaboo.dialog.dismiss();
await peekaboo.dialog.dismiss({ force: true }); // Use Escape
```

## dock

macOS Dock interaction.

```typescript
await peekaboo.dock.launch("Safari");
await peekaboo.dock.rightClick({ app: "Safari", select: "Options" });
await peekaboo.dock.hide();
await peekaboo.dock.show();
const items = await peekaboo.dock.list();
```

## open

Open URLs and files.

```typescript
await peekaboo.open({ target: "https://example.com" });
await peekaboo.open({ target: "/path/to/file.pdf" });
await peekaboo.open({ target: "https://example.com", app: "Firefox" });
```

## space

macOS Spaces (virtual desktops).

```typescript
const spaces = await peekaboo.space.list();
await peekaboo.space.switch({ to: 2 });
await peekaboo.space.moveWindow({ app: "Safari", to: 3 });
await peekaboo.space.moveWindow({ app: "Safari", toCurrent: true });
```
