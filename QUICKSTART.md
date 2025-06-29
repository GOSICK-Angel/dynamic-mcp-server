# 🚀 快速启动指南

## 步骤1：设置环境变量

创建一个 `.env` 文件在项目根目录：

```bash
# 服务器配置
PORT=3000
SERVER_NAME=my-dynamic-mcp-server
SERVER_VERSION=1.0.0
MCP_SERVER_NAME=my-dynamic-mcp-server

# 管理员邮箱 (必须设置)
MCP_ADMIN_EMAIL=admin@example.com

# MongoDB 连接 (可选，如果不设置会使用内存存储)
# MONGODB_URI=mongodb://localhost:27017/dynamic-mcp-server

# 日志配置
LOG_LEVEL=info

# 可选：邮件服务配置
# POSTMARK_API_TOKEN=your_postmark_token
# SMTP_FROM=noreply@example.com

# 可选：天气API密钥 (如果使用天气工具)
# OPENWEATHER_API_KEY=your_openweather_api_key
```

## 步骤2：启动服务器

现在您有几种启动选项：

### 选项1：运行自定义服务器（推荐）
```bash
npm run server
```

### 选项2：运行示例服务器
```bash
# Echo 示例
npm run example:echo

# 天气 示例
npm run example:weather

# 基础 示例
npm run example:base
```

## 步骤3：获取API密钥

服务器启动后，您会在控制台看到管理员API密钥，类似：
```
Admin user API key: abc123def456...
```

## 步骤4：连接客户端

### 使用 Cursor

编辑 `~/.cursor/mcp.json` 文件：

```json
{
  "mcpServers": {
    "my-dynamic-mcp-server": {
      "url": "http://localhost:4001/sse?apiKey=YOUR_API_KEY_HERE"
    }
  }
}
```

**注意：默认端口是4001，除非您在.env中设置了其他端口**

### 使用其他MCP客户端

- **现代HTTP传输**: `http://localhost:4001/mcp?apiKey=YOUR_API_KEY`
- **传统SSE传输**: `http://localhost:4001/sse?apiKey=YOUR_API_KEY`

## 🛠️ 自定义服务器功能

启动 `npm run server` 后，您将获得以下工具：

- **echo**: 回显输入的消息
- **current-time**: 获取当前时间（支持时区）
- **calculate**: 执行简单的数学计算

## 📝 添加更多工具

编辑 `server.ts` 文件，在 `basicToolsHandler.tools` 数组中添加新工具定义。

## 🔧 故障排除

1. **MongoDB连接问题**: 如果没有MongoDB，工具会使用内存存储
2. **端口冲突**: 修改 `.env` 文件中的 `PORT` 值
3. **权限问题**: 确保 `MCP_ADMIN_EMAIL` 已正确设置

## 📚 更多信息

- 查看 `docs/` 目录获取详细文档
- 查看 `examples/` 目录获取更多示例
- 查看 `src/handlers/` 了解内置工具实现 