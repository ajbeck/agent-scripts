# Peekaboo Agent

AI-powered automation using natural language tasks.

## agent(options)

Execute complex multi-step tasks with AI.

```typescript
await peekaboo.agent({ task: "Open Safari and search for weather" });

await peekaboo.agent({
  task: "Fill out the contact form with test data",
  maxSteps: 10,
  model: "claude-opus-4-5",
});
```

| Param         | Type    | Description                                              |
| ------------- | ------- | -------------------------------------------------------- |
| task          | string  | Natural language task description                        |
| maxSteps      | number  | Maximum steps to execute (optional)                      |
| model         | string  | AI model: "gpt-5.1", "claude-opus-4-5", "gemini-3-flash" |
| resumeSession | string  | Resume previous session by ID                            |
| resume        | boolean | Resume last session                                      |
| dryRun        | boolean | Plan without executing                                   |
| quiet         | boolean | Suppress output                                          |
| listSessions  | boolean | List available sessions                                  |
| noCache       | boolean | Disable caching                                          |
| chat          | boolean | Interactive chat mode                                    |

## Example: Complex Automation

```typescript
// Let AI figure out the steps
await peekaboo.agent({
  task: "Open System Preferences, go to Desktop & Screen Saver, and set a 5 minute screen saver timeout",
  model: "claude-opus-4-5",
  maxSteps: 15,
});
```

## Example: Resume Session

```typescript
// Start a task
const result = await peekaboo.agent({
  task: "Open Mail and compose a new message",
});

// Resume if interrupted
await peekaboo.agent({ resume: true });

// List all sessions
await peekaboo.agent({ listSessions: true });
```

## When to Use

- Complex multi-step workflows that are hard to script
- Tasks where UI may vary (different app versions, etc.)
- Exploratory automation where exact steps are unknown
- Quick prototyping before writing explicit automation

## When to Use Explicit Automation Instead

- Predictable, repeatable workflows
- Performance-critical automation
- Tasks where you need precise control
- When you want deterministic behavior
