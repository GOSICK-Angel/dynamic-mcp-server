import { DynamicMcpServer, logger } from "./src/index.js";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// 创建一个基本的工具处理器
const basicToolsHandler = {
  name: "basic-tools",
  tools: [
    {
      name: "echo",
      description: "回显输入的消息",
      inputSchema: {
        type: "object" as const,
        properties: {
          message: { 
            type: "string", 
            description: "要回显的消息" 
          },
        },
        required: ["message"]
      },
      annotations: {
        title: "回显工具",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      handler: {
        type: "basic-tools",
        config: {
          action: "echo",
        },
      },
      rolesPermitted: ["user", "admin"],
    },
    {
      name: "current-time",
      description: "获取当前时间",
      inputSchema: {
        type: "object" as const,
        properties: {
          timezone: { 
            type: "string", 
            description: "时区，如 'Asia/Shanghai'",
            default: "UTC"
          },
        },
      },
      annotations: {
        title: "时间工具",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      handler: {
        type: "basic-tools",
        config: {
          action: "current-time",
        },
      },
      rolesPermitted: ["user", "admin"],
    },
    {
      name: "calculate",
      description: "执行简单的数学计算",
      inputSchema: {
        type: "object" as const,
        properties: {
          expression: { 
            type: "string", 
            description: "数学表达式，如 '2 + 3 * 4'" 
          },
        },
        required: ["expression"]
      },
      annotations: {
        title: "计算器",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
      handler: {
        type: "basic-tools",
        config: {
          action: "calculate",
        },
      },
      rolesPermitted: ["user", "admin"],
    },
  ],
  handler: async (args: Record<string, any>, context: any, config: any) => {
    const { action } = config;
    
    switch (action) {
      case "echo":
        return {
          result: { message: args.message },
          message: `回显: ${args.message}`,
        };
        
      case "current-time":
        const now = new Date();
        const timeString = args.timezone 
          ? now.toLocaleString('zh-CN', { timeZone: args.timezone })
          : now.toISOString();
        return {
          result: { 
            timestamp: now.toISOString(),
            formatted: timeString,
            timezone: args.timezone || "UTC"
          },
          message: `当前时间: ${timeString}`,
        };
        
      case "calculate":
        try {
          // 注意：这是一个简化的实现，生产环境需要更安全的数学表达式求值
          const result = Function(`"use strict"; return (${args.expression})`)();
          return {
            result: { 
              expression: args.expression,
              result: result 
            },
            message: `计算结果: ${args.expression} = ${result}`,
          };
        } catch (error) {
          return {
            error: `计算错误: ${error instanceof Error ? error.message : String(error)}`,
          };
        }
        
      default:
        return { error: `未知操作: ${action}` };
    }
  },
};

// 创建并配置服务器
const server = new DynamicMcpServer({
  name: "my-dynamic-mcp-server",
  version: "1.0.0",
});

// 注册工具处理器
server.registerHandler(basicToolsHandler);

// 启动服务器
async function startServer() {
  try {
    await server.start();
    logger.info("🚀 Dynamic MCP Server 启动成功!");
    logger.info(`📡 服务器地址: http://localhost:${process.env.PORT || 4001}`);
    logger.info("📋 可用的传输协议:");
    logger.info("   - 现代HTTP传输: /mcp");
    logger.info("   - 传统SSE传输: /sse");
    logger.info("🔑 管理员API密钥已在上方显示");
    logger.info("🛠️  已注册的工具:");
    logger.info("   - echo: 回显消息");
    logger.info("   - current-time: 获取当前时间");  
    logger.info("   - calculate: 数学计算");
    logger.info("📖 使用Cursor连接时请在mcp.json中添加: ?apiKey=YOUR_API_KEY");
  } catch (error) {
    logger.error("❌ 服务器启动失败:", error);
    process.exit(1);
  }
}

// 优雅关闭处理
process.on('SIGINT', async () => {
  logger.info("正在优雅关闭服务器...");
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info("正在优雅关闭服务器...");
  process.exit(0);
});

// 启动服务器
startServer(); 