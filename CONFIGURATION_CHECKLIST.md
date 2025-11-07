# Configuration Checklist

Use this checklist to track your progress through the setup process. Check off each item as you complete it!

---

## Phase 1: Prerequisites ⚙️

### Accounts & Access
- [ ] **Figma account** created and logged in
- [ ] **n8n instance** running (cloud or self-hosted)
- [ ] **OpenAI account** with API access
- [ ] (Optional) **Magic Patterns account** with subscription
- [ ] (Optional) **Slack workspace** where you can install apps

### API Keys Collected
- [ ] **Figma Personal Access Token** obtained (starts with `figd_`)
  - Location: https://www.figma.com/settings
  - Saved securely: _______________

- [ ] **OpenAI API Key** obtained (starts with `sk-`)
  - Location: https://platform.openai.com/api-keys
  - Saved securely: _______________

- [ ] (Optional) **Magic Patterns API Key** obtained (starts with `mp_live_`)
  - Location: https://www.magicpatterns.com (account settings)
  - Saved securely: _______________

- [ ] (Optional) **Slack Webhook URL** obtained
  - Location: https://api.slack.com/apps
  - Saved securely: _______________

---

## Phase 2: n8n Setup 🔄

### Add Credentials to n8n
- [ ] Opened n8n instance
- [ ] Added **OpenAI credentials** to n8n
  - Credential name: _______________
- [ ] (Optional) Added **Slack OAuth credentials** to n8n
  - Credential name: _______________

### Import Workflows
- [ ] **Workflow 1: Design System Check** imported
- [ ] **Workflow 2: Component Analysis** imported
- [ ] **Workflow 3: Color Audit** imported
- [ ] **Workflow 4: UX Heuristic Analysis** imported
- [ ] **Workflow 5: Magic Patterns** imported (optional)

### Configure Workflow 1: Design System Check
- [ ] Opened workflow in n8n editor
- [ ] Updated **OpenAI Chat Model** node with credentials
- [ ] Verified model is set to `gpt-4o-mini` or `gpt-5-mini`
- [ ] Updated **MCP Node Details** tool with server URL: _______________
- [ ] Updated **all MCP tool nodes** (get_design_system, verify_compliance, etc.)
- [ ] (Optional) Configured **Slack Send Message** node
- [ ] **Activated** workflow (green toggle)
- [ ] Copied **webhook URL**: _______________
- [ ] Saved workflow

### Configure Workflow 2: Component Analysis
- [ ] Opened workflow in n8n editor
- [ ] Updated **OpenAI Chat Model** node with credentials
- [ ] Updated **all MCP tool nodes** with server URL
- [ ] (Optional) Configured **Slack** node
- [ ] **Activated** workflow
- [ ] Copied **webhook URL**: _______________
- [ ] Saved workflow

### Configure Workflow 3: Color Audit
- [ ] Opened workflow in n8n editor
- [ ] Updated **OpenAI Chat Model** node with credentials
- [ ] Updated **all MCP tool nodes** with server URL
- [ ] (Optional) Configured **Slack** node
- [ ] **Activated** workflow
- [ ] Copied **webhook URL**: _______________
- [ ] Saved workflow

### Configure Workflow 4: UX Heuristic Analysis
- [ ] Opened workflow in n8n editor
- [ ] Updated **OpenAI Chat Model** node with credentials
- [ ] Updated **all MCP tool nodes** with server URL
- [ ] (Optional) Configured **Slack** node
- [ ] **Activated** workflow
- [ ] Copied **webhook URL**: _______________
- [ ] Saved workflow

### Configure Workflow 5: Magic Patterns (Optional)
- [ ] Opened workflow in n8n editor
- [ ] Updated **OpenAI Chat Model** node with credentials
- [ ] Updated **all MCP tool nodes** with server URL
- [ ] Updated **Magic Patterns HTTP Request** with API key in header
- [ ] (Optional) Configured **Slack** node
- [ ] **Activated** workflow
- [ ] Copied **webhook URL**: _______________
- [ ] Saved workflow

### Test n8n Workflows
- [ ] Tested **Design System Check** with test webhook
- [ ] Checked execution logs - all nodes successful
- [ ] Tested at least one other workflow
- [ ] Verified MCP server is responding

---

## Phase 3: Figma Plugin Configuration 🎨

### Get Your File Keys
- [ ] Opened **design system file** in Figma
- [ ] Copied design system file key from URL: _______________
- [ ] Opened **project file** you want to analyze
- [ ] Copied project file key from URL: _______________

### Update Plugin Files
- [ ] Opened `Figma Plugin/code.js` in text editor
- [ ] Updated `DS_FILE_KEY` (line 5) with design system key
- [ ] Updated all 5 webhook URLs (lines 7-13) from n8n:
  - [ ] design-system-check: _______________
  - [ ] component-analysis: _______________
  - [ ] color-audit: _______________
  - [ ] ux-analysis: _______________
  - [ ] magic-patterns: _______________
- [ ] Saved `code.js`

### Update Manifest
- [ ] Opened `Figma Plugin/manifest.json` in text editor
- [ ] Updated `allowedDomains` with:
  - [ ] Your n8n instance URL: _______________
  - [ ] MCP server URL: _______________
- [ ] Saved `manifest.json`

### Import Plugin to Figma
- [ ] Opened **Figma Desktop app** (required)
- [ ] Went to **Menu** > **Plugins** > **Development** > **Import plugin from manifest**
- [ ] Selected `manifest.json` from `Figma Plugin` folder
- [ ] Plugin imported successfully
- [ ] Plugin appears in Plugins menu

### Configure Plugin
- [ ] Ran plugin: **Menu** > **Plugins** > **Development** > **Signal AI Design Feedback**
- [ ] Entered **project file key** in plugin UI
- [ ] Clicked **Save Project File Key**
- [ ] Green status indicator appeared

---

## Phase 4: Testing 🧪

### Test Mode 1: Design System Check
- [ ] Opened Figma project file
- [ ] Selected a frame or component
- [ ] Ran plugin and clicked **Design System Check**
- [ ] Waited 15-30 seconds
- [ ] ✅ Color-coded annotations appeared next to selection
- [ ] ✅ Figma notification showed success message
- [ ] (Optional) ✅ Slack notification received

**If failed**:
- [ ] Checked browser console (Cmd+Option+J / Ctrl+Shift+J) for errors
- [ ] Verified webhook URL is correct in code.js
- [ ] Checked n8n workflow is activated
- [ ] Reviewed n8n execution logs
- [ ] Issue resolved: _______________

### Test Mode 2: Component Analysis
- [ ] Selected a different frame
- [ ] Clicked **Component Analysis**
- [ ] ✅ Annotations appeared with component insights

### Test Mode 3: Color Audit
- [ ] Selected a frame with colors
- [ ] Clicked **Color Audit**
- [ ] ✅ Color findings with WCAG results appeared

### Test Mode 4: UX Heuristic Analysis
- [ ] Selected a UI frame (login, dashboard, etc.)
- [ ] Clicked **UX Heuristic Analysis**
- [ ] ✅ Comprehensive UX report created

### Test Mode 5: Magic Patterns (Optional)
- [ ] Selected a frame to generate alternatives
- [ ] Clicked **Magic Patterns Alternatives**
- [ ] Waited 60-120 seconds
- [ ] ✅ Result frame appeared with link to alternatives

---

## Phase 5: Team Rollout 👥 (Optional)

### Documentation for Team
- [ ] Created team-facing setup guide (simplified version)
- [ ] Documented which project file keys to use
- [ ] Created Slack channel for notifications
- [ ] Prepared FAQ based on testing

### Share with Team
- [ ] Sent plugin files to team members
- [ ] Shared configuration instructions
- [ ] Explained how to get project file keys
- [ ] Set up team training session

### Team Testing
- [ ] At least 2 other team members successfully installed plugin
- [ ] Team members can run analyses
- [ ] Slack notifications working for team
- [ ] Collected feedback: _______________

---

## Phase 6: Customization 🎨 (Optional)

### Customize AI Prompts
- [ ] Identified specific design guidelines to check
- [ ] Updated system messages in n8n workflows
- [ ] Tested custom prompts
- [ ] Documented changes

### Add Custom Analysis
- [ ] Identified additional MCP tools needed
- [ ] Added new tool nodes to workflows
- [ ] Updated AI prompts to use new tools
- [ ] Tested new analysis

### Adjust Settings
- [ ] Tuned AI temperature for desired creativity level
- [ ] Adjusted maxTokens if needed
- [ ] Changed severity thresholds if needed
- [ ] Optimized for speed vs. quality

---

## Troubleshooting Log 📝

Use this space to track any issues encountered and how you resolved them:

### Issue 1
- **Problem**: _______________
- **Error message**: _______________
- **Solution**: _______________
- **Date resolved**: _______________

### Issue 2
- **Problem**: _______________
- **Error message**: _______________
- **Solution**: _______________
- **Date resolved**: _______________

### Issue 3
- **Problem**: _______________
- **Error message**: _______________
- **Solution**: _______________
- **Date resolved**: _______________

---

## Final Verification ✅

Complete this section once everything is working:

- [ ] All 5 modes (or 4 if skipping Magic Patterns) working correctly
- [ ] Annotations appear reliably
- [ ] Analysis results are accurate and useful
- [ ] (Optional) Slack notifications working
- [ ] Team members (if applicable) can use the system
- [ ] Documentation is accessible to team
- [ ] Credentials are stored securely
- [ ] .gitignore prevents committing credentials

### System Info
- **Setup completed on**: _______________
- **Setup completed by**: _______________
- **n8n instance**: _______________ (cloud/self-hosted)
- **MCP server**: _______________ (shared/own deployment)
- **Team size**: _______________ users
- **Primary use cases**: _______________

---

## Maintenance Schedule 🔧

Set reminders for regular maintenance:

### Monthly
- [ ] Check OpenAI API usage and costs
- [ ] Review n8n execution logs for errors
- [ ] Verify all workflows still activated
- [ ] Check for n8n/OpenAI updates

### Quarterly
- [ ] Rotate API keys (security best practice)
- [ ] Review and update AI prompts
- [ ] Gather team feedback on accuracy
- [ ] Update documentation with learnings

### As Needed
- [ ] Add new analysis modes for new design guidelines
- [ ] Update design system file key if it changes
- [ ] Train new team members
- [ ] Troubleshoot issues as they arise

---

## Success Metrics 📊

Track the value of the system:

### Usage
- Analyses run per week: _______________
- Most used mode: _______________
- Least used mode: _______________
- Average time saved per analysis: _______________

### Quality
- Accuracy of findings (1-10): _______________
- Usefulness of recommendations (1-10): _______________
- False positive rate: _______________
- Design system compliance improvement: _______________%

### Team Adoption
- % of designers using regularly: _______________%
- Issues found by tool vs. manual review: _______________
- Time saved in design reviews: _______________ hours/week

---

## Notes & Observations 📝

Use this space for any additional notes, observations, or lessons learned during setup and usage:

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

---

**🎉 Congratulations on completing the setup!**

You now have a fully functional AI-powered design analysis system integrated with your Figma workflow. Share your experience and help improve the system!
