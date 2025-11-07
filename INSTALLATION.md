# Installation Guide - Signal AI Design Monitoring

This guide will walk you through setting up the complete Figma AI Design Monitoring system from scratch. The system consists of three main components that work together:

1. **Figma Plugin** - The user interface in Figma
2. **n8n Workflows** - AI orchestration and analysis logic
3. **MCP Server** - Figma API integration layer (optional, can use existing deployment)

## Prerequisites

Before you begin, you'll need accounts and access to:

### Required Services
- **Figma Account** (Free or paid)
  - https://www.figma.com
  - You'll need to create a Personal Access Token

- **n8n Instance** (Cloud or self-hosted)
  - Cloud: https://n8n.io (easiest option)
  - Self-hosted: https://docs.n8n.io/hosting/

- **OpenAI Account** with API access
  - https://platform.openai.com
  - You'll need an API key with GPT-4o-mini or GPT-5-mini access

### Optional Services
- **Magic Patterns** (for Mode 5 - Design Alternatives)
  - https://www.magicpatterns.com
  - Paid service (~$99/month + $0.25 per generation)

- **Slack Workspace** (for notifications)
  - https://slack.com
  - Free or paid workspace where you can install apps

- **Railway** (if you want to deploy your own MCP server)
  - https://railway.app
  - Can use the existing server or deploy your own

---

## Part 1: Get Your API Keys & Credentials

### 1.1 Figma Personal Access Token

1. Go to https://www.figma.com/settings
2. Scroll down to **Personal Access Tokens**
3. Click **Create a new personal access token**
4. Name it: "AI Design Monitoring"
5. Copy the token (starts with `figd_`)
6. **Important**: Save this token securely - you won't be able to see it again!

### 1.2 OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Name it: "Figma Design Analysis"
4. Copy the key (starts with `sk-`)
5. **Important**: Save this key securely!

### 1.3 Magic Patterns API Key (Optional - Mode 5 only)

1. Sign up at https://www.magicpatterns.com
2. Subscribe to a paid plan
3. Go to your account settings
4. Find **API Keys** section
5. Copy your API key (starts with `mp_live_`)

### 1.4 Slack Webhook (Optional - for notifications)

1. Go to https://api.slack.com/apps
2. Click **Create New App** > **From scratch**
3. Name it: "Design Feedback Bot"
4. Choose your workspace
5. Go to **Incoming Webhooks** and activate it
6. Click **Add New Webhook to Workspace**
7. Choose the channel where you want notifications
8. Copy the Webhook URL

---

## Part 2: Set Up n8n Workflows

See **[N8N_SETUP.md](./N8N_SETUP.md)** for detailed step-by-step instructions on:
- Importing all 5 workflows
- Configuring credentials
- Updating MCP server URLs
- Getting webhook URLs
- Testing each workflow

This is the most critical part of the setup!

---

## Part 3: Configure the Figma Plugin

### 3.1 Prepare Plugin Files

1. Open the `Figma Plugin/code.js` file in a text editor
2. Find the **CONFIGURATION** section at the top (lines 5-13)

### 3.2 Update Design System File Key

Find your design system file key:
1. Open your design system file in Figma
2. Look at the URL: `https://www.figma.com/file/ABC123DEF456/Design-System`
3. Copy the file key: `ABC123DEF456`

Update in `code.js`:
```javascript
const DS_FILE_KEY = 'ABC123DEF456'; // Replace with your key
```

### 3.3 Update Webhook URLs

After completing Part 2 (n8n setup), you'll have 5 webhook URLs. Update them in `code.js`:

```javascript
const WEBHOOK_URLS = {
  'design-system-check': 'https://your-n8n.app.n8n.cloud/webhook/design-system-check',
  'component-analysis': 'https://your-n8n.app.n8n.cloud/webhook/component-analysis',
  'color-audit': 'https://your-n8n.app.n8n.cloud/webhook/color-audit',
  'ux-analysis': 'https://your-n8n.app.n8n.cloud/webhook/ux-analysis',
  'magic-patterns': 'https://your-n8n.app.n8n.cloud/webhook/magic-patterns'
};
```

### 3.4 Update manifest.json

Open `manifest.json` and update the allowed domains:

```json
{
  "networkAccess": {
    "allowedDomains": [
      "https://your-n8n.app.n8n.cloud",
      "https://YOUR_MCP_SERVER_URL.up.railway.app"
    ]
  }
}
```

### 3.5 Import Plugin to Figma

1. Open Figma Desktop app (required - browser version has limitations)
2. Go to **Menu** > **Plugins** > **Development** > **Import plugin from manifest**
3. Navigate to the `Figma Plugin` folder
4. Select `manifest.json`
5. Click **Import**

The plugin is now installed!

---

## Part 4: Configure Your First Project

### 4.1 Get Your Project File Key

1. Open the Figma file you want to analyze
2. Look at the URL: `https://www.figma.com/file/XYZ789/My-Project`
3. Copy the file key: `XYZ789`

### 4.2 Set File Key in Plugin

1. In Figma, go to **Menu** > **Plugins** > **Development** > **Signal AI Design Feedback**
2. Paste your project file key in the **Current Project File Key** field
3. Click **Save Project File Key**
4. You should see a green indicator

---

## Part 5: Test the System

### 5.1 Test Mode 1: Design System Check

1. Open your Figma project
2. Select any frame or component
3. Run the plugin (**Menu** > **Plugins** > **Development** > **Signal AI Design Feedback**)
4. Click **Design System Check**
5. Wait 15-30 seconds
6. You should see color-coded annotations appear next to your selection

**If it works**: Great! Move on to testing other modes.

**If it fails**: Check the browser console (Cmd+Option+J on Mac, Ctrl+Shift+J on Windows) for errors. Common issues:
- Webhook URLs are incorrect
- n8n workflows not activated
- OpenAI credentials not configured in n8n

### 5.2 Test Other Modes

Try each mode to ensure they work:
- **Mode 2**: Component Analysis (15-30 sec)
- **Mode 3**: Color Audit (15-30 sec)
- **Mode 4**: UX Heuristic Analysis (20-40 sec)
- **Mode 5**: Magic Patterns (60-120 sec) - requires Magic Patterns API key

---

## Troubleshooting

### Plugin shows "Network error"
- Verify webhook URLs in `code.js` match your n8n webhooks exactly
- Check that n8n workflows are **activated** (toggle in top-right of workflow)
- Verify `manifest.json` allowedDomains includes your n8n instance
- Try reloading the plugin: **Plugins** > **Development** > **Reload**

### "Webhook returned 500" error
- Check n8n execution logs for the specific workflow
- Verify OpenAI credentials are configured correctly
- Ensure MCP server URL is correct in workflow nodes
- Check that your Figma token is valid

### Annotations not appearing
- Open browser console (Cmd+Option+J / Ctrl+Shift+J) for JavaScript errors
- Ensure Inter font is available in your Figma file
- Verify the frame remains selected during analysis
- Check that webhook returned valid JSON response

### Magic Patterns times out
- Ensure screenshot export is set to JPG format (not PNG) with scale: 1
- Check Magic Patterns API key is correct
- Verify you have available credits in your Magic Patterns account
- Magic Patterns typically takes 1-3 minutes

### n8n workflow execution fails
- Check OpenAI API key has sufficient credits
- Verify model is set to `gpt-4o-mini` or `gpt-5-mini` (not older models)
- Check MCP server is responding: https://YOUR_MCP_SERVER_URL/health
- Look at n8n execution error details

---

## Optional: Deploy Your Own MCP Server

The system can use the existing MCP server at `https://signalmpc-production.up.railway.app`, **but you can also deploy your own using the included code!**

### Why Deploy Your Own?

- **Privacy**: Your Figma data stays between you and your Railway instance
- **Control**: Customize the 11 analysis tools, add logging, adjust timeouts
- **Reliability**: Not dependent on shared server uptime
- **Security**: Your own Figma token, isolated from others

### Complete Server Code Included!

The **`mcp-server/`** folder contains everything you need:
- ✅ Complete Node.js server code (server.js)
- ✅ All 11 analysis tools
- ✅ Railway deployment config (Procfile)
- ✅ Dependencies (package.json)
- ✅ Environment template (.env.example)
- ✅ Comprehensive deployment guide (README.md)

### Quick Deployment (10-15 minutes)

**See `mcp-server/README.md` for complete step-by-step instructions** including:

1. **Railway CLI deployment** (fastest)
2. **GitHub integration** (recommended for updates)
3. **Web UI deployment** (no CLI needed)

**After deployment**:
1. Get your Railway URL: `https://YOUR-SERVICE.up.railway.app`
2. Update all n8n workflows with your new URL
3. Update `Figma Plugin/manifest.json` with your domain
4. Test with health check: `curl https://YOUR-SERVICE.up.railway.app/health`

**Estimated cost**: $5-10/month on Railway Hobby plan

---

## Next Steps

Once everything is working:

1. **Test thoroughly** - Try all 5 modes on different designs
2. **Set up Slack notifications** - Add Slack webhooks to n8n workflows
3. **Customize prompts** - Modify AI prompts in n8n to match your needs
4. **Add team members** - Share instructions with your design team
5. **Create templates** - Set up design system templates that work well with the tool

---

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review n8n execution logs for detailed error messages
3. Verify all credentials are correct and have sufficient permissions
4. Check that API services (OpenAI, Magic Patterns) have available credits
5. Open browser console in Figma for client-side errors

---

## System Architecture Summary

```
┌─────────────┐
│Figma Plugin │ (User Interface)
└──────┬──────┘
       │ HTTP POST
       ↓
┌─────────────────┐
│ n8n Workflows   │ (AI Orchestration)
│                 │
│ • Webhook       │
│ • AI Agent      │
│ • MCP Tools     │
│ • Response      │
└────────┬────────┘
         │ JSON-RPC
         ↓
┌─────────────────┐
│  MCP Server     │ (Figma API Integration)
│                 │
│ • 11 Tools      │
│ • WCAG Checks   │
│ • Token Checks  │
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────┐
│   Figma API     │ (Design Data)
└─────────────────┘
```

Each component is independently deployable and can be customized!

---

## Configuration Checklist

Use **[CONFIGURATION_CHECKLIST.md](./CONFIGURATION_CHECKLIST.md)** to track your progress through the setup process.
