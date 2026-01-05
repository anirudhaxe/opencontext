import "dotenv/config";
import { Hono } from "hono";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import initRoutes from "./routes/index.js";
import { registerAllMcpTools } from "./lib/mcp/index.js";
import { runWithApiKey } from "./lib/mcp/context.js";

/*
 * Queue workers
 * Imported here just for initialization
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jobQueueWorker } from "../queue-workers/index.js";

const app = new Hono();

// Initialize MCP server
const mcpServer = new McpServer({
  name: "opencontext-mcp-server",
  version: "1.0.0",
});

app.use(cors());

// Register all MCP tools
registerAllMcpTools(mcpServer);

// Route all MCP requests to /mcp
app.all("/mcp", async (c) => {
  try {
    const apiKey = c.req.header("opencontext_api_key");

    if (!apiKey)
      return c.json(
        {
          jsonrpc: "2.0",
          error: {
            code: -32001,
            message: "API key is missing",
          },
          id: null,
        },
        401,
      );

    // Setup the transport for MCP
    const transport = new StreamableHTTPTransport();

    // Connect server to transport
    await mcpServer.connect(transport);

    // Handle the incoming request with the transport within the apiKey context
    return runWithApiKey(apiKey, () => transport.handleRequest(c));
  } catch (error) {
    console.error("ERROR: /mcp", error);
    return c.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      },
      500,
    );
  }
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = Number(process.env.PORT || 3001);

initRoutes(app);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
