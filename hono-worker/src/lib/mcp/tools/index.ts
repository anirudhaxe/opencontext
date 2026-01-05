import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerContextRetrieverTool } from "./contextRetriever.js";

export const registerAllMcpTools = (mcpServer: McpServer) => {
  // Register all tools here
  registerContextRetrieverTool(mcpServer);
};
