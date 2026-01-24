# Chrome Emulation

Device and network condition emulation.

## emulate(params)

Emulate device, viewport, network conditions, or geolocation.

```typescript
// Mobile viewport
await chrome.emulate({
  viewport: { width: 375, height: 812, isMobile: true, hasTouch: true },
});

// Network throttling
await chrome.emulate({ networkConditions: "Slow 3G" });
await chrome.emulate({ networkConditions: "Fast 3G" });
await chrome.emulate({ networkConditions: "Offline" });

// CPU throttling
await chrome.emulate({ cpuThrottlingRate: 4 });

// Geolocation
await chrome.emulate({
  geolocation: { latitude: 37.7749, longitude: -122.4194 },
});

// User agent
await chrome.emulate({ userAgent: "Custom User Agent String" });
```

| Param             | Type   | Description                                              |
| ----------------- | ------ | -------------------------------------------------------- |
| viewport          | object | { width, height, isMobile, hasTouch, deviceScaleFactor } |
| networkConditions | string | "Slow 3G", "Fast 3G", "Offline"                          |
| cpuThrottlingRate | number | CPU slowdown multiplier (e.g., 4 = 4x slower)            |
| geolocation       | object | { latitude, longitude, accuracy }                        |
| userAgent         | string | Custom user agent string                                 |

## resize(params)

Resize the page viewport.

```typescript
await chrome.resize({ width: 1920, height: 1080 });
await chrome.resize({ width: 768, height: 1024 });
```

| Param  | Type   | Description               |
| ------ | ------ | ------------------------- |
| width  | number | Viewport width in pixels  |
| height | number | Viewport height in pixels |

## Example: Mobile Testing

```typescript
await chrome.withBrowser(async () => {
  // iPhone 13 viewport
  await chrome.emulate({
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...",
  });
  await chrome.navigate({ url: "https://example.com" });
  await chrome.screenshot({ filePath: "/tmp/mobile.png" });
});
```
