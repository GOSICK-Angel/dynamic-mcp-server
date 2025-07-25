# Extending the Server: Creating Handler & Tool Packages

This guide explains how to extend the Dynamic MCP Server by creating handler and tool packages. It covers the relationship between tools and handlers, how to group them, and best practices for extensibility.

---

## 1. What is a Tool?

A **Tool** is a JSON definition that describes a capability your server exposes. It includes:

### Tool Definition Fields (Detailed)

| Field            | Type     | Required | Description                                                                                     |
| ---------------- | -------- | -------- | ----------------------------------------------------------------------------------------------- |
| `name`           | string   | Yes      | Unique identifier for the tool. Used to reference and invoke the tool.                          |
| `description`    | string   | Yes      | Short, human-readable summary of what the tool does.                                            |
| `inputSchema`    | object   | Yes      | JSON Schema describing the expected input arguments for the tool.                               |
| `handler`        | object   | Yes      | Specifies which handler package and config to use for execution.                                |
| `rolesPermitted` | string[] | No       | Array of user roles allowed to access this tool. Omit or set to `[]` for internal/hidden tools. |
| `annotations`    | object   | No       | Optional metadata for UI, documentation, or hints.                                              |
| `creator`        | string   | No       | Who created the tool (app name or user email). Defaults to the server name if omitted.          |

#### Example Tool Definition

```js
{
  name: "add",
  description: "Add two numbers",
  inputSchema: {
    type: "object",
    properties: {
      a: { type: "number", description: "First number" },
      b: { type: "number", description: "Second number" }
    },
    required: ["a", "b"]
  },
  handler: { type: "math-tools", config: {} },
  rolesPermitted: ["user", "admin"],
  annotations: { title: "Addition Tool" },
  creator: "my-app"
}
```

### How inputSchema Arguments Are Passed to the Handler

- The `inputSchema` defines the structure and types of arguments the tool expects.
- When a user (or another tool) calls this tool, the arguments must match the schema.
- The handler function receives these arguments as the `args` parameter.

**Example:**

If the tool's `inputSchema` is:

```js
inputSchema: {
  type: "object",
  properties: {
    a: { type: "number" },
    b: { type: "number" }
  },
  required: ["a", "b"]
}
```

And the user calls the tool with `{ a: 2, b: 3 }`, then in your handler:

```js
handler: async (args, context, config, toolName) => {
  // args = { a: 2, b: 3 }
  return { result: args.a + args.b };
};
```

- The handler can access each argument by name (e.g., `args.a`, `args.b`).
- The `context` parameter provides session/user info, and `config` is the handler config from the tool definition.

---

## Mapping inputSchema Arguments to Handler Arguments (config.args)

You can use the `config.args` field in your tool definition to map user-supplied tool options (from inputSchema) to the arguments your action handler expects. This mapping supports:

- Literal values (e.g., `"country": "US"`)
- Template variables (e.g., `"city": "{{location}}"`)
- Nested objects and arrays (all templates are resolved recursively)

**Example Tool Definition:**

```js
{
  name: "get-weather",
  description: "Get current weather for a location",
  inputSchema: {
    type: "object",
    properties: {
      location: { type: "string", description: "City name or coordinates" },
      units: { type: "string", enum: ["metric", "imperial"], default: "metric" }
    },
    required: ["location"]
  },
  handler: {
    type: "weather-tools",
    config: {
      url: "https://api.openweathermap.org/data/2.5/weather",
      args: {
        queryParams: {
          appid: "{{OPENWEATHER_API_KEY}}",
          q: "{{location}}",
          units: "{{units}}"
        }
      }
    }
  }
}
```

**How It Works:**

- When the tool is called with `{ location: "London", units: "metric" }`, the system will automatically resolve all `{{...}}` templates in config.args using the tool input and environment variables.
- The handler receives:
  ```js
  args = {
    location: "London",
    units: "metric",
    queryParams: {
      appid: "your-api-key",
      q: "London",
      units: "metric",
    },
  };
  ```
- The handler can use `args.queryParams` directly—no manual template resolution is needed.

**Handler Example:**

```js
handler: async (args, context, config) => {
  const urlObj = new URL(config.url);
  Object.entries(args.queryParams).forEach(([k, v]) => {
    if (v !== undefined && v !== "") urlObj.searchParams.append(k, v);
  });
  // ...fetch and return result...
};
```

---

### 💡 Summary

- If your tool options match the handler args, you don't need config.args.
- If you need to map, inject, or compose arguments, use config.args with `{{...}}` templates.
- The system resolves all mappings for you—your handler just uses the final args.

---

## 2. What is a Handler?

A **Handler** is the code that implements the functionality for one or more tools. When a tool is invoked, the server calls the handler function, passing the tool's arguments, context, and config.

Handlers can:

- Implement logic for a single tool, or
- Dispatch based on the tool name to support multiple tools in one package

---

## 3. Creating a Handler Package

A **Handler Package** groups related tools and provides the handler function that executes them. This is the recommended way to extend the server.

```js
const myHandlerPackage = {
  name: "my-domain",
  tools: [
    {
      name: "my-tool",
      description: "A custom tool",
      inputSchema: {
        /* ... */
      },
      handler: { type: "my-domain", config: {} },
      rolesPermitted: ["user", "admin"],
      creator: "my-app",
    },
    // ...more tools...
  ],
  handler: async (args, context, config, toolName) => {
    // Dispatch logic based on toolName, if needed
  },
};
```

---

## 4. Progress Reporting in Handlers

For long-running tools, you can report progress back to the client using a progress function. The server will always pass a `progress` function as the **fourth argument** to your handler function.

- **The progress function is always defined.**
  - If the client did not request progress updates, it is a no-op (calling it does nothing).
  - If the client requested progress (by providing a `progressToken`), calling the function will send progress notifications to the client.

### Handler Signature

```js
handler: async (args, context, config, progress) => {
  // ... your setup ...
  for (let i = 0; i < 10; i++) {
    // Do some work...
    progress(i + 1, 10, `Step ${i + 1} of 10`);
  }
  return { result: "done" };
};
```

- The function signature is:

  ```js
  progress(current, total, message);
  ```

  - `current`: The current progress value (number, required)
  - `total`: The total value (number, optional)
  - `message`: A human-readable message (string, optional)

- **Best practice:** Always call the progress function, even if you don't know if the client requested progress. It will be a no-op if not needed.

- **Why:** This makes your handler code simpler and more robust—no need to check if the function exists.

---

## 5. Registering a Handler Package with the Server

Register your handler package with the server at startup (or dynamically at runtime):

```js
const server = new DynamicMcpServer({ name: "my-mcp", version: "1.0.0" });
await server.start();
await server.registerHandler(myHandlerPackage);
```

---

## 6. Best Practices

- **Be explicit**: Always specify `rolesPermitted`
