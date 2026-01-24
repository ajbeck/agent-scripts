# Chrome Navigation

Page and tab management functions.

## navigate(params)

Navigate the selected page to a URL or perform navigation actions.

```typescript
await chrome.navigate({ url: "https://example.com" });
await chrome.navigate({ type: "back" });
await chrome.navigate({ type: "forward" });
await chrome.navigate({ type: "reload", ignoreCache: true });
```

| Param       | Type    | Description                       |
| ----------- | ------- | --------------------------------- |
| url         | string  | URL to navigate to                |
| type        | string  | "back", "forward", or "reload"    |
| ignoreCache | boolean | Bypass cache on reload (optional) |

## newPage(params)

Create a new page/tab and navigate to URL.

```typescript
const page = await chrome.newPage({ url: "https://google.com" });
```

| Param | Type   | Description             |
| ----- | ------ | ----------------------- |
| url   | string | URL to open in new page |

## closePage(params)

Close a page by ID.

```typescript
await chrome.closePage({ pageId: 1 });
```

| Param  | Type   | Description      |
| ------ | ------ | ---------------- |
| pageId | number | Page ID to close |

## listPages()

List all open pages/tabs with IDs, URLs, and titles.

```typescript
const { pages } = await chrome.listPages();
// pages: [{ id: 1, url: "...", title: "..." }, ...]
```

Returns array of page objects with id, url, title.

## selectPage(params)

Select a page as context for future tool calls.

```typescript
await chrome.selectPage({ pageId: 2 });
```

| Param  | Type   | Description       |
| ------ | ------ | ----------------- |
| pageId | number | Page ID to select |

## waitFor(params)

Wait for text to appear on the page.

```typescript
await chrome.waitFor({ text: "Loading complete" });
await chrome.waitFor({ text: "Success", timeout: 10000 });
```

| Param   | Type   | Description                    |
| ------- | ------ | ------------------------------ |
| text    | string | Text to wait for               |
| timeout | number | Timeout in ms (default: 30000) |
