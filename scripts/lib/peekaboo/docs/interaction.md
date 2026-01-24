# Peekaboo Interaction

Click, type, keyboard, and mouse functions.

## click(options?)

Click on UI elements, text, or coordinates.

```typescript
await peekaboo.click({ on: "B1" }); // Element ID from see()
await peekaboo.click({ query: "Submit" }); // Click text
await peekaboo.click({ coords: { x: 100, y: 200 } });
await peekaboo.click({ on: "B1", double: true });
await peekaboo.click({ on: "B1", right: true });
```

| Param   | Type    | Description             |
| ------- | ------- | ----------------------- |
| on / id | string  | Element ID from see()   |
| query   | string  | Text to find and click  |
| coords  | object  | { x, y } coordinates    |
| double  | boolean | Double-click            |
| right   | boolean | Right-click             |
| waitFor | number  | Wait ms before clicking |

## type(options)

Type text or send keyboard commands.

```typescript
await peekaboo.type({ text: "Hello world" });
await peekaboo.type({ text: "Hello", delay: 50 }); // 50ms between keys
await peekaboo.type({ text: "Hello", profile: "human", wpm: 60 });
```

| Param   | Type   | Description                        |
| ------- | ------ | ---------------------------------- |
| text    | string | Text to type                       |
| delay   | number | Delay between keystrokes (ms)      |
| profile | string | "linear" or "human"                |
| wpm     | number | Words per minute for human profile |

## hotkey(options)

Press keyboard shortcuts and combinations.

```typescript
await peekaboo.hotkey({ keys: ["cmd", "c"] }); // Copy
await peekaboo.hotkey({ keys: ["cmd", "shift", "t"] }); // Reopen tab
await peekaboo.hotkey({ keys: ["cmd", "space"] }); // Spotlight
```

| Param        | Type   | Description                                             |
| ------------ | ------ | ------------------------------------------------------- |
| keys         | array  | Key names: "cmd", "ctrl", "alt", "shift", letters, etc. |
| holdDuration | number | Hold duration (ms)                                      |

## press(options)

Press individual keys or key sequences.

```typescript
await peekaboo.press({ keys: "return" });
await peekaboo.press({ keys: ["tab", "tab", "return"] });
await peekaboo.press({ keys: "down", count: 5 });
```

| Param | Type         | Description                |
| ----- | ------------ | -------------------------- |
| keys  | string/array | Key name(s)                |
| count | number       | Repeat count               |
| delay | number       | Delay between presses (ms) |
| hold  | number       | Hold duration (ms)         |

## scroll(options)

Scroll content in any direction.

```typescript
await peekaboo.scroll({ direction: "down", amount: 3 });
await peekaboo.scroll({ direction: "up", on: "ScrollView1" });
await peekaboo.scroll({ direction: "down", smooth: true });
```

| Param     | Type    | Description                   |
| --------- | ------- | ----------------------------- |
| direction | string  | "up", "down", "left", "right" |
| amount    | number  | Scroll amount (wheel clicks)  |
| on        | string  | Element ID to scroll within   |
| smooth    | boolean | Smooth scrolling              |
| delay     | number  | Delay between scroll steps    |

## move(options?)

Move mouse cursor to coordinates or elements.

```typescript
await peekaboo.move({ coords: { x: 500, y: 300 } });
await peekaboo.move({ to: "Submit Button" });
await peekaboo.move({ id: "B1", profile: "human" });
```

| Param    | Type   | Description                 |
| -------- | ------ | --------------------------- |
| coords   | object | { x, y } target coordinates |
| to       | string | Text to move to             |
| id       | string | Element ID to move to       |
| duration | number | Move duration (ms)          |
| profile  | string | "linear" or "human"         |

## drag(options)

Drag and drop operations.

```typescript
await peekaboo.drag({ from: "item", to: "folder" });
await peekaboo.drag({
  fromCoords: { x: 100, y: 100 },
  toCoords: { x: 300, y: 300 },
});
await peekaboo.drag({ from: "file.txt", toApp: "Trash" });
```

| Param      | Type   | Description                     |
| ---------- | ------ | ------------------------------- |
| from       | string | Source element text             |
| fromCoords | object | Source { x, y }                 |
| to         | string | Target element text             |
| toCoords   | object | Target { x, y }                 |
| toApp      | string | Target app (e.g., "Trash")      |
| duration   | number | Drag duration (ms)              |
| modifiers  | array  | Hold keys: "cmd", "shift", etc. |

## paste(options)

Set clipboard content and paste.

```typescript
await peekaboo.paste({ text: "Hello world" });
await peekaboo.paste({ filePath: "/path/to/file.txt" });
await peekaboo.paste({ imagePath: "/path/to/image.png" });
```

| Param      | Type   | Description             |
| ---------- | ------ | ----------------------- |
| text       | string | Text to paste           |
| filePath   | string | File to paste           |
| imagePath  | string | Image to paste          |
| dataBase64 | string | Base64 data to paste    |
| uti        | string | Content type identifier |
