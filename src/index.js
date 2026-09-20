#!/usr/bin/env node
// beeimg-mcp — local MCP server (stdio) for the BeeIMG image hosting API.
// Run with `npx beeimg-mcp` or `node src/index.js`. Connect any MCP client over stdio.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { toolDefinitions } from "./tools.js";
import { deleteImage, premiumInfo, uploadFile, uploadUrl } from "./api.js";

const SERVER_NAME = "beeimg-mcp";
const SERVER_VERSION = "1.0.0";

const server = new McpServer(
  { name: SERVER_NAME, version: SERVER_VERSION },
  {
    capabilities: { tools: {} },
    instructions:
      "BeeIMG image hosting API. Pass your apikey to upload_url / upload_file for album uploads, and to delete_image with the delete_key returned at upload time. Anonymous uploads work without an apikey. For premium limits and upgrade links call beeimg_premium_info.",
  },
);

function resultFrom(reply) {
  const content = [];
  if (reply.text) {
    content.push({ type: "text", text: reply.text });
  }
  if (reply.hint) {
    content.push({ type: "text", text: reply.hint });
  }
  const result = { content };
  if (reply.isError) {
    result.isError = true;
  }
  if (reply.structured) {
    result.structuredContent = reply.structured;
  }
  return result;
}

for (const tool of toolDefinitions()) {
  server.registerTool(
    tool.name,
    {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
      annotations: tool.annotations,
    },
    async (args) => {
      let reply;
      switch (tool.name) {
        case "upload_url":
          reply = await uploadUrl(args ?? {});
          break;
        case "upload_file":
          reply = await uploadFile(args ?? {});
          break;
        case "delete_image":
          reply = await deleteImage(args ?? {});
          break;
        case "beeimg_premium_info":
          reply = await premiumInfo();
          break;
        default:
          reply = { isError: true, text: `Unknown tool: ${tool.name}` };
      }
      return resultFrom(reply);
    },
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
