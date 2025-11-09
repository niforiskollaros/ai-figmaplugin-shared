# Signal AI Design Monitoring

> **AI-powered design analysis, accessibility checks, and design system governance - directly in Figma**

Automatically analyze your Figma designs with AI to get instant feedback on design system compliance, accessibility, component architecture, UX heuristics, and even generate design alternatives.

---

## ✨ Features

### 5 Analysis Modes

1. **🎯 Design System Check** (15-30 sec)
   - Verify design token usage (colors, typography, spacing)
   - Detect hard-coded values that should use design system
   - Check variable/style compliance
   - Get severity-coded findings (High/Medium/Low)

2. **🧩 Component Analysis** (15-30 sec)
   - Analyze component structure and hierarchy
   - Review component architecture decisions
   - Get categorized insights (Architecture, Maintenance, Governance, etc.)
   - Identify component library health issues

3. **🎨 Color Audit** (15-30 sec)
   - WCAG 2.1 contrast ratio validation (AA/AAA)
   - Color accessibility checks
   - Design token usage verification
   - Hex color palette extraction

4. **🔍 UX Heuristic Analysis** (20-40 sec)
   - Nielsen's 10 usability heuristics evaluation
   - User experience problem identification
   - Detailed findings with recommendations
   - Comprehensive PDF-style report in Figma

5. **✨ Magic Patterns Alternatives** (60-120 sec)
   - AI-generated design variations
   - 4 alternative designs based on your selection
   - Maintains your design's style and purpose
   - Powered by Magic Patterns API

---

## 🏗️ System Architecture

The system consists of three main components:

```
Figma Plugin → n8n Workflows → MCP Server → Figma API
                  ↓                ↓
            OpenAI GPT       Specialized
                            Analysis Tools
```

**Data Flow**:
1. User selects frame in Figma and runs plugin
2. Plugin sends context (fileKey, nodeId, frameName) to n8n webhook
3. n8n AI Agent orchestrates analysis using MCP tools
4. MCP server calls Figma API with specialized analysis tools
5. AI synthesizes findings and returns structured JSON
6. Plugin renders color-coded annotations in Figma
7. Optional Slack notification sent to team

---

## 📦 What's Included

```
distribution/
├── Figma Plugin/           # Figma plugin files
│   ├── code.js             # Plugin logic (configure webhook URLs here)
│   ├── ui.html             # Plugin UI
│   └── manifest.json       # Plugin manifest (configure domains here)
├── n8n-workflows/          # 5 n8n workflow JSONs (ready to import)
│   ├── Design System Check/
│   ├── Component Analysis/
│   ├── Color Audit/
│   ├── UX Heuristics/
│   └── Design Alternatives - Magic Patterns/
├── mcp-server/             # Optional: Deploy your own MCP server
│   ├── server.js           # Complete MCP server code (11 tools)
│   ├── package.json        # Dependencies
│   ├── Procfile            # Railway deployment config
│   ├── .env.example        # Environment template
│   ├── .gitignore          # Git ignore rules
│   └── README.md           # Railway deployment guide
├── docs/                   # (empty, documentation in root)
├── .env.example            # Environment variables template
├── INSTALLATION.md         # Complete setup guide (START HERE!)
├── N8N_SETUP.md            # Detailed n8n workflow configuration
├── CONFIGURATION_CHECKLIST.md  # Track your setup progress
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites

You'll need accounts for:
- **Figma** (free or paid) - Get Personal Access Token
- **n8n** (cloud or self-hosted) - For AI workflow orchestration
- **OpenAI** - API key with GPT-4o-mini or GPT-5-mini access
- **MCP Server** (use existing shared server OR deploy your own - see `mcp-server/` folder)
- **Magic Patterns** (optional) - For Mode 5 design generation
- **Slack** (optional) - For team notifications

### Installation Steps

1. **Read [INSTALLATION.md](./INSTALLATION.md)** - Complete setup guide
2. **Follow [N8N_SETUP.md](./N8N_SETUP.md)** - Import & configure workflows
3. **Use [CONFIGURATION_CHECKLIST.md](./CONFIGURATION_CHECKLIST.md)** - Track progress

**⏱️ Setup Time**: 30-60 minutes for full setup

---

## 🎯 How It Works

### For Users

1. Open your Figma file
2. Select a frame or component
3. Run the plugin: **Menu** > **Plugins** > **Signal AI Design Feedback**
4. Choose an analysis mode
5. Wait 15-120 seconds (depending on mode)
6. Get instant AI feedback with color-coded annotations

### Behind the Scenes

Each analysis mode follows this flow:

1. **Capture Context**: Plugin gets fileKey, nodeId, frameName
2. **Send to n8n**: HTTP POST to workflow webhook
3. **AI Orchestration**: n8n AI Agent decides which MCP tools to use
4. **Gather Data**: MCP server fetches design data from Figma API
5. **AI Analysis**: OpenAI GPT analyzes data with specialized prompts
6. **Return Results**: Structured JSON with findings and recommendations
7. **Render in Figma**: Plugin creates visual annotations next to your design

---

## 🛠️ Configuration

### Key Configuration Points

#### 1. Figma Plugin (`Figma Plugin/code.js`)

```javascript
// Line 5: Your design system file key
const DS_FILE_KEY = 'YOUR_DESIGN_SYSTEM_FILE_KEY_HERE';

// Lines 7-13: Your n8n webhook URLs
const WEBHOOK_URLS = {
  'design-system-check': 'https://YOUR_N8N_INSTANCE.app.n8n.cloud/webhook/...',
  // ... 4 more modes
};
```

#### 2. Plugin Manifest (`Figma Plugin/manifest.json`)

```json
{
  "networkAccess": {
    "allowedDomains": [
      "https://YOUR_N8N_INSTANCE.app.n8n.cloud",
      "https://YOUR_MCP_SERVER.up.railway.app"
    ]
  }
}
```

#### 3. n8n Workflows (5 files)

For each workflow:
- Add OpenAI credentials
- Update MCP server URL in all MCP tool nodes
- (Optional) Add Slack credentials for notifications
- Activate the workflow
- Copy the webhook URL

---

## 📊 Analysis Examples

### Design System Check Output

```
HIGH: Hard-coded Color
  Issue: Button background uses #667eea instead of design token
  Reason: Makes theme changes difficult, breaks design system
  Recommendation: Replace with $color-primary-500 token

MEDIUM: Missing Variable
  Padding of 24px should use $spacing-6 token
  Why: Inconsistent spacing across design
  Fix: Apply spacing variable for consistency
```

### UX Heuristic Analysis Output

```
🔴 HIGH SEVERITY
  Heuristic: Error Prevention
  Issue: Delete action has no confirmation dialog
  Why: Users might accidentally delete important data
  Fix: Add confirmation modal before destructive actions

🟡 MEDIUM SEVERITY
  Heuristic: Visibility of System Status
  Issue: No loading indicator during save
  Why: Users don't know if their action was registered
  Fix: Show spinner or progress indicator
```

---

## 🎨 Customization

### Modify AI Prompts

Edit the `systemMessage` in n8n workflow Code nodes:

```javascript
const systemMessage = `You are a [YOUR EXPERTISE] specializing in...

Your analysis should focus on:
- [Custom criterion 1]
- [Custom criterion 2]
...`;
```

### Add More MCP Tools

The MCP server has 11 built-in analysis tools:

1. `get_node_details` - Node structure, dimensions, properties
2. `get_design_system` - All styles from design system file
3. `get_variables` - Figma variables (colors, spacing, etc.)
4. `verify_design_system_compliance` - Token usage violations
5. `analyze_spacing` - 8px grid compliance
6. `get_file_styles` - Styles defined in file
7. `get_typography` - All TEXT nodes and properties
8. `get_color_analysis` - Color extraction with hex values
9. `check_wcag_contrast` - WCAG 2.1 AA/AAA validation
10. `get_components` - All components and instances
11. `analyze_hierarchy` - Nesting depth and complexity

Add more tools to your workflows by creating new HTTP Request tool nodes in n8n.

### Change Analysis Frequency

In n8n AI Agent node:
- **Temperature**: 0 (consistent) to 2 (creative)
- **Max Tokens**: Response length limit
- **Model**: `gpt-4o-mini` (fast) or `gpt-5-mini` (better quality)

---

## 💰 Cost Estimates

Monthly costs with moderate usage (~100 analyses/month):

| Service | Cost | Notes |
|---------|------|-------|
| n8n Cloud | $0-20 | Free tier available, paid starts at $20/mo |
| OpenAI API | $10-50 | GPT-4o-mini usage-based, ~$0.10-0.50/analysis |
| Magic Patterns | $0-124 | Optional, $99/mo + $0.25/generation |
| Figma API | $0 | Free |
| MCP Server (Railway) | $0-5 | Free tier or ~$5/mo |
| **Total** | **$10-199/mo** | Varies by usage and optional services |

**Tips to reduce costs**:
- Use free n8n self-hosted instead of cloud
- Use existing MCP server (free)
- Skip Magic Patterns (Mode 5 only)
- Lower OpenAI temperature to reduce token usage

---

## 🔒 Security & Privacy

- **No data storage**: System processes data in real-time, doesn't store it
- **Secure tokens**: Use environment variables and n8n credentials (never commit)
- **Network only**: Plugin only sends data to your configured endpoints
- **OpenAI**: Design data is sent to OpenAI for analysis (review their privacy policy)
- **Figma API**: MCP server needs read access to your Figma files

**Best Practices**:
- Use separate Figma token with minimal permissions
- Regularly rotate API keys
- Use n8n's built-in credential encryption
- Don't share your distribution folder with credentials filled in

---

## 🚀 MCP Server Options

The system requires an MCP server to interface with the Figma API. You have two options:

### Option 1: Use Existing Shared Server (Easiest)
**No setup required!** Use: `https://OUR_CUSTOM_MCP_SERVER-production.up.railway.app`

**Pros**: Zero configuration, always updated, free
**Cons**: Shared with others, no customization

### Option 2: Deploy Your Own (Recommended for Teams)
**Complete server code included** in `mcp-server/` folder!

**Why deploy your own?**
- Privacy: Your Figma data stays isolated
- Control: Customize tools and settings
- Reliability: Not dependent on shared server
- Security: Your own Figma token

**Deployment time**: 10-15 minutes to Railway

See **`mcp-server/README.md`** for complete deployment guide with:
- Railway CLI deployment
- GitHub integration deployment
- Environment variable setup
- Testing instructions
- All 11 tools documented

## 🐛 Troubleshooting

### Common Issues

**Plugin shows "Network error"**
- ✅ Check webhook URLs in `code.js`
- ✅ Verify n8n workflows are activated
- ✅ Check `manifest.json` allowedDomains

**"Webhook returned 500"**
- ✅ Check n8n execution logs
- ✅ Verify OpenAI credentials in n8n
- ✅ Ensure MCP server URL is correct

**No annotations appear**
- ✅ Check browser console (Cmd+Option+J / Ctrl+Shift+J)
- ✅ Verify Inter font is available
- ✅ Check frame remains selected

**Magic Patterns times out**
- ✅ Use JPG format (not PNG)
- ✅ Use scale: 1 (not 2)
- ✅ Check Magic Patterns API key
- ✅ Verify account has credits

See [INSTALLATION.md](./INSTALLATION.md) for detailed troubleshooting.

---

## 📚 Documentation Structure

- **[INSTALLATION.md](./INSTALLATION.md)** - Complete setup guide (start here!)
- **[N8N_SETUP.md](./N8N_SETUP.md)** - Detailed n8n workflow instructions
- **[CONFIGURATION_CHECKLIST.md](./CONFIGURATION_CHECKLIST.md)** - Track setup progress
- **README.md** - This overview document

---

## 🎓 How to Use with Your Team

1. **Set up once**: One person completes the installation
2. **Share plugin**: Team members import the plugin to their Figma
3. **Configure per user**: Each user sets their project file key in plugin UI
4. **Shared workflows**: All users connect to the same n8n instance
5. **Team notifications**: Slack channel gets all analysis results

**Per-User Requirements**:
- Figma Desktop app
- Plugin files (code.js, ui.html, manifest.json)
- Project file keys for files they want to analyze

**No per-user setup needed**:
- n8n workflows (shared)
- API keys (configured in n8n)
- MCP server (shared)

---

## 🚧 Limitations

- **Figma Desktop only**: Plugin requires desktop app (network access)
- **Analysis time**: Modes take 15-120 seconds to complete
- **Selection required**: Must select a frame or component to analyze
- **Magic Patterns**: Requires paid subscription ($99/mo + usage)
- **Token limits**: Very complex designs might hit AI token limits
- **Rate limits**: OpenAI and Figma API have rate limits

---

## 🛣️ Roadmap Ideas

Potential enhancements (not included, but possible):

- [ ] Real-time analysis as you design
- [ ] Batch analysis across multiple frames
- [ ] Historical tracking of design system compliance
- [ ] Custom rule engine for brand-specific guidelines
- [ ] Export reports to PDF/Notion/Confluence
- [ ] Integration with design system documentation
- [ ] Team analytics dashboard
- [ ] VSCode extension for design tokens

---

## 🤝 Contributing

This is a complete, working system that you can customize for your needs:

- **Modify AI prompts** to match your design guidelines
- **Add MCP tools** for custom analysis
- **Extend workflows** with additional n8n nodes
- **Customize plugin UI** to match your branding
- **Add new analysis modes** by duplicating workflows

---

## 📄 License

See LICENSE file for details.

---

## 🙏 Acknowledgments

Built with:
- **Figma Plugin API** - Design tool integration
- **n8n** - Workflow automation and AI orchestration
- **OpenAI GPT** - AI analysis engine
- **Magic Patterns** - AI design generation
- **Model Context Protocol (MCP)** - Figma API abstraction layer

---

## 📞 Support

For setup help:
1. Check [INSTALLATION.md](./INSTALLATION.md) troubleshooting section
2. Review n8n execution logs for detailed errors
3. Verify all prerequisites are met
4. Check browser console in Figma for client-side errors

---

## 🎉 Get Started

Ready to add AI superpowers to your Figma workflow?

**👉 Start with [INSTALLATION.md](./INSTALLATION.md)**

Estimated setup time: 30-60 minutes

After setup, you'll have a complete AI design analysis system running in your Figma workspace!
