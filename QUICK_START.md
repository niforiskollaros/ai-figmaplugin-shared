# Quick Start Guide (TL;DR)

**Want to get started fast? Here's the 5-minute overview.**

For detailed instructions, see [INSTALLATION.md](./INSTALLATION.md).

---

## 🎯 What You'll Get

5 AI analysis modes in Figma:
1. **Design System Check** - Token compliance
2. **Component Analysis** - Architecture review
3. **Color Audit** - WCAG accessibility
4. **UX Heuristics** - Usability evaluation
5. **Magic Patterns** - AI design alternatives (optional)

**Time to complete**: Each analysis takes 15-120 seconds.

---

## 📋 Prerequisites Checklist

Before starting, get these ready:

- [ ] **Figma account** + Personal Access Token (https://www.figma.com/settings)
- [ ] **n8n instance** (https://n8n.io - free cloud or self-hosted)
- [ ] **OpenAI API key** (https://platform.openai.com/api-keys)
- [ ] **Figma Desktop app** (required for plugin)

**Optional**:
- [ ] Magic Patterns API key ($99/mo) - for Mode 5
- [ ] Slack workspace - for notifications

---

## ⚡ Setup in 3 Steps

### Step 1: Set Up n8n (20-30 min)

1. **Sign up for n8n** cloud or deploy self-hosted
2. **Add OpenAI credentials** in n8n (Credentials → Add → OpenAI API)
3. **Import 5 workflows**:
   - Open each JSON in `n8n-workflows/` folder
   - Import to n8n (Menu → Import from File)
   - Update OpenAI credentials in each
   - Update MCP server URL in tool nodes: `https://OUR_CUSTOM_MCP_SERVER-production.up.railway.app`
   - Activate each workflow (toggle in top-right)
   - Copy webhook URL from each

**You'll get 5 webhook URLs like**:
```
https://your-n8n.app.n8n.cloud/webhook/design-system-check
https://your-n8n.app.n8n.cloud/webhook/component-analysis
...
```

**Detailed guide**: [N8N_SETUP.md](./N8N_SETUP.md)

---

### Step 2: Configure Figma Plugin (5 min)

1. **Get your Design System file key**:
   - Open your design system in Figma
   - Copy from URL: `figma.com/file/YOUR_KEY_HERE/...`

2. **Edit `Figma Plugin/code.js`**:
   ```javascript
   // Line 5
   const DS_FILE_KEY = 'YOUR_KEY_HERE';

   // Lines 7-13
   const WEBHOOK_URLS = {
     'design-system-check': 'YOUR_WEBHOOK_URL_1',
     'component-analysis': 'YOUR_WEBHOOK_URL_2',
     // ... paste your 5 webhook URLs
   };
   ```

3. **Edit `Figma Plugin/manifest.json`**:
   ```json
   {
     "networkAccess": {
       "allowedDomains": [
         "https://your-n8n.app.n8n.cloud",
         "https://OUR_CUSTOM_MCP_SERVER-production.up.railway.app"
       ]
     }
   }
   ```

4. **Import to Figma**:
   - Open Figma Desktop
   - **Menu** → **Plugins** → **Development** → **Import plugin from manifest**
   - Select `manifest.json`

---

### Step 3: Test It (2 min)

1. Open any Figma file
2. Get the file key from URL
3. Run plugin: **Menu** → **Plugins** → **Signal AI Design Feedback**
4. Paste file key, click **Save**
5. Select a frame
6. Click **Design System Check**
7. Wait 15-30 seconds → Annotations appear! ✅

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Network error" | Check webhook URLs in code.js, verify n8n workflows are activated |
| "Webhook 500" | Check n8n execution logs, verify OpenAI credentials |
| No annotations | Open browser console (Cmd+Opt+J), check for errors |
| Mode 5 timeout | Use JPG format (not PNG) with scale: 1 in code.js:94 |

---

## 📚 Full Documentation

- **[INSTALLATION.md](./INSTALLATION.md)** - Complete setup guide with troubleshooting
- **[N8N_SETUP.md](./N8N_SETUP.md)** - Detailed n8n workflow configuration
- **[CONFIGURATION_CHECKLIST.md](./CONFIGURATION_CHECKLIST.md)** - Track your progress
- **[README.md](./README.md)** - System overview and architecture

---

## 💰 What It Costs

| Service | Cost |
|---------|------|
| n8n Cloud | $0-20/mo (free tier available) |
| OpenAI API | $10-50/mo (usage-based) |
| Figma API | Free |
| MCP Server | Free (using shared server) |
| **Total** | **$10-70/mo** (without Magic Patterns) |

Add $99/mo + $0.25/generation if using Magic Patterns.

---

## 🎨 How to Use

1. Select any frame in Figma
2. Run the plugin
3. Choose an analysis mode
4. Get AI feedback in 15-120 seconds
5. Review color-coded annotations

**That's it!** The AI analyzes your design and shows you issues directly in Figma.

---

## 🚀 Next Steps

Once it's working:

- ✅ Test all 5 modes
- ✅ Share with your team
- ✅ Customize AI prompts for your brand guidelines
- ✅ Set up Slack notifications
- ✅ Track usage and value

---

## 🆘 Need Help?

1. Check [INSTALLATION.md](./INSTALLATION.md) troubleshooting section
2. Review n8n execution logs for errors
3. Open browser console in Figma for client errors
4. Verify all prerequisites are complete

---

**⏱️ Total Setup Time**: 30-45 minutes

**🎉 Now you have AI-powered design analysis in Figma!**

Start with Mode 1 (Design System Check) - it's the most useful for everyday work.
