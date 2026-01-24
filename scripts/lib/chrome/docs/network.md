# Chrome Network

Network request inspection functions.

## listRequests(params?)

List all network requests since last navigation.

```typescript
const requests = await chrome.listRequests();
const apiCalls = await chrome.listRequests({ resourceTypes: ["fetch", "xhr"] });
```

| Param         | Type  | Description                                                                        |
| ------------- | ----- | ---------------------------------------------------------------------------------- |
| resourceTypes | array | Filter by type: "fetch", "xhr", "document", "stylesheet", "image", etc. (optional) |

Returns array of request objects with id, url, method, status, type.

## getRequest(params)

Get details of a specific network request with response data.

```typescript
const details = await chrome.getRequest({ reqid: 5 });
await chrome.getRequest({ reqid: 5, responseFilePath: "/tmp/response.json" });
```

| Param            | Type   | Description                           |
| ---------------- | ------ | ------------------------------------- |
| reqid            | number | Request ID from listRequests          |
| responseFilePath | string | Save response body to file (optional) |

Returns request details including headers, timing, and response body.

## Example Workflow

```typescript
await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://api.example.com" });
  await chrome.waitFor({ text: "Loaded" });

  // List all API calls
  const apiCalls = await chrome.listRequests({
    resourceTypes: ["fetch", "xhr"],
  });

  // Get details of specific request
  for (const req of apiCalls) {
    const details = await chrome.getRequest({ reqid: req.id });
    console.log(req.url, details.status);
  }
});
```
