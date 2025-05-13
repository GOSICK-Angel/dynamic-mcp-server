# Dynamic MCP Server Framework

A flexible, extensible framework for building Model Context Protocol (MCP) servers with modern authentication, user management, and dynamic tool sharing.

---

## 🚀 Overview

Dynamic MCP Server enables secure, user-aware, and extensible AI tool servers. It supports:

- **OAuth-based authentication** (e.g., Keycloak)
- **User management and authorization** (MongoDB-backed)
- **Session-based, per-user tool loading**
- **Tool sharing and fine-grained access control**
- **Extensible HTTP and database layers for downstream projects**

---

## 🌟 Key Features

- **Dynamic Tool Management**: Create, delete, and authorize tools at runtime—tools are not limited to static definitions at startup or in code. This enables true runtime extensibility and is a primary differentiator from most other MCP servers.
- **User Management**: Add, update, delete, and list users; admin bootstrapping; role-based access.
- **Tool Sharing**: Share tools with other users, manage access levels, and receive real-time updates.
- **Modern Auth**: OAuth/Keycloak for authentication, MongoDB for authorization.
- **Extensibility**: Add custom HTTP routes and MongoDB collections in downstream projects.
- **Session-based Tool Loading**: Tools are loaded per user session, not globally.

---

## 📚 Documentation

- [Getting Started](./docs/getting-started.md)
- [User Management](./docs/user-management.md)
- [Tool Management & Sharing](./docs/tool-management.md)
- [Authentication & Authorization](./docs/authentication.md)
- [Extending the Server (HTTP & DB)](./docs/extending.md)
- [API Reference](./docs/api-reference.md)
- [Examples](./docs/examples.md)

---

## 🛠️ Quick Start

See [Getting Started](./docs/getting-started.md) for installation and basic usage.

---

## 📝 Contributing

Contributions are welcome! See [the documentation](./docs/) for more details.

## Testing

For robust test patterns, mocking strategies, and solutions to common ESM/TypeScript issues, see:

- [docs/test_patterns.md](docs/test_patterns.md)

---

## 📄 License

MIT
