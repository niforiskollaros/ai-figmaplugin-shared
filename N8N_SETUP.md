# n8n Workflow Setup Guide

This guide provides step-by-step instructions for importing and configuring all 5 n8n workflows. This is the most critical part of the system setup.

---

## Prerequisites

Before starting, ensure you have:
- ✅ n8n instance (cloud or self-hosted) - https://n8n.io
- ✅ OpenAI API key - from https://platform.openai.com/api-keys
- ✅ Figma Personal Access Token (for MCP server) - from https://www.figma.com/settings
- ✅ (Optional) Slack webhook URL - for notifications
- ✅ (Optional) Magic Patterns API key - for Mode 5

---

## Part 1: Access Your n8n Instance

### Option A: n8n Cloud (Recommended for beginners)
1. Go to https://n8n.io and sign up
2. Create a new cloud instance
3. Wait for instance to be ready (~2 minutes)
4. Access your n8n editor

### Option B: Self-Hosted n8n
1. Follow https://docs.n8n.io/hosting/
2. Access your n8n instance URL
3. Complete initial setup

---

## Part 2: Add Credentials to n8n

Before importing workflows, set up your credentials so they're ready to use.

### 2.1 Add OpenAI Credentials

1. In n8n, click **Credentials** in the left sidebar
2. Click **Add Credential**
3. Search for "OpenAI"
4. Select **OpenAI API**
5. Configure:
   - **Credential Name**: `OpenAI Design Analysis` (or any name you prefer)
   - **API Key**: Paste your OpenAI API key (starts with `sk-`)
6. Click **Save**
7. **Important**: Note down the credential name - you'll need it when importing workflows

### 2.2 Add Slack Credentials (Optional)

If you want Slack notifications:

1. Click **Add Credential**
2. Search for "Slack"
3. Select **Slack OAuth2 API**
4. Click **Connect my account**
5. Follow the OAuth flow
6. Name it: `Slack Design Notifications`
7. Click **Save**

---

## Part 3: Import Workflows

You'll import 5 workflows, one for each analysis mode.

### 3.1 Import Workflow 1: Design System Check

1. In n8n, click **Workflows** in the left sidebar
2. Click **Add Workflow** button (top right)
3. Click the **⋯ menu** (three dots) > **Import from File**
4. Navigate to `n8n-workflows/Design System Check/Design System Check.json`
5. Click **Import**
6. The workflow opens in the editor

### 3.2 Configure Workflow 1

Now you need to update several nodes in this workflow:

#### Update OpenAI Credentials

1. Find the **OpenAI Chat Model** node (purple node in the workflow)
2. Click on it to open settings
3. Under **Credentials**, click the dropdown
4. Select the OpenAI credential you created earlier
5. **Model**: Ensure it's set to `gpt-4o-mini` or `gpt-5-mini`
6. Click outside the node to save

#### Update MCP Server URL

1. Find the **MCP Node Details** tool node (or similar MCP tool nodes)
2. Click on it
3. Look for the URL parameter
4. Replace `https://YOUR_MCP_SERVER_URL` with:
   - Use existing: `https://OUR_CUSTOM_MCP_SERVER-production.up.railway.app`
   - Or your own MCP server URL if you deployed one
5. Repeat for ALL MCP tool nodes in the workflow (there are usually 3-4)

#### Update Slack Configuration (Optional)

1. Find the **Send a message** node (Slack node)
2. Click on it
3. Select your Slack credentials
4. Choose the channel where you want notifications
5. If you don't want Slack notifications, you can delete this node

#### Activate the Workflow

1. Click the **Inactive** toggle in the top-right (it will turn green and say **Active**)
2. The workflow is now running!

#### Get the Webhook URL

1. Find the **Webhook Trigger** node (first node)
2. Click on it
3. You'll see **Production URL** or **Test URL**
4. Copy the **Production URL** - it will look like:
   ```
   https://your-n8n.app.n8n.cloud/webhook/design-system-check
   ```
5. **Save this URL** - you'll need it for the Figma plugin configuration!

#### Save the Workflow

1. Click **Save** button (top-right)
2. Name it: `Design System Check`

### 3.3 Import Remaining 4 Workflows

Repeat the exact same process for each workflow:

#### Workflow 2: Component Analysis
- File: `n8n-workflows/Component Analysis/Component Analysis.json`
- Webhook URL will be: `.../webhook/component-analysis`
- Same configuration steps as above

#### Workflow 3: Color Audit
- File: `n8n-workflows/Color Audit/Color Audit.json`
- Webhook URL will be: `.../webhook/color-audit`
- Same configuration steps as above

#### Workflow 4: UX Heuristic Analysis
- File: `n8n-workflows/UX Heuristics/UX Heuristic Analysis.json`
- Webhook URL will be: `.../webhook/ux-analysis`
- Same configuration steps as above

#### Workflow 5: Design Alternatives - Magic Patterns
- File: `n8n-workflows/Design Alternatives - Magic Patterns/Design Alternatives - Magic Patterns.json`
- Webhook URL will be: `.../webhook/magic-patterns`
- **Additional step**: Add Magic Patterns API key

**For Mode 5, you have an extra configuration:**

1. Find the **HTTP Request** node that calls Magic Patterns API
2. Click on it
3. Find **Headers** section
4. Update the `x-mp-api-key` header value with your Magic Patterns API key
5. Save the node

---

## Part 4: Verify All Workflows

### 4.1 Check Workflow List

You should now have 5 active workflows:
- ✅ Design System Check
- ✅ Component Analysis
- ✅ Color Audit
- ✅ UX Heuristic Analysis
- ✅ Design Alternatives - Magic Patterns

All should show **Active** (green) status.

### 4.2 Collect All Webhook URLs

Create a document with all 5 webhook URLs:

```
design-system-check: https://your-n8n.app.n8n.cloud/webhook/design-system-check
component-analysis: https://your-n8n.app.n8n.cloud/webhook/component-analysis
color-audit: https://your-n8n.app.n8n.cloud/webhook/color-audit
ux-analysis: https://your-n8n.app.n8n.cloud/webhook/ux-analysis
magic-patterns: https://your-n8n.app.n8n.cloud/webhook/magic-patterns
```

You'll need these for configuring the Figma plugin!

---

## Part 5: Test Each Workflow

Before connecting the Figma plugin, test each workflow independently.

### 5.1 Test with n8n Test Webhook

1. Open **Design System Check** workflow
2. Click on the **Webhook Trigger** node
3. Click **Listen for Test Event**
4. In a new terminal or tool like Postman, send a POST request:

```bash
curl -X POST https://your-n8n.app.n8n.cloud/webhook-test/design-system-check \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "fileKey": "Hn7BjexKacggQ3i17QcIXM",
      "nodeId": "1:2",
      "fileName": "Test File",
      "frameName": "Test Frame",
      "dsFileKey": "Hn7BjexKacggQ3i17QcIXM"
    }
  }'
```

5. Check n8n execution - you should see:
   - ✅ Webhook received data
   - ✅ AI Agent executed
   - ✅ MCP tools called
   - ✅ Response formatted
   - (✅ Slack notification sent - if configured)

### 5.2 Check Execution Logs

1. Click **Executions** in the left sidebar
2. You should see your test execution
3. Click on it to see details
4. Check each node for successful execution
5. If any node failed, click on it to see the error message

**Common Issues:**
- **OpenAI node fails**: Check API key, check you have credits, verify model name
- **MCP tool fails**: Check MCP server URL is correct, check server is running
- **Parse error**: Check AI is returning valid JSON format

---

## Part 6: Understand Workflow Structure

All workflows follow the same pattern. Understanding this helps with troubleshooting:

### Standard Workflow Flow

```
1. Webhook Trigger
   ↓
2. Extract Data (Code node)
   ↓
3. Respond to Plugin (IMMEDIATE - prevents timeout)
   ↓
4. Store Screenshot Data (Set node - Mode 5 only)
   ↓
5. AI Agent (OpenAI with MCP tools)
   ├─→ MCP Tool 1 (e.g., get_node_details)
   ├─→ MCP Tool 2 (e.g., get_design_system)
   └─→ MCP Tool 3 (e.g., verify_compliance)
   ↓
6. Parse Agent Output (Code node)
   ↓
7. Format Slack Message (Code node)
   ↓
8. Send Slack Notification (Slack node - optional)
```

### Key Nodes Explained

**Webhook Trigger**: Receives POST request from Figma plugin

**Extract Data**: Extracts fileKey, nodeId, etc. from nested body structure
```javascript
const data = $input.first().json.body.body;  // Note: nested body!
```

**Respond to Plugin**: Sends immediate response to prevent Figma timeout
- Critical for Mode 5 (Magic Patterns) which takes 1-3 minutes
- Sends status: "processing" message

**AI Agent**: The core intelligence
- System message defines AI's role and expertise
- User message provides context and task
- Tools available: 3-4 MCP tools depending on mode
- Output: JSON array of findings

**Parse Agent Output**: Multi-strategy JSON extraction
- Handles various AI output formats (direct JSON, markdown code blocks, etc.)
- Groups findings by severity
- Fallback to empty array if parsing fails

**Format Slack Message**: Creates readable Slack notification
- Uses emojis for severity
- Includes Figma deep link
- Summary counts

---

## Part 7: Customize Workflows (Optional)

### 7.1 Modify AI Prompts

To change what the AI analyzes:

1. Open any workflow
2. Find the **Prepare AI Input** or similar Code node
3. Edit the `systemMessage` and `userMessage` variables
4. **System Message**: Defines the AI's expertise and role
5. **User Message**: Provides specific instructions and output format
6. Click **Execute Node** to test
7. Save workflow

Example system message modification:
```javascript
const systemMessage = `You are a senior UX designer specializing in...
[Add your custom expertise here]

Your analysis should focus on:
- [Custom criterion 1]
- [Custom criterion 2]
...`;
```

### 7.2 Adjust AI Parameters

In the **OpenAI Chat Model** node:

- **Temperature**: Higher = more creative (0-2, default 1)
- **Max Tokens**: Maximum response length (default 4000-32768)
- **Model**: `gpt-4o-mini` (fast/cheap) or `gpt-5-mini` (better quality)

### 7.3 Add More MCP Tools

To add another analysis tool:

1. Click the **+** button in the workflow
2. Search for **HTTP Request**
3. Select **@n8n/n8n-nodes-langchain.toolHttpRequest**
4. Configure:
   - **Method**: POST
   - **URL**: `https://YOUR_MCP_SERVER/mcp`
   - **Body**: JSON with tool name and arguments
5. Connect it to the AI Agent node
6. Save workflow

Example MCP tool call:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_typography",
    "arguments": {
      "fileKey": "{{ $input.first().json.fileKey }}",
      "nodeId": "{{ $input.first().json.nodeId }}"
    }
  }
}
```

---

## Troubleshooting n8n Issues

### Workflow shows "Inactive"
- Click the toggle to activate it
- Check for any configuration errors (red nodes)
- Save the workflow after activation

### "Credentials not found" error
- Go to Credentials and verify OpenAI credential exists
- Re-select the credential in the OpenAI Chat Model node
- Save the workflow

### "Webhook not found" error
- Ensure workflow is activated (green toggle)
- Copy the Production URL (not Test URL)
- Check URL doesn't have extra spaces or characters

### AI returns no findings
- Check OpenAI API key is valid and has credits
- Check model name is correct (`gpt-4o-mini` not `gpt-4`)
- Look at AI Agent node output - is it actually calling the MCP tools?
- Check MCP server is responding (try the health endpoint)

### MCP tools time out
- Verify MCP server URL is correct
- Check MCP server is running: `curl https://YOUR_MCP_SERVER/health`
- Check Figma token is valid (MCP server needs it)
- Check firewall/network settings aren't blocking requests

### Parse Agent Output fails
- Click on the node to see the actual AI output
- Check if output is valid JSON
- If output has extra text, add another parsing strategy
- Increase `maxTokens` if output seems truncated

### Slack notifications not sending
- Verify Slack credentials are connected
- Check channel exists and bot has access
- Check "Format Slack Message" node output is valid
- Try deleting and re-creating the Slack node

---

## Advanced: Deploying Your Own MCP Server

If you want to deploy your own MCP server instead of using the shared one:

### Requirements
- Railway account (or any Node.js hosting platform)
- MCP server code (contact for access)
- Figma Personal Access Token

### Steps

1. **Get the MCP server code** (separate repository)

2. **Deploy to Railway**:
   ```bash
   # In MCP server directory
   railway init
   railway up
   ```

3. **Set environment variables** in Railway:
   ```
   FIGMA_TOKEN=figd_your_token_here
   PORT=3845
   NODE_ENV=production
   ```

4. **Get your Railway URL**: `https://your-mcp-server.up.railway.app`

5. **Update all workflows**:
   - Open each workflow
   - Find all MCP tool nodes (HTTP Request nodes)
   - Replace URL with your new server URL
   - Save each workflow

6. **Test MCP server**:
   ```bash
   curl https://your-mcp-server.up.railway.app/health
   ```
   Should return: `{"status": "ok"}`

---

## Next Steps

Once all n8n workflows are set up and tested:

1. ✅ Go back to **INSTALLATION.md** Part 3
2. ✅ Configure the Figma plugin with your webhook URLs
3. ✅ Test the complete system end-to-end
4. ✅ Share with your team!

---

## n8n Setup Checklist

Use this to track your progress:

- [ ] n8n instance is running
- [ ] OpenAI credentials added to n8n
- [ ] (Optional) Slack credentials added
- [ ] Workflow 1: Design System Check imported & configured
- [ ] Workflow 2: Component Analysis imported & configured
- [ ] Workflow 3: Color Audit imported & configured
- [ ] Workflow 4: UX Heuristic Analysis imported & configured
- [ ] Workflow 5: Magic Patterns imported & configured (optional)
- [ ] All workflows activated (green toggle)
- [ ] All webhook URLs collected
- [ ] Test execution successful for at least one workflow
- [ ] MCP server URL updated in all workflows
- [ ] (Optional) Slack notifications configured

---

## Need Help?

Common resources:
- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io
- OpenAI API Docs: https://platform.openai.com/docs

For workflow-specific issues, check the execution logs in n8n - they show exactly where things fail and why!
