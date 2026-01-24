# Chrome Performance

Performance tracing and analysis functions.

## startTrace(params?)

Start a performance trace recording.

```typescript
await chrome.startTrace();
await chrome.startTrace({ reload: true, autoStop: true });
```

| Param    | Type    | Description                                |
| -------- | ------- | ------------------------------------------ |
| reload   | boolean | Reload page when starting trace (optional) |
| autoStop | boolean | Auto-stop after page load (optional)       |

## stopTrace(params?)

Stop the active trace recording.

```typescript
await chrome.stopTrace();
await chrome.stopTrace({ filePath: "/tmp/trace.json.gz" });
```

| Param    | Type   | Description                   |
| -------- | ------ | ----------------------------- |
| filePath | string | Save trace to file (optional) |

## analyzeInsight(params)

Get detailed info on a specific performance insight.

```typescript
await chrome.analyzeInsight({
  insightSetId: "navigation-1",
  insightName: "LCPBreakdown",
});
```

| Param        | Type   | Description                |
| ------------ | ------ | -------------------------- |
| insightSetId | string | Insight set identifier     |
| insightName  | string | Name of insight to analyze |

## Example Workflow

```typescript
await chrome.withBrowser(async () => {
  await chrome.navigate({ url: "https://example.com" });
  await chrome.startTrace({ reload: true, autoStop: true });
  // Wait for trace to complete
  const insights = await chrome.stopTrace({ filePath: "/tmp/trace.json.gz" });
  // Analyze specific insights
  await chrome.analyzeInsight({
    insightSetId: "navigation-1",
    insightName: "LCPBreakdown",
  });
});
```
