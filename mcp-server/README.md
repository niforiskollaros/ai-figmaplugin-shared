# Figma MCP Server

Custom HTTP API wrapper for Figma that provides 11 specialized analysis tools for AI-powered design feedback.

## What Is This?

The MCP (Model Context Protocol) Server is a Node.js/Express server that:
- Acts as a bridge between n8n AI workflows and the Figma API
- Provides specialized analysis tools (WCAG checks, design system compliance, etc.)
- Runs on Railway (or any Node.js hosting platform)
- Requires only a Figma Personal Access Token

**You can use the existing shared server** (`https://OUR_CUSTOM_MCP_SERVER-production.up.railway.app`) **or deploy your own** for privacy/control.

---

## ✨ Features

- ✅ **11 specialized analysis tools** for Figma
- ✅ **Works in cloud environments** (no Figma Desktop needed)
- ✅ **Perfect for n8n AI Agent integration**
- ✅ **WCAG contrast checking** built-in
- ✅ **Design system compliance** validation
- ✅ **Full CORS support** for webhooks
- ✅ **JSON-RPC and custom protocol** support

---

## 🛠️ Available Tools

The server provides 11 tools that n8n AI Agents can use:

1. **get_node_details** - Fetch node structure, dimensions, colors, layout
2. **get_design_system** - Get all styles from design system file
3. **get_variables** - Fetch Figma variables (colors, spacing, etc.)
4. **verify_design_system_compliance** - Check token usage violations
5. **analyze_spacing** - Validate 8px grid compliance
6. **get_file_styles** - List all styles in a file
7. **get_typography** - Find all TEXT nodes and properties
8. **get_color_analysis** - Extract colors with hex values
9. **check_wcag_contrast** - WCAG 2.1 AA/AAA validation
10. **get_components** - Find all components and instances
11. **analyze_hierarchy** - Measure nesting depth and complexity

See full tool documentation at the end of this file.

---

## 🚀 Option 1: Use Existing Shared Server (Easiest)

**No deployment needed!** Use the existing server:

```
https://OUR_CUSTOM_MCP_SERVER-production.up.railway.app
```

**Health Check**:
```bash
curl https://OUR_CUSTOM_MCP_SERVER-production.up.railway.app/health
```

**Pros**:
- Zero setup required
- Always up-to-date
- Free to use

**Cons**:
- Shared with other users
- No customization control
- Dependent on maintainer

**Use this if**: You just want to get started quickly.

---

## 🚀 Option 2: Deploy Your Own (Recommended for Teams)

### Why Deploy Your Own?

- **Privacy**: Your Figma data stays between you and your Railway instance
- **Control**: Customize tools, add logging, adjust timeouts
- **Reliability**: Not dependent on shared server uptime
- **Security**: Your own Figma token, isolated from others

### Prerequisites

- **Railway account** (free tier available) - https://railway.app
- **Figma Personal Access Token** - https://www.figma.com/settings
- **Basic Git knowledge** (for Railway deployment)

### Step 1: Get Figma Token

1. Go to https://www.figma.com/settings
2. Scroll to **Personal Access Tokens**
3. Click **Create new token**
4. Name it: "MCP Server"
5. Copy the token (starts with `figd_`)
6. **Save it securely** - you won't see it again!

### Step 2: Deploy to Railway

#### Method A: Deploy with Railway CLI (Fastest)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Navigate to MCP server folder
cd mcp-server

# Initialize and deploy
railway init
railway up

# Add environment variable
railway variables set FIGMA_TOKEN=figd_your_token_here
```

Your server URL will be shown in the terminal!

#### Method B: Deploy via GitHub (Recommended)

1. **Create a GitHub repository** (can be private)
2. **Push this `mcp-server` folder** to the repository:
   ```bash
   cd mcp-server
   git init
   git add .
   git commit -m "Initial MCP server"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. **Connect Railway to GitHub**:
   - Go to https://railway.app/new
   - Click **Deploy from GitHub repo**
   - Select your repository
   - Railway will auto-detect Node.js and deploy

4. **Add Environment Variable**:
   - In Railway dashboard, click your service
   - Go to **Variables** tab
   - Click **+ New Variable**
   - Name: `FIGMA_TOKEN`
   - Value: Your Figma token (starts with `figd_`)
   - Click **Add**

5. **Get Your Server URL**:
   - Go to **Settings** → **Networking**
   - Click **Generate Domain**
   - Copy the URL: `https://YOUR-SERVICE-NAME.up.railway.app`

#### Method C: Deploy via Railway Web UI

1. Go to https://railway.app/new
2. Click **Empty Project**
3. Click **+ New** → **Empty Service**
4. Go to **Settings** → **Source**
5. Connect your GitHub repo or upload files manually
6. Add environment variable `FIGMA_TOKEN` in **Variables** tab
7. Railway will auto-deploy

### Step 3: Test Your Deployment

```bash
# Health check
curl https://YOUR-SERVICE-NAME.up.railway.app/health

# Expected response:
{
  "status": "ok",
  "service": "Figma Custom MCP Server",
  "version": "3.0.0",
  "hasToken": true,
  "timestamp": "2025-11-07T...",
  "endpoints": {
    "health": "/health",
    "tools": "/mcp/tools",
    "mcp": "/mcp"
  }
}
```

If `"hasToken": false`, your Figma token isn't set correctly in Railway.

### Step 4: Update n8n Workflows

After deploying your own server:

1. Open each n8n workflow
2. Find all **MCP tool nodes** (HTTP Request nodes)
3. Replace the URL:
   ```
   FROM: https://OUR_CUSTOM_MCP_SERVER-production.up.railway.app/mcp
   TO:   https://YOUR-SERVICE-NAME.up.railway.app/mcp
   ```
4. Save each workflow
5. Test to ensure it works

### Step 5: Update Figma Plugin Manifest

Open `Figma Plugin/manifest.json` and update:

```json
{
  "networkAccess": {
    "allowedDomains": [
      "https://your-n8n-instance.app.n8n.cloud",
      "https://YOUR-SERVICE-NAME.up.railway.app"
    ]
  }
}
```

Then reload the plugin in Figma.

---

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check and version info |
| `/mcp/tools` | GET | List all available tools |
| `/mcp` | POST | Execute a tool (main endpoint) |

---

## 🤖 Using Tools from n8n

### Basic Tool Call Format

**URL**: `https://YOUR-SERVER.up.railway.app/mcp`
**Method**: POST
**Headers**:
- `Content-Type: application/json`

**Body** (Custom Format):
```json
{
  "tool": "get_node_details",
  "parameters": {
    "fileKey": "abc123xyz",
    "nodeId": "1:2"
  }
}
```

**Body** (JSON-RPC Format):
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_node_details",
    "arguments": {
      "fileKey": "abc123xyz",
      "nodeId": "1:2"
    }
  }
}
```

The server supports both formats!

---

## 📚 Complete Tool Reference

### 1. get_node_details

Get detailed properties of a Figma node.

**Parameters**:
- `fileKey` (string): Figma file key from URL
- `nodeId` (string): Node ID (format: "1:2")

**Returns**: Node structure, dimensions, colors, layout, children (limited to 20)

**Example**:
```json
{
  "tool": "get_node_details",
  "parameters": {
    "fileKey": "abc123xyz",
    "nodeId": "1:2"
  }
}
```

### 2. get_design_system

Get all styles (colors, text) from a design system file.

**Parameters**:
- `fileKey` (string): Design system file key

**Returns**: All color styles, text styles with values

**Example**:
```json
{
  "tool": "get_design_system",
  "parameters": {
    "fileKey": "YOUR_DS_FILE_KEY"
  }
}
```

### 3. get_variables

Fetch Figma variables (modern design tokens).

**Parameters**:
- `fileKey` (string): File key

**Returns**: Variable collections, modes (Light/Dark), values by mode

**Example**:
```json
{
  "tool": "get_variables",
  "parameters": {
    "fileKey": "abc123xyz"
  }
}
```

### 4. verify_design_system_compliance

Recursively check if nodes use design tokens vs. hard-coded values.

**Parameters**:
- `fileKey` (string): File to check
- `nodeId` (string): Starting node
- `dsFileKey` (string): Design system file key

**Returns**: List of violations (hard-coded colors, text styles, etc.)

**Example**:
```json
{
  "tool": "verify_design_system_compliance",
  "parameters": {
    "fileKey": "abc123xyz",
    "nodeId": "1:2",
    "dsFileKey": "YOUR_DS_FILE_KEY"
  }
}
```

### 5. analyze_spacing

Check if spacing follows 8px grid system.

**Parameters**:
- `fileKey` (string): File key
- `nodeId` (string): Node to check

**Returns**: Spacing violations (padding/gaps not multiples of 8)

**Example**:
```json
{
  "tool": "analyze_spacing",
  "parameters": {
    "fileKey": "abc123xyz",
    "nodeId": "1:2"
  }
}
```

### 6. get_file_styles

List all styles defined in a file.

**Parameters**:
- `fileKey` (string): File key

**Returns**: All color and text styles

### 7. get_typography

Find all TEXT nodes and their properties.

**Parameters**:
- `fileKey` (string): File key
- `nodeId` (string): Starting node

**Returns**: All text nodes with font, size, weight, line height

### 8. get_color_analysis

Extract all colors from fills and strokes.

**Parameters**:
- `fileKey` (string): File key
- `nodeId` (string): Starting node

**Returns**: All colors with hex values, RGB values, locations

### 9. check_wcag_contrast

Calculate WCAG 2.1 contrast ratios.

**Parameters**:
- `fileKey` (string): File key
- `nodeId` (string): Starting node

**Returns**: Text/background pairs with contrast ratios, AA/AAA pass/fail

### 10. get_components

Find all components and instances.

**Parameters**:
- `fileKey` (string): File key
- `nodeId` (string): Starting node

**Returns**: List of all components with instance counts

### 11. analyze_hierarchy

Measure nesting depth and complexity.

**Parameters**:
- `fileKey` (string): File key
- `nodeId` (string): Starting node

**Returns**: Max depth, average depth, complexity score

---

## 📝 Getting Figma File Key & Node ID

### File Key

From URL: `https://www.figma.com/file/abc123xyz/MyDesign?node-id=1-2`

**File Key**: `abc123xyz`

### Node ID

From same URL: `node-id=1-2`

Convert to: `1:2` (replace `-` with `:`)

Or: Right-click element → **Copy link** → extract from URL

---

## 🐛 Troubleshooting

### Health check returns 404
- Server isn't deployed or URL is wrong
- Check Railway logs for startup errors
- Verify deployment succeeded in Railway dashboard

### "hasToken": false in health check
- `FIGMA_TOKEN` environment variable not set in Railway
- Go to Variables tab and add it
- Redeploy after adding

### 403 Forbidden from Figma
- Figma token is invalid or expired
- Generate new token at https://www.figma.com/settings
- Update Railway environment variable

### 500 Internal Server Error
- Check Railway logs for specific error
- Common issues:
  - Invalid fileKey or nodeId format
  - File doesn't exist or no access
  - Figma API rate limit hit

### n8n workflow times out
- Increase timeout in n8n HTTP Request node (default: 60s)
- Check if Figma file is very large (simplify query)
- Verify MCP server is running (check health endpoint)

### CORS errors
- Server has CORS enabled for all origins
- If still seeing errors, check Figma plugin manifest.json
- Ensure MCP server domain is in allowedDomains

---

## 🔒 Security Best Practices

1. **Rotate your Figma token** after initial setup
2. **Use environment variables** - never commit tokens to Git
3. **Use Railway's built-in secrets** for sensitive data
4. **Limit Figma token permissions** to read-only if possible
5. **Monitor Railway logs** for suspicious activity
6. **Use HTTPS only** (Railway provides this automatically)

---

## 💰 Costs

### Railway Pricing

- **Hobby Plan**: $5/month + usage
  - 500 hours of runtime/month (~16.6 hours/day)
  - $0.000231/GB-hour memory
  - Usually stays under $10/month for moderate use

- **Pro Plan**: $20/month + usage
  - Unlimited hours
  - Better for high-traffic production use

### Figma API

- **Free**: No cost for API usage
- **Rate limits**: 200 requests/minute per token

**Total estimated cost**: $5-20/month depending on usage.

---

## 🚧 Limitations

- **Figma API rate limits**: 200 requests/minute
- **Children limited to 20** to prevent huge payloads
- **15-second timeout** on Figma API calls
- **Railway cold starts**: First request after inactivity may be slow (~5-10 seconds)

---

## 🛠️ Local Development

Want to test locally before deploying?

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your Figma token
nano .env

# Start server
npm start

# Or use nodemon for auto-reload
npm run dev
```

Server runs at `http://localhost:3845`

Test: `curl http://localhost:3845/health`

---

## 📦 Dependencies

- **express** - Web framework
- **axios** - HTTP client for Figma API
- **cors** - CORS middleware
- **dotenv** - Environment variable management

All dependencies are production-ready and actively maintained.

---

## 🤝 Contributing

The MCP server is part of the Signal AI Design Monitoring system.

**Want to add a new tool?**

1. Add tool definition in `/mcp/tools` endpoint
2. Implement tool logic in main `/mcp` POST handler
3. Test with n8n HTTP Request node
4. Update this README with documentation

---

## 📄 License

MIT License - See main project LICENSE file.

---

## 🎉 You're Done!

Your MCP server is now deployed and ready to use with n8n workflows!

**Next steps**:
1. Update n8n workflows with your server URL
2. Test with a simple tool call (e.g., `get_node_details`)
3. Verify results in n8n execution logs
4. Update Figma plugin manifest.json
5. Start analyzing designs!
