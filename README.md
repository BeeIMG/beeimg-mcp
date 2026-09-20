# beeimg-mcp

A **local MCP server** for the [BeeIMG](https://beeimg.com) image hosting API. It runs over
**stdio** — no hosted endpoint required — and talks to the BeeIMG HTTP API directly on every
tool call.

- Run it in any MCP client with `npx beeimg-mcp` (Node >= 18).
- Exposes the same four tools as the hosted server at `https://beeimg.com/mcp`:
  `upload_url`, `upload_file`, `delete_image`, `beeimg_premium_info`.
- Anonymous uploads work with no credentials; pass your API key
  ([get one here](https://beeimg.com/api/newkey)) for album uploads and deletes.

## Quick start

```bash
# run once via npx (no install needed)
npx beeimg-mcp

# or install globally
npm install -g beeimg-mcp
beeimg-mcp
```

## Client configuration

Point any MCP client at the stdio command `npx beeimg-mcp`:

**opencode** (`opencode.json`):

```json
{
  "mcp": {
    "beeimg": {
      "type": "local",
      "command": ["npx", "-y", "beeimg-mcp"],
      "enabled": true
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "beeimg": {
      "command": "npx",
      "args": ["-y", "beeimg-mcp"]
    }
  }
}
```

**Cursor** (`~/.cursor/mcp.json`): same `mcpServers` block as Claude Desktop.

Config is loaded at startup — restart the client after adding it.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `BEEIMG_MCP_BASE_URL` | `https://beeimg.com` | Upstream BeeIMG API base URL the tools call. |
| `BEEIMG_MCP_SSL_VERIFY` | auto | `0` or `1` forces TLS verification. When unset, verification is disabled for loopback hosts (dev hosts-file + self-signed cert) and enabled otherwise. |

For a self-signed dev setup with Node's fetch, also set `NODE_TLS_REJECT_UNAUTHORIZED=0`.

## Development

```bash
npm install
npm test          # unit tests (node:test)
npm start         # run the stdio server
```

Smoke test over stdio:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"t","version":"1"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"beeimg_premium_info","arguments":{}}}' \
  | npm start
```

## Publishing to npm

```bash
npm login                       # one time
npm version patch               # bump version (also: minor / major)
npm publish                     # publishes beeimg-mcp
```

- The name `beeimg-mcp` is published from this folder (`internal/mcp/npm/` in the beeimg repo).
- Keep `version` in sync with the MCP server version the package reports (`src/index.js`).

## Submitting to MCP directories

The package is a stdio/local MCP server, so use the **command / npm** form when adding it:

1. **Smithery** (`smithery.ai`) — Add Server → **Local/npm**: command `npx beeimg-mcp`.
2. **MCP.so** (`mcp.so`) — Add Server → transport `stdio`, command `npx beeimg-mcp`.
3. **Glama** (`glama.ai`) — Add Server → **Command** transport, `npx beeimg-mcp`.
4. **Community lists** — PRs to `punkpeye/awesome-mcp-servers`,
   `modelcontextprotocol/servers`, `awesome-claude-skills`, etc.

> The hosted Streamable HTTP endpoint (`https://beeimg.com/mcp`) is planned to become a
> paid/premium feature. This npm package is the free, always-available local path — submit it
> to directories as the stdio variant of the same server.

## Notes

- Delete responses: the BeeIMG delete endpoint answers `OK` / `ERROR` (plain text); the tool
  mirrors that.
- Premium hints: upload errors with codes `40`, `223`, `4`, `503` include an upgrade link
  (`https://beeimg.com/premium/compare`) and are marked `isError`.
- The hosted server implementation lives in `mcp.php`; protocol/API docs are in
  `MCP_README.md` and at `https://beeimg.com/mcp-setup`.

## License

MIT — see `LICENSE`.
