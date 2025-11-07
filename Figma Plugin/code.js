// Figma AI Design Feedback Plugin v20 - Complete Working Version
// 5 Analysis Modes: Design System, Components, Colors, UX Heuristics, Magic Patterns
// Updated: Mode 2 Component Analysis with improved annotations

// ====================================================================
// CONFIGURATION - REPLACE THESE VALUES WITH YOUR OWN
// ====================================================================

// TODO: Replace with your Design System Figma file key
// How to find: Open your design system file in Figma, look at the URL:
// https://www.figma.com/file/YOUR_FILE_KEY_HERE/YourFileName
const DS_FILE_KEY = 'YOUR_DESIGN_SYSTEM_FILE_KEY_HERE';

// TODO: Replace these webhook URLs with your n8n webhook URLs
// After importing workflows to n8n, you'll get webhook URLs for each mode
// See N8N_SETUP.md for detailed instructions
const WEBHOOK_URLS = {
  'design-system-check': 'https://YOUR_N8N_INSTANCE.app.n8n.cloud/webhook/design-system-check',
  'component-analysis': 'https://YOUR_N8N_INSTANCE.app.n8n.cloud/webhook/component-analysis',
  'color-audit': 'https://YOUR_N8N_INSTANCE.app.n8n.cloud/webhook/color-audit',
  'ux-analysis': 'https://YOUR_N8N_INSTANCE.app.n8n.cloud/webhook/ux-analysis',
  'magic-patterns': 'https://YOUR_N8N_INSTANCE.app.n8n.cloud/webhook/magic-patterns'
};

// ====================================================================
// PLUGIN CODE - NO CHANGES NEEDED BELOW THIS LINE
// ====================================================================

figma.showUI(__html__, { width: 320, height: 600 });

figma.ui.onmessage = async (msg) => {

  if (msg.type === 'get-project-file-key') {
    try {
      let projectFileKey = await figma.clientStorage.getAsync('projectFileKey');
      figma.ui.postMessage({
        type: 'project-file-key-loaded',
        fileKey: projectFileKey || null
      });
    } catch (error) {
      console.error('Error loading project file key:', error);
      figma.ui.postMessage({
        type: 'project-file-key-loaded',
        fileKey: null
      });
    }
    return;
  }

  if (msg.type === 'save-project-file-key') {
    try {
      await figma.clientStorage.setAsync('projectFileKey', msg.fileKey);
      figma.ui.postMessage({ type: 'project-file-key-saved' });
      figma.notify('✅ Project file key saved');

      if (msg.fileKey === DS_FILE_KEY) {
        figma.notify('⚠️ Note: This IS your Design System file', { timeout: 3000 });
      }
    } catch (error) {
      console.error('Error saving project file key:', error);
      figma.notify('❌ Error saving file key');
    }
    return;
  }

  if (msg.type === 'run-analysis') {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.notify('❌ Please select a frame or component');
      return;
    }

    const node = selection[0];
    if (node.type !== 'FRAME' && node.type !== 'COMPONENT') {
      figma.notify('❌ Please select a frame or component');
      return;
    }

    try {
      figma.notify('⏳ Running ' + getModeLabel(msg.mode) + '...');

      let projectFileKey = await figma.clientStorage.getAsync('projectFileKey');

      if (!projectFileKey) {
        figma.notify('❌ No project file key set. Please configure in plugin UI.');
        return;
      }

      if (projectFileKey === DS_FILE_KEY && msg.mode !== 'magic-patterns') {
        figma.notify('⚠️ Warning: Analyzing Design System file itself', { timeout: 3000 });
      }

      const payload = {
        fileKey: projectFileKey,
        nodeId: node.id,
        fileName: figma.root.name,
        frameName: node.name,
        mode: msg.mode,
        dsFileKey: DS_FILE_KEY
      };


      if (msg.mode === 'magic-patterns') {
        figma.notify('📸 Exporting frame image...');
        const imageBytes = await node.exportAsync({
          format: 'JPG',
          constraint: { type: 'SCALE', value: 1 }
        });
        payload.imageBase64 = figma.base64Encode(imageBytes);
      }

      const endpoint = getWebhookEndpoint(msg.mode);

      console.log('=== SENDING TO WEBHOOK ===');
      console.log('Endpoint:', endpoint);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: payload })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook error:', errorText);
        throw new Error('Webhook returned ' + response.status);
      }

      const result = await response.json();
      console.log('Response received:', JSON.stringify(result, null, 2));

      // Handle response based on mode
      if (result.mode === 'design-system-check') {
        await createDesignSystemAnnotations(result, node);
      } else if (result.mode === 'component-analysis') {
        await createComponentAnnotations(result, node);
      } else if (result.mode === 'color-audit') {
        await createColorAnnotations(result, node);
      } else if (result.mode === 'ux-analysis') {
        await createUXReport(result, node);
      } else if (result.mode === 'magic-patterns') {
        await createMagicPatternsResult(result, node);
      }

      figma.notify('✅ ' + getModeLabel(msg.mode) + ' complete!');

    } catch (error) {
      console.error('Analysis error:', error);
      figma.notify('❌ Error: ' + error.message);
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

function getWebhookEndpoint(mode) {
  return WEBHOOK_URLS[mode] || WEBHOOK_URLS['design-system-check'];
}

function getModeLabel(mode) {
  const labels = {
    'design-system-check': 'Design System Check',
    'component-analysis': 'Component Analysis',
    'color-audit': 'Color Audit',
    'ux-analysis': 'UX Heuristic Analysis',
    'magic-patterns': 'Magic Patterns Alternatives'
  };
  return labels[mode] || mode;
}

// =====================================================
// MODE 1: DESIGN SYSTEM ANNOTATIONS
// =====================================================
async function createDesignSystemAnnotations(result, node) {
  var findings = result.findings;
  if (!findings) findings = [];

  if (findings.length === 0) {
    figma.notify('✅ No design system issues found!');
    return;
  }

  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  var high = [];
  var medium = [];
  var low = [];

  for (var i = 0; i < findings.length; i++) {
    var finding = findings[i];
    if (finding.severity === 'high') high[high.length] = finding;
    else if (finding.severity === 'medium') medium[medium.length] = finding;
    else if (finding.severity === 'low') low[low.length] = finding;
  }

  var yOffset = 0;
  var spacing = 150;

  for (var i = 0; i < high.length; i++) {
    var finding = high[i];
    var frame = figma.createFrame();
    frame.name = 'HIGH: ' + finding.category;
    frame.x = node.x + node.width + 50;
    frame.y = node.y + yOffset;
    frame.resize(320, 140);
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 0.9, b: 0.9 } }];
    frame.cornerRadius = 8;

    var text = figma.createText();
    text.x = 12;
    text.y = 12;
    text.resize(296, 116);
    var content = 'HIGH: ' + finding.category + '\n\n' + finding.issue.substring(0, 100) + '...\n\n' + finding.reason.substring(0, 120) + '...';
    text.characters = content;
    text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

    frame.appendChild(text);
    yOffset = yOffset + spacing;
  }

  for (var i = 0; i < medium.length; i++) {
    var finding = medium[i];
    var frame = figma.createFrame();
    frame.name = 'MEDIUM: ' + finding.category;
    frame.x = node.x + node.width + 50;
    frame.y = node.y + yOffset;
    frame.resize(320, 140);
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 0.9 } }];
    frame.cornerRadius = 8;

    var text = figma.createText();
    text.x = 12;
    text.y = 12;
    text.resize(296, 116);
    var content = 'MEDIUM: ' + finding.category + '\n\n' + finding.issue.substring(0, 100) + '...\n\n' + finding.reason.substring(0, 120) + '...';
    text.characters = content;
    text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

    frame.appendChild(text);
    yOffset = yOffset + spacing;
  }

  for (var i = 0; i < low.length; i++) {
    var finding = low[i];
    var frame = figma.createFrame();
    frame.name = 'LOW: ' + finding.category;
    frame.x = node.x + node.width + 50;
    frame.y = node.y + yOffset;
    frame.resize(320, 140);
    frame.fills = [{ type: 'SOLID', color: { r: 0.9, g: 1, b: 0.9 } }];
    frame.cornerRadius = 8;

    var text = figma.createText();
    text.x = 12;
    text.y = 12;
    text.resize(296, 116);
    var content = 'LOW: ' + finding.category + '\n\n' + finding.issue.substring(0, 100) + '...\n\n' + finding.reason.substring(0, 120) + '...';
    text.characters = content;
    text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

    frame.appendChild(text);
    yOffset = yOffset + spacing;
  }

  var total = high.length + medium.length + low.length;
  figma.notify('✅ Found ' + total + ' issues: ' + high.length + ' high, ' + medium.length + ' medium, ' + low.length + ' low');
}

// =====================================================
// MODE 2: COMPONENT ANNOTATIONS (IMPROVED - Shows actual insights)
// =====================================================
async function createComponentAnnotations(result, node) {
  var insights = result.insights;
  if (!insights) insights = [];

  if (insights.length === 0) {
    figma.notify('✅ No component issues found!');
    return;
  }

  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  // Group by category
  var categories = {
    ARCHITECTURE: [],
    MAINTENANCE: [],
    GOVERNANCE: [],
    COMPONENTS: [],
    PERFORMANCE: [],
    OTHER: []
  };

  for (var i = 0; i < insights.length; i++) {
    var insight = insights[i];
    var category = insight.category || 'OTHER';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(insight);
  }

  var yOffset = 0;
  var spacing = 20;

  // Define colors for each category
  var categoryColors = {
    ARCHITECTURE: { r: 0.95, g: 0.92, b: 1 },
    MAINTENANCE: { r: 1, g: 0.95, b: 0.9 },
    GOVERNANCE: { r: 0.9, g: 0.95, b: 1 },
    COMPONENTS: { r: 0.95, g: 1, b: 0.95 },
    PERFORMANCE: { r: 1, g: 0.92, b: 0.92 },
    OTHER: { r: 0.96, g: 0.96, b: 0.96 }
  };

  // Create annotations for each category
  var categoryKeys = Object.keys(categories);
  for (var c = 0; c < categoryKeys.length; c++) {
    var categoryKey = categoryKeys[c];
    var categoryInsights = categories[categoryKey];

    if (categoryInsights.length === 0) continue;

    // Create category header
    var headerFrame = figma.createFrame();
    headerFrame.name = categoryKey + ' (' + categoryInsights.length + ')';
    headerFrame.x = node.x + node.width + 50;
    headerFrame.y = node.y + yOffset;
    headerFrame.resize(400, 40);
    headerFrame.fills = [{ type: 'SOLID', color: categoryColors[categoryKey] || categoryColors.OTHER }];
    headerFrame.cornerRadius = 8;

    var headerText = figma.createText();
    headerText.fontName = { family: 'Inter', style: 'Bold' };
    headerText.fontSize = 14;
    headerText.characters = categoryKey + ' (' + categoryInsights.length + ')';
    headerText.x = 12;
    headerText.y = 12;
    headerText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
    headerFrame.appendChild(headerText);

    yOffset = yOffset + 50;

    // Create cards for each insight in this category
    for (var i = 0; i < categoryInsights.length; i++) {
      var insight = categoryInsights[i];
      var frame = figma.createFrame();
      frame.name = categoryKey + ': Issue ' + (i + 1);
      frame.x = node.x + node.width + 50;
      frame.y = node.y + yOffset;
      frame.resize(400, 140);
      frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      frame.cornerRadius = 8;
      frame.strokeWeight = 1;
      frame.strokes = [{ type: 'SOLID', color: categoryColors[categoryKey] || categoryColors.OTHER }];

      var text = figma.createText();
      text.x = 16;
      text.y = 16;
      text.resize(368, 108);

      // Get the actual insight text
      var issueText = insight.issue || insight.message || insight.description || 'Component insight';
      var reasonText = insight.reason || '';

      var content = '📦 ' + issueText.substring(0, 120);
      if (issueText.length > 120) content = content + '...';

      if (reasonText) {
        content = content + '\n\n💡 ' + reasonText.substring(0, 100);
        if (reasonText.length > 100) content = content + '...';
      }

      text.characters = content;
      text.fontSize = 13;
      text.fills = [{ type: 'SOLID', color: { r: 0.15, g: 0.15, b: 0.15 } }];
      text.lineHeight = { value: 150, unit: 'PERCENT' };

      frame.appendChild(text);
      yOffset = yOffset + 140 + spacing;
    }

    yOffset = yOffset + 30;
  }

  figma.notify('✅ Found ' + insights.length + ' component insights across ' + categoryKeys.filter(k => categories[k].length > 0).length + ' categories');
}

// =====================================================
// MODE 3: COLOR ANNOTATIONS (with severity coding)
// =====================================================
async function createColorAnnotations(result, node) {
  var colorFindings = result.colorFindings || result.findings || [];

  if (colorFindings.length === 0) {
    figma.notify('✅ No color issues found!');
    return;
  }

  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  var high = [];
  var medium = [];
  var low = [];

  for (var i = 0; i < colorFindings.length; i++) {
    var finding = colorFindings[i];
    if (finding.severity === 'high') high[high.length] = finding;
    else if (finding.severity === 'medium') medium[medium.length] = finding;
    else if (finding.severity === 'low') low[low.length] = finding;
  }

  var yOffset = 0;
  var spacing = 150;

  for (var i = 0; i < high.length; i++) {
    var finding = high[i];
    var frame = figma.createFrame();
    var title = finding.title || finding.category || finding.type || 'Color Issue';
    frame.name = 'HIGH: ' + title;
    frame.x = node.x + node.width + 50;
    frame.y = node.y + yOffset;
    frame.resize(320, 140);
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 0.9, b: 0.9 } }];
    frame.cornerRadius = 8;

    var text = figma.createText();
    text.x = 12;
    text.y = 12;
    text.resize(296, 116);

    var issue = finding.issue || finding.description || 'Color issue detected';
    var reason = finding.reason || finding.recommendation || finding.fix || '';
    var color = finding.color || '';

    var content = 'HIGH: ' + title;
    if (color) content = content + '\nColor: ' + color;
    content = content + '\n\n' + issue.substring(0, 80) + '...';
    if (reason) content = content + '\n\n' + reason.substring(0, 60) + '...';

    text.characters = content;
    text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

    frame.appendChild(text);
    yOffset = yOffset + spacing;
  }

  for (var i = 0; i < medium.length; i++) {
    var finding = medium[i];
    var frame = figma.createFrame();
    var title = finding.title || finding.category || finding.type || 'Color Issue';
    frame.name = 'MEDIUM: ' + title;
    frame.x = node.x + node.width + 50;
    frame.y = node.y + yOffset;
    frame.resize(320, 140);
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 0.9 } }];
    frame.cornerRadius = 8;

    var text = figma.createText();
    text.x = 12;
    text.y = 12;
    text.resize(296, 116);

    var issue = finding.issue || finding.description || 'Color issue detected';
    var reason = finding.reason || finding.recommendation || finding.fix || '';
    var color = finding.color || '';

    var content = 'MEDIUM: ' + title;
    if (color) content = content + '\nColor: ' + color;
    content = content + '\n\n' + issue.substring(0, 80) + '...';
    if (reason) content = content + '\n\n' + reason.substring(0, 60) + '...';

    text.characters = content;
    text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

    frame.appendChild(text);
    yOffset = yOffset + spacing;
  }

  for (var i = 0; i < low.length; i++) {
    var finding = low[i];
    var frame = figma.createFrame();
    var title = finding.title || finding.category || finding.type || 'Color Issue';
    frame.name = 'LOW: ' + title;
    frame.x = node.x + node.width + 50;
    frame.y = node.y + yOffset;
    frame.resize(320, 140);
    frame.fills = [{ type: 'SOLID', color: { r: 0.9, g: 1, b: 0.9 } }];
    frame.cornerRadius = 8;

    var text = figma.createText();
    text.x = 12;
    text.y = 12;
    text.resize(296, 116);

    var issue = finding.issue || finding.description || 'Color issue detected';
    var reason = finding.reason || finding.recommendation || finding.fix || '';
    var color = finding.color || '';

    var content = 'LOW: ' + title;
    if (color) content = content + '\nColor: ' + color;
    content = content + '\n\n' + issue.substring(0, 80) + '...';
    if (reason) content = content + '\n\n' + reason.substring(0, 60) + '...';

    text.characters = content;
    text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];

    frame.appendChild(text);
    yOffset = yOffset + spacing;
  }

  var total = high.length + medium.length + low.length;
  figma.notify('✅ Found ' + total + ' color issues: ' + high.length + ' high, ' + medium.length + ' medium, ' + low.length + ' low');
}

// =====================================================
// MODE 4: UX REPORT (IMPROVED - Formatted & Readable)
// =====================================================
async function createUXReport(result, node) {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  var findings = result.findings || [];
  var summary = result.summary || { total: 0, high: 0, medium: 0, low: 0 };

  if (findings.length === 0) {
    figma.notify('✅ UX Analysis complete - No issues found!');
    return;
  }

  var frame = figma.createFrame();
  frame.name = 'UX Heuristic Report';
  frame.resize(900, 100);
  frame.x = node.x + node.width + 100;
  frame.y = node.y;
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  frame.layoutMode = 'VERTICAL';
  frame.paddingTop = 40;
  frame.paddingRight = 40;
  frame.paddingBottom = 40;
  frame.paddingLeft = 40;
  frame.itemSpacing = 30;
  frame.counterAxisSizingMode = 'FIXED';
  frame.primaryAxisSizingMode = 'AUTO';

  var title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 28;
  title.characters = 'UX Heuristic Analysis Report';
  title.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  frame.appendChild(title);

  var summaryText = figma.createText();
  summaryText.fontSize = 14;
  summaryText.characters = 'Total Issues: ' + summary.total + ' (' + summary.high + ' high, ' + summary.medium + ' medium, ' + summary.low + ' low)\nBased on Nielsen\'s 10 Usability Heuristics';
  summaryText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
  summaryText.resize(820, summaryText.height);
  frame.appendChild(summaryText);

  var high = [];
  var medium = [];
  var low = [];

  for (var i = 0; i < findings.length; i++) {
    var f = findings[i];
    if (f.severity === 'high') high[high.length] = f;
    else if (f.severity === 'medium') medium[medium.length] = f;
    else if (f.severity === 'low') low[low.length] = f;
  }

  if (high.length > 0) {
    var highHeader = figma.createText();
    highHeader.fontName = { family: 'Inter', style: 'Bold' };
    highHeader.fontSize = 20;
    highHeader.characters = '🔴 High Severity (' + high.length + ')';
    highHeader.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.2, b: 0.2 } }];
    frame.appendChild(highHeader);

    for (var i = 0; i < high.length; i++) {
      var findingCard = createFindingCard(high[i], { r: 1, g: 0.95, b: 0.95 });
      frame.appendChild(findingCard);
    }
  }

  if (medium.length > 0) {
    var medHeader = figma.createText();
    medHeader.fontName = { family: 'Inter', style: 'Bold' };
    medHeader.fontSize = 20;
    medHeader.characters = '🟡 Medium Severity (' + medium.length + ')';
    medHeader.fills = [{ type: 'SOLID', color: { r: 0.8, g: 0.6, b: 0.2 } }];
    frame.appendChild(medHeader);

    for (var j = 0; j < medium.length; j++) {
      var findingCard = createFindingCard(medium[j], { r: 1, g: 0.98, b: 0.9 });
      frame.appendChild(findingCard);
    }
  }

  if (low.length > 0) {
    var lowHeader = figma.createText();
    lowHeader.fontName = { family: 'Inter', style: 'Bold' };
    lowHeader.fontSize = 20;
    lowHeader.characters = '🟢 Low Severity (' + low.length + ')';
    lowHeader.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.6, b: 0.2 } }];
    frame.appendChild(lowHeader);

    for (var k = 0; k < low.length; k++) {
      var findingCard = createFindingCard(low[k], { r: 0.95, g: 1, b: 0.95 });
      frame.appendChild(findingCard);
    }
  }

  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
  figma.notify('✅ UX Report created with ' + summary.total + ' findings!');
}

function createFindingCard(finding, bgColor) {
  var card = figma.createFrame();
  card.resize(820, 100);
  card.fills = [{ type: 'SOLID', color: bgColor }];
  card.cornerRadius = 8;
  card.layoutMode = 'VERTICAL';
  card.paddingTop = 16;
  card.paddingRight = 20;
  card.paddingBottom = 16;
  card.paddingLeft = 20;
  card.itemSpacing = 12;
  card.counterAxisSizingMode = 'FIXED';
  card.primaryAxisSizingMode = 'AUTO';

  var heuristicText = figma.createText();
  heuristicText.fontName = { family: 'Inter', style: 'Bold' };
  heuristicText.fontSize = 16;
  heuristicText.characters = finding.heuristic || 'UX Issue';
  heuristicText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  heuristicText.resize(780, heuristicText.height);
  card.appendChild(heuristicText);

  var issueText = figma.createText();
  issueText.fontSize = 14;
  issueText.characters = '📌 Issue: ' + (finding.issue || 'No description');
  issueText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
  issueText.resize(780, issueText.height);
  card.appendChild(issueText);

  if (finding.reason) {
    var reasonText = figma.createText();
    reasonText.fontSize = 13;
    reasonText.characters = '💡 Why: ' + finding.reason;
    reasonText.fills = [{ type: 'SOLID', color: { r: 0.3, g: 0.3, b: 0.3 } }];
    reasonText.resize(780, reasonText.height);
    card.appendChild(reasonText);
  }

  if (finding.recommendation) {
    var recText = figma.createText();
    recText.fontSize = 13;
    recText.characters = '✅ Fix: ' + finding.recommendation;
    recText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.5, b: 0.2 } }];
    recText.resize(780, recText.height);
    card.appendChild(recText);
  }

  return card;
}

// =====================================================
// MODE 5: MAGIC PATTERNS
// =====================================================
async function createMagicPatternsResult(result, node) {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  var frame = figma.createFrame();
  frame.name = 'Magic Patterns - 4 Alternatives';
  frame.resize(600, 600);
  frame.x = node.x + node.width + 100;
  frame.y = node.y;
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

  var yPos = 40;

  var title = figma.createText();
  title.fontName = { family: 'Inter', style: 'Bold' };
  title.fontSize = 24;
  title.characters = '4 Design Alternatives Generated';
  title.x = 40;
  title.y = yPos;
  title.resize(520, title.height);
  title.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  frame.appendChild(title);
  yPos = yPos + title.height + 30;

  var info = figma.createText();
  info.fontSize = 14;
  info.characters = 'Original: ' + result.frameName + '\nFrom: ' + result.fileName + '\n\nGeneration Mode: Best Quality\nAlternatives: 4 variations';
  info.x = 40;
  info.y = yPos;
  info.resize(520, info.height);
  info.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
  frame.appendChild(info);
  yPos = yPos + info.height + 40;

  if (result.editorUrl) {
    var urlLabel = figma.createText();
    urlLabel.fontName = { family: 'Inter', style: 'Bold' };
    urlLabel.fontSize = 16;
    urlLabel.characters = 'View All 4 Alternatives:';
    urlLabel.x = 40;
    urlLabel.y = yPos;
    urlLabel.resize(520, urlLabel.height);
    urlLabel.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
    frame.appendChild(urlLabel);
    yPos = yPos + urlLabel.height + 15;

    var urlText = figma.createText();
    urlText.fontSize = 13;
    urlText.characters = result.editorUrl;
    urlText.x = 40;
    urlText.y = yPos;
    urlText.resize(520, urlText.height);
    urlText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.9 } }];
    urlText.textDecoration = 'UNDERLINE';
    urlText.hyperlink = { type: 'URL', value: result.editorUrl };
    frame.appendChild(urlText);
  }

  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
}
