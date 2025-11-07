// server.js - Complete Figma MCP Server with Design System Compliance
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3845;
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

// CORS - allow everything
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON with large limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// RAW body logging middleware
app.use((req, res, next) => {
  console.log('\n╔═══════════════════════════════════════════════════════');
  console.log(`🔥 ${new Date().toISOString()}`);
  console.log(`   ${req.method} ${req.path}`);
  console.log('───────────────────────────────────────────────────────');
  console.log('📋 Headers:');
  Object.keys(req.headers).forEach(key => {
    console.log(`   ${key}: ${req.headers[key]}`);
  });
  console.log('───────────────────────────────────────────────────────');
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  console.log('╚═══════════════════════════════════════════════════════\n');
  next();
});

const FIGMA_API = 'https://api.figma.com/v1';

// Figma API helper
async function figmaRequest(endpoint) {
  try {
    console.log(`🔗 Calling Figma API: ${endpoint}`);
    const response = await axios.get(`${FIGMA_API}${endpoint}`, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN },
      timeout: 15000
    });
    console.log(`✅ Figma API success`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Figma API Error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.err || error.response?.data?.message || error.message 
    };
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Figma Custom MCP Server',
    version: '3.0.0',
    hasToken: !!FIGMA_TOKEN,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      tools: '/mcp/tools',
      mcp: '/mcp'
    }
  });
});

// ============================================================================
// MCP TOOLS DISCOVERY
// ============================================================================
app.get('/mcp/tools', (req, res) => {
  console.log('🛠️ Tools list requested');
  const tools = {
    tools: [
      {
        name: 'get_node_details',
        description: 'Fetch detailed properties of a Figma node including dimensions, colors, layout, and children',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key from the URL'
            },
            nodeId: {
              type: 'string',
              description: 'The node ID to fetch'
            }
          },
          required: ['fileKey', 'nodeId']
        }
      },
      {
        name: 'get_design_system',
        description: 'Fetch all color styles, text styles, effect styles, and spacing variables from a design system file',
        inputSchema: {
          type: 'object',
          properties: {
            designSystemFileKey: {
              type: 'string',
              description: 'The Figma file key of the design system library'
            }
          },
          required: ['designSystemFileKey']
        }
      },
      {
        name: 'verify_design_system_compliance',
        description: 'Check if a node and its children are using proper design system tokens (color styles, text styles, effect styles) instead of hard-coded values',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key'
            },
            nodeId: {
              type: 'string',
              description: 'The node ID to check'
            },
            designSystemFileKey: {
              type: 'string',
              description: 'The design system file key to validate against'
            }
          },
          required: ['fileKey', 'nodeId', 'designSystemFileKey']
        }
      },
      {
        name: 'analyze_spacing',
        description: 'Analyze if a node\'s spacing values comply with the 8px grid system',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key'
            },
            nodeId: {
              type: 'string',
              description: 'The node ID to analyze'
            }
          },
          required: ['fileKey', 'nodeId']
        }
      },
      {
        name: 'get_file_styles',
        description: 'Get all color and text styles defined in a Figma file',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key'
            }
          },
          required: ['fileKey']
        }
      },
      {
        name: 'get_typography',
        description: 'Get all text nodes with font properties, sizes, and line heights',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key'
            },
            nodeId: {
              type: 'string',
              description: 'The node ID'
            }
          },
          required: ['fileKey', 'nodeId']
        }
      },
      {
        name: 'get_color_analysis',
        description: 'Get all colors used in fills and strokes',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key'
            },
            nodeId: {
              type: 'string',
              description: 'The node ID'
            }
          },
          required: ['fileKey', 'nodeId']
        }
      },
      {
        name: 'check_wcag_contrast',
        description: 'Check WCAG 2.1 contrast ratios for all text elements',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key'
            },
            nodeId: {
              type: 'string',
              description: 'The node ID'
            }
          },
          required: ['fileKey', 'nodeId']
        }
      },
      {
        name: 'get_components',
        description: 'Find all component instances and master components',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key'
            },
            nodeId: {
              type: 'string',
              description: 'The node ID'
            }
          },
          required: ['fileKey', 'nodeId']
        }
      },
      {
        name: 'analyze_hierarchy',
        description: 'Analyze nesting depth and visual hierarchy',
        inputSchema: {
          type: 'object',
          properties: {
            fileKey: {
              type: 'string',
              description: 'The Figma file key'
            },
            nodeId: {
              type: 'string',
              description: 'The node ID'
            }
          },
          required: ['fileKey', 'nodeId']
        }
      }
    ]
  };
  
  console.log('📤 Sending tools list:', tools.tools.length, 'tools');
  res.json(tools);
});

// ============================================================================
// MCP MAIN ENDPOINT - Handle ALL possible formats
// ============================================================================
app.post('/mcp', async (req, res) => {
  console.log('🎯 MCP endpoint called');
  
  if (!FIGMA_TOKEN) {
    console.error('❌ No FIGMA_TOKEN configured!');
    return res.status(500).json({
      error: {
        code: 'NO_TOKEN',
        message: 'FIGMA_TOKEN environment variable not set'
      }
    });
  }
  
  // Extract tool name and arguments from various possible formats
  let toolName, toolArgs;
  
  // Check if this is a notification (no id, no response expected)
  const isNotification = req.body.jsonrpc === '2.0' && req.body.id === undefined;
  
  if (isNotification) {
    console.log(`📢 Notification received: ${req.body.method}`);
    return res.status(204).send();
  }
  
  // Format 1: MCP standard {name, arguments}
  if (req.body.name && req.body.arguments) {
    toolName = req.body.name;
    toolArgs = req.body.arguments;
    console.log('🔌 Format detected: MCP standard {name, arguments}');
  }
  // Format 2: JSON-RPC {method, params}
  else if (req.body.method && req.body.params !== undefined) {
    if (req.body.method === 'tools/call' && req.body.params.name) {
      toolName = req.body.params.name;
      toolArgs = req.body.params.arguments || {};
      console.log('🔌 Format detected: JSON-RPC tools/call wrapper');
    } else {
      toolName = req.body.method;
      toolArgs = req.body.params;
      console.log('🔌 Format detected: JSON-RPC');
    }
  }
  // Format 3: {tool, parameters}
  else if (req.body.tool && req.body.parameters) {
    toolName = req.body.tool;
    toolArgs = req.body.parameters;
    console.log('🔌 Format detected: {tool, parameters}');
  }
  // Format 4: Direct {fileKey, nodeId} (fallback)
  else if (req.body.fileKey && req.body.nodeId) {
    toolName = 'get_node_details';
    toolArgs = req.body;
    console.log('🔌 Format detected: Direct parameters');
  }
  else {
    console.error('❌ Unknown request format!');
    console.error('Received body:', JSON.stringify(req.body, null, 2));
    return res.status(400).json({
      error: {
        code: 'INVALID_FORMAT',
        message: 'Unknown request format',
        receivedBody: req.body
      }
    });
  }
  
  console.log(`✅ Tool: "${toolName}"`);
  console.log(`✅ Args:`, JSON.stringify(toolArgs, null, 2));
  
  try {
    let result;
    
    // ========================================================================
    // TOOL: get_node_details
    // ========================================================================
    if (toolName === 'get_node_details') {
      const { fileKey, nodeId } = toolArgs;
      
      if (!fileKey || !nodeId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameters: fileKey and nodeId'
          }
        });
      }
      
      console.log(`🔍 Fetching node details: ${fileKey} / ${nodeId}`);
      
      const response = await figmaRequest(`/files/${fileKey}/nodes?ids=${nodeId}`);
      
      if (!response.success) {
        return res.status(500).json({
          error: {
            code: 'FIGMA_API_ERROR',
            message: response.error
          }
        });
      }
      
      const nodeData = response.data.nodes[nodeId];
      if (!nodeData) {
        return res.status(404).json({
          error: {
            code: 'NODE_NOT_FOUND',
            message: `Node ${nodeId} not found in file ${fileKey}`
          }
        });
      }
      
      const node = nodeData.document;
      
      result = {
        id: node.id,
        name: node.name,
        type: node.type,
        visible: node.visible,
        dimensions: {
          width: node.absoluteBoundingBox?.width,
          height: node.absoluteBoundingBox?.height,
          x: node.absoluteBoundingBox?.x,
          y: node.absoluteBoundingBox?.y
        },
        backgroundColor: node.backgroundColor,
        fills: node.fills?.slice(0, 5) || [],
        strokes: node.strokes?.slice(0, 3) || [],
        strokeWeight: node.strokeWeight,
        cornerRadius: node.cornerRadius,
        effects: node.effects?.slice(0, 3) || [],
        children: node.children?.slice(0, 20).map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          dimensions: c.absoluteBoundingBox
        })) || []
      };
      
      if (node.layoutMode && node.layoutMode !== 'NONE') {
        result.layout = {
          mode: node.layoutMode,
          padding: {
            top: node.paddingTop || 0,
            right: node.paddingRight || 0,
            bottom: node.paddingBottom || 0,
            left: node.paddingLeft || 0
          },
          itemSpacing: node.itemSpacing || 0,
          counterAxisSpacing: node.counterAxisSpacing || 0,
          primaryAxisAlignItems: node.primaryAxisAlignItems,
          counterAxisAlignItems: node.counterAxisAlignItems
        };
      }
      
      console.log('✅ Node details fetched successfully');
    }
    
    // ========================================================================
    // TOOL: get_design_system
    // ========================================================================
    else if (toolName === 'get_design_system') {
      const { designSystemFileKey } = toolArgs;
      
      if (!designSystemFileKey) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameter: designSystemFileKey'
          }
        });
      }
      
      console.log(`🎨 Fetching design system: ${designSystemFileKey}`);
      
      const stylesResponse = await figmaRequest(`/files/${designSystemFileKey}/styles`);
      
      if (!stylesResponse.success) {
        return res.status(500).json({
          error: {
            code: 'FIGMA_API_ERROR',
            message: stylesResponse.error
          }
        });
      }
      
      const variablesResponse = await figmaRequest(`/files/${designSystemFileKey}/variables/local`);
      const hasVariables = variablesResponse.success;
      
      const colorStyles = [];
      const textStyles = [];
      const effectStyles = [];
      
      if (stylesResponse.data.meta && stylesResponse.data.meta.styles) {
        stylesResponse.data.meta.styles.forEach(style => {
          if (style.style_type === 'FILL') {
            colorStyles.push({
              key: style.key,
              name: style.name,
              description: style.description || ''
            });
          } else if (style.style_type === 'TEXT') {
            textStyles.push({
              key: style.key,
              name: style.name,
              description: style.description || ''
            });
          } else if (style.style_type === 'EFFECT') {
            effectStyles.push({
              key: style.key,
              name: style.name,
              description: style.description || ''
            });
          }
        });
      }
      
      let spacingVariables = [];
      let colorVariables = [];
      
      if (hasVariables && variablesResponse.data.meta && variablesResponse.data.meta.variables) {
        Object.values(variablesResponse.data.meta.variables).forEach(variable => {
          if (variable.resolvedType === 'FLOAT' && variable.name.toLowerCase().includes('spacing')) {
            spacingVariables.push({
              id: variable.id,
              name: variable.name,
              value: variable.valuesByMode ? Object.values(variable.valuesByMode)[0] : null
            });
          } else if (variable.resolvedType === 'COLOR') {
            colorVariables.push({
              id: variable.id,
              name: variable.name
            });
          }
        });
      }
      
      result = {
        designSystemFileKey: designSystemFileKey,
        lastFetched: new Date().toISOString(),
        colors: {
          stylesCount: colorStyles.length,
          variablesCount: colorVariables.length,
          styles: colorStyles,
          variables: colorVariables
        },
        typography: {
          stylesCount: textStyles.length,
          styles: textStyles
        },
        effects: {
          stylesCount: effectStyles.length,
          styles: effectStyles
        },
        spacing: {
          variablesCount: spacingVariables.length,
          variables: spacingVariables
        },
        summary: {
          totalColorStyles: colorStyles.length,
          totalTextStyles: textStyles.length,
          totalEffectStyles: effectStyles.length,
          totalSpacingVariables: spacingVariables.length,
          hasVariables: hasVariables
        }
      };
      
      console.log(`✅ Design system fetched: ${colorStyles.length} colors, ${textStyles.length} text styles`);
    }
    
    // ========================================================================
    // TOOL: verify_design_system_compliance
    // ========================================================================
    else if (toolName === 'verify_design_system_compliance') {
      const { fileKey, nodeId, designSystemFileKey } = toolArgs;
      
      if (!fileKey || !nodeId || !designSystemFileKey) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameters: fileKey, nodeId, designSystemFileKey'
          }
        });
      }
      
      console.log(`🔍 Verifying compliance: ${fileKey}/${nodeId} against DS ${designSystemFileKey}`);
      
      const nodeResponse = await figmaRequest(`/files/${fileKey}/nodes?ids=${nodeId}`);
      
      if (!nodeResponse.success) {
        return res.status(500).json({
          error: {
            code: 'FIGMA_API_ERROR',
            message: nodeResponse.error
          }
        });
      }
      
      const nodeData = nodeResponse.data.nodes[nodeId];
      if (!nodeData) {
        return res.status(404).json({
          error: {
            code: 'NODE_NOT_FOUND',
            message: `Node ${nodeId} not found`
          }
        });
      }
      
      const dsStylesResponse = await figmaRequest(`/files/${designSystemFileKey}/styles`);
      
      if (!dsStylesResponse.success) {
        return res.status(500).json({
          error: {
            code: 'DESIGN_SYSTEM_ERROR',
            message: 'Failed to fetch design system'
          }
        });
      }
      
      const dsColorStyleKeys = new Set();
      const dsTextStyleKeys = new Set();
      const dsEffectStyleKeys = new Set();
      
      if (dsStylesResponse.data.meta && dsStylesResponse.data.meta.styles) {
        dsStylesResponse.data.meta.styles.forEach(style => {
          if (style.style_type === 'FILL') dsColorStyleKeys.add(style.key);
          if (style.style_type === 'TEXT') dsTextStyleKeys.add(style.key);
          if (style.style_type === 'EFFECT') dsEffectStyleKeys.add(style.key);
        });
      }
      
      const violations = [];
      
      function checkNode(node, path = '') {
        const nodePath = path ? `${path} > ${node.name}` : node.name;
        
        // Check color fills
        if (node.fills && Array.isArray(node.fills)) {
          node.fills.forEach((fill, index) => {
            if (fill.type === 'SOLID') {
              if (!node.fillStyleId || node.fillStyleId === '') {
                violations.push({
                  nodeId: node.id,
                  nodeName: node.name,
                  nodePath: nodePath,
                  property: 'fill',
                  issue: 'Using hard-coded color instead of color style',
                  currentValue: fill.color ? 
                    `RGB(${Math.round(fill.color.r * 255)}, ${Math.round(fill.color.g * 255)}, ${Math.round(fill.color.b * 255)})` 
                    : 'unknown',
                  recommendation: 'Apply a color style from design system',
                  severity: 'medium'
                });
              } else if (!dsColorStyleKeys.has(node.fillStyleId)) {
                violations.push({
                  nodeId: node.id,
                  nodeName: node.name,
                  nodePath: nodePath,
                  property: 'fill',
                  issue: 'Using color style from outside design system',
                  currentValue: `Style ID: ${node.fillStyleId}`,
                  recommendation: 'Use color style from design system library',
                  severity: 'high'
                });
              }
            }
          });
        }
        
        // Check text styles
        if (node.type === 'TEXT') {
          if (!node.textStyleId || node.textStyleId === '') {
            violations.push({
              nodeId: node.id,
              nodeName: node.name,
              nodePath: nodePath,
              property: 'typography',
              issue: 'Text not using text style',
              currentValue: `${node.fontSize}px ${node.fontName?.family || 'unknown'}`,
              recommendation: 'Apply text style from design system',
              severity: 'medium'
            });
          } else if (!dsTextStyleKeys.has(node.textStyleId)) {
            violations.push({
              nodeId: node.id,
              nodeName: node.name,
              nodePath: nodePath,
              property: 'typography',
              issue: 'Using text style from outside design system',
              currentValue: `Style ID: ${node.textStyleId}`,
              recommendation: 'Use text style from design system library',
              severity: 'high'
            });
          }
        }
        
        // Check effects
        if (node.effects && Array.isArray(node.effects) && node.effects.length > 0) {
          if (!node.effectStyleId || node.effectStyleId === '') {
            violations.push({
              nodeId: node.id,
              nodeName: node.name,
              nodePath: nodePath,
              property: 'effects',
              issue: 'Using custom effects instead of effect style',
              currentValue: node.effects.map(e => e.type).join(', '),
              recommendation: 'Apply effect style from design system',
              severity: 'low'
            });
          } else if (!dsEffectStyleKeys.has(node.effectStyleId)) {
            violations.push({
              nodeId: node.id,
              nodeName: node.name,
              nodePath: nodePath,
              property: 'effects',
              issue: 'Using effect style from outside design system',
              currentValue: `Style ID: ${node.effectStyleId}`,
              recommendation: 'Use effect style from design system library',
              severity: 'medium'
            });
          }
        }
        
        // Check spacing (8px grid)
        if (node.layoutMode && node.layoutMode !== 'NONE') {
          const spacingValues = [
            node.paddingTop,
            node.paddingRight,
            node.paddingBottom,
            node.paddingLeft,
            node.itemSpacing
          ].filter(v => v !== undefined && v !== 0);
          
          spacingValues.forEach(value => {
            if (value % 8 !== 0) {
              violations.push({
                nodeId: node.id,
                nodeName: node.name,
                nodePath: nodePath,
                property: 'spacing',
                issue: 'Spacing not following 8px grid',
                currentValue: `${value}px`,
                recommendation: `Change to nearest 8px multiple: ${Math.round(value / 8) * 8}px`,
                severity: 'medium'
              });
            }
          });
        }
        
        if (node.children) {
          node.children.forEach(child => checkNode(child, nodePath));
        }
      }
      
      checkNode(nodeData.document);
      
      const totalChecks = violations.length + 100;
      const complianceScore = Math.round((1 - violations.length / totalChecks) * 100);
      
      result = {
        nodeId: nodeId,
        nodeName: nodeData.document.name,
        designSystemFileKey: designSystemFileKey,
        compliant: violations.length === 0,
        complianceScore: complianceScore,
        violationCount: violations.length,
        violations: violations,
        summary: {
          high: violations.filter(v => v.severity === 'high').length,
          medium: violations.filter(v => v.severity === 'medium').length,
          low: violations.filter(v => v.severity === 'low').length
        },
        checkedAt: new Date().toISOString()
      };
      
      console.log(`✅ Compliance check complete: ${violations.length} violations (${complianceScore}% compliant)`);
    }
    
    // ========================================================================
    // TOOL: analyze_spacing
    // ========================================================================
    else if (toolName === 'analyze_spacing') {
      const { fileKey, nodeId } = toolArgs;
      
      if (!fileKey || !nodeId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameters: fileKey and nodeId'
          }
        });
      }
      
      console.log(`🔍 Analyzing spacing: ${fileKey} / ${nodeId}`);
      
      const response = await figmaRequest(`/files/${fileKey}/nodes?ids=${nodeId}`);
      
      if (!response.success) {
        return res.status(500).json({
          error: {
            code: 'FIGMA_API_ERROR',
            message: response.error
          }
        });
      }
      
      const nodeData = response.data.nodes[nodeId];
      if (!nodeData) {
        return res.status(404).json({
          error: {
            code: 'NODE_NOT_FOUND',
            message: `Node ${nodeId} not found`
          }
        });
      }
      
      const node = nodeData.document;
      const issues = [];
      
      if (node.paddingTop !== undefined) {
        ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].forEach(prop => {
          const value = node[prop];
          if (value % 8 !== 0) {
            const expected = Math.round(value / 8) * 8;
            issues.push({
              property: prop,
              currentValue: value,
              expectedValue: expected,
              difference: Math.abs(value - expected),
              message: `${prop} is ${value}px but should be ${expected}px (8px grid)`
            });
          }
        });
      }
      
      if (node.itemSpacing !== undefined && node.itemSpacing % 8 !== 0) {
        const expected = Math.round(node.itemSpacing / 8) * 8;
        issues.push({
          property: 'itemSpacing',
          currentValue: node.itemSpacing,
          expectedValue: expected,
          difference: Math.abs(node.itemSpacing - expected),
          message: `itemSpacing is ${node.itemSpacing}px but should be ${expected}px`
        });
      }
      
      result = {
        nodeName: node.name,
        nodeId: node.id,
        compliant: issues.length === 0,
        issueCount: issues.length,
        issues: issues,
        currentSpacing: {
          paddingTop: node.paddingTop,
          paddingRight: node.paddingRight,
          paddingBottom: node.paddingBottom,
          paddingLeft: node.paddingLeft,
          itemSpacing: node.itemSpacing
        }
      };
      
      console.log(`✅ Spacing analysis complete: ${issues.length} issues found`);
    }
    
    // ========================================================================
    // TOOL: get_file_styles
    // ========================================================================
    else if (toolName === 'get_file_styles') {
      const { fileKey } = toolArgs;
      
      if (!fileKey) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameter: fileKey'
          }
        });
      }
      
      console.log(`🎨 Fetching file styles: ${fileKey}`);
      
      const response = await figmaRequest(`/files/${fileKey}/styles`);
      
      if (!response.success) {
        return res.status(500).json({
          error: {
            code: 'FIGMA_API_ERROR',
            message: response.error
          }
        });
      }
      
      result = response.data;
      console.log('✅ File styles fetched successfully');
    }
    
    // ========================================================================
    // TOOL: get_typography
    // ========================================================================
    else if (toolName === 'get_typography') {
      const { fileKey, nodeId } = toolArgs;
      
      if (!fileKey || !nodeId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameters: fileKey and nodeId'
          }
        });
      }
      
      console.log(`🔤 Analyzing typography: ${fileKey} / ${nodeId}`);
      
      const response = await figmaRequest(`/files/${fileKey}/nodes?ids=${nodeId}`);
      
      if (!response.success) {
        return res.status(500).json({
          error: {
            code: 'FIGMA_API_ERROR',
            message: response.error
          }
        });
      }
      
      const nodeData = response.data.nodes[nodeId];
      if (!nodeData) {
        return res.status(404).json({
          error: {
            code: 'NODE_NOT_FOUND',
            message: `Node ${nodeId} not found`
          }
        });
      }
      
      const textNodes = [];
      function findTextNodes(node) {
        if (node.type === 'TEXT') {
          textNodes.push({
            id: node.id,
            name: node.name,
            characters: node.characters,
            fontSize: node.fontSize,
            fontName: node.fontName,
            fontWeight: node.fontWeight,
            lineHeight: node.lineHeight,
            letterSpacing: node.letterSpacing,
            textAlignHorizontal: node.textAlignHorizontal,
            textAlignVertical: node.textAlignVertical,
            textCase: node.textCase,
            textDecoration: node.textDecoration,
            fills: node.fills
          });
        }
        if (node.children) {
          node.children.forEach(findTextNodes);
        }
      }
      
      findTextNodes(nodeData.document);
      
      result = {
        nodeId: nodeId,
        nodeName: nodeData.document.name,
        textNodesFound: textNodes.length,
        typography: textNodes
      };
      
      console.log(`✅ Found ${textNodes.length} text nodes`);
    }
    
    // ========================================================================
    // TOOL: get_color_analysis
    // ========================================================================
    else if (toolName === 'get_color_analysis') {
      const { fileKey, nodeId } = toolArgs;
      
      if (!fileKey || !nodeId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameters: fileKey and nodeId'
          }
        });
      }
      
      console.log(`🎨 Analyzing colors: ${fileKey} / ${nodeId}`);
      
      const response = await figmaRequest(`/files/${fileKey}/nodes?ids=${nodeId}`);
      
      if (!response.success) {
        return res.status(500).json({
          error: {
            code: 'FIGMA_API_ERROR',
            message: response.error
          }
        });
      }
      
      const nodeData = response.data.nodes[nodeId];
      if (!nodeData) {
        return res.status(404).json({
          error: {
            code: 'NODE_NOT_FOUND',
            message: `Node ${nodeId} not found`
          }
        });
      }
      
      const colors = [];
      function collectColors(node) {
        if (node.fills && Array.isArray(node.fills)) {
          node.fills.forEach(fill => {
            if (fill.type === 'SOLID' && fill.color) {
              colors.push({
                nodeId: node.id,
                nodeName: node.name,
                type: 'fill',
                color: {
                  r: Math.round(fill.color.r * 255),
                  g: Math.round(fill.color.g * 255),
                  b: Math.round(fill.color.b * 255),
                  a: fill.opacity !== undefined ? fill.opacity : 1
                }
              });
            }
          });
        }
        if (node.strokes && Array.isArray(node.strokes)) {
          node.strokes.forEach(stroke => {
            if (stroke.type === 'SOLID' && stroke.color) {
              colors.push({
                nodeId: node.id,
                nodeName: node.name,
                type: 'stroke',
                color: {
                  r: Math.round(stroke.color.r * 255),
                  g: Math.round(stroke.color.g * 255),
                  b: Math.round(stroke.color.b * 255),
                  a: stroke.opacity !== undefined ? stroke.opacity : 1
                }
              });
            }
          });
        }
        if (node.children) {
          node.children.forEach(collectColors);
        }
      }
      
      collectColors(nodeData.document);
      
      result = {
        nodeId: nodeId,
        nodeName: nodeData.document.name,
        colorsFound: colors.length,
        colors: colors,
        backgroundColor: nodeData.document.backgroundColor
      };
      
      console.log(`✅ Found ${colors.length} color usages`);
    }
    
    // ========================================================================
    // TOOL: check_wcag_contrast
    // ========================================================================
    else if (toolName === 'check_wcag_contrast') {
      const { fileKey, nodeId } = toolArgs;
      
      if (!fileKey || !nodeId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameters: fileKey and nodeId'
          }
        });
      }
      
      console.log(`♿ Checking WCAG contrast: ${fileKey} / ${nodeId}`);
      
      const response = await figmaRequest(`/files/${fileKey}/nodes?ids=${nodeId}`);
      
      if (!response.success) {
        return res.status(500).json({
          error: {
            code: 'FIGMA_API_ERROR',
            message: response.error
          }
        });
      }
      
      const nodeData = response.data.nodes[nodeId];
      if (!nodeData) {
        return res.status(404).json({
          error: {
            code: 'NODE_NOT_FOUND',
            message: `Node ${nodeId} not found`
          }
        });
      }
      
      function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      
      function getContrastRatio(rgb1, rgb2) {
        const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
        const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
      }
      
      const contrastChecks = [];
      function checkTextContrast(node, parentBackground) {
        if (node.type === 'TEXT' && node.fills && node.fills.length > 0) {
          const textFill = node.fills.find(f => f.type === 'SOLID');
          if (textFill && textFill.color) {
            const textColor = {
              r: Math.round(textFill.color.r * 255),
              g: Math.round(textFill.color.g * 255),
              b: Math.round(textFill.color.b * 255)
            };
            
            const bgColor = parentBackground || { r: 255, g: 255, b: 255 };
            const ratio = getContrastRatio(textColor, bgColor);
            const fontSize = node.fontSize || 14;
            const isLargeText = fontSize >= 18 || (fontSize >= 14 && node.fontWeight >= 700);
            const requiredRatio = isLargeText ? 3 : 4.5;
            const passes = ratio >= requiredRatio;
            
            contrastChecks.push({
              nodeId: node.id,
              nodeName: node.name,
              textColor: textColor,
              backgroundColor: bgColor,
              contrastRatio: Math.round(ratio * 100) / 100,
              requiredRatio: requiredRatio,
              passes: passes,
              level: passes ? (ratio >= 7 ? 'AAA' : 'AA') : 'FAIL',
              fontSize: fontSize,
              isLargeText: isLargeText
            });
          }
        }
        
        let newBg = parentBackground;
        if (node.fills && node.fills.length > 0) {
          const solidFill = node.fills.find(f => f.type === 'SOLID');
          if (solidFill && solidFill.color) {
            newBg = {
              r: Math.round(solidFill.color.r * 255),
              g: Math.round(solidFill.color.g * 255),
              b: Math.round(solidFill.color.b * 255)
            };
          }
        }
        
        if (node.children) {
          node.children.forEach(child => checkTextContrast(child, newBg));
        }
      }
      
      const rootBg = nodeData.document.backgroundColor ? {
        r: Math.round(nodeData.document.backgroundColor.r * 255),
        g: Math.round(nodeData.document.backgroundColor.g * 255),
        b: Math.round(nodeData.document.backgroundColor.b * 255)
      } : { r: 255, g: 255, b: 255 };
      
      checkTextContrast(nodeData.document, rootBg);
      
      result = {
        nodeId: nodeId,
        nodeName: nodeData.document.name,
        checksPerformed: contrastChecks.length,
        allPass: contrastChecks.every(c => c.passes),
        failCount: contrastChecks.filter(c => !c.passes).length,
        checks: contrastChecks
      };
      
      console.log(`✅ Checked ${contrastChecks.length} text elements, ${result.failCount} failures`);
    }
    
    // ========================================================================
    // TOOL: get_components
    // ========================================================================
    else if (toolName === 'get_components') {
      const { fileKey, nodeId } = toolArgs;
      
      if (!fileKey || !nodeId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameters: fileKey and nodeId'
          }
        });
      }
      
      console.log(`🧩 Finding components: ${fileKey} / ${nodeId}`);
      
      const response = await figmaRequest(`/files/${fileKey}/nodes?ids=${nodeId}`);
      
      if (!response.success) {
        return res.status(500).json({
          error: {
            code: 'FIGMA_API_ERROR',
            message: response.error
          }
        });
      }
      
      const nodeData = response.data.nodes[nodeId];
      if (!nodeData) {
        return res.status(404).json({
          error: {
            code: 'NODE_NOT_FOUND',
            message: `Node ${nodeId} not found`
          }
        });
      }
      
      const components = [];
      function findComponents(node) {
        if (node.type === 'INSTANCE') {
          components.push({
            id: node.id,
            name: node.name,
            componentId: node.componentId,
            componentProperties: node.componentProperties,
            overrides: node.overrides
          });
        }
        if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
          components.push({
            id: node.id,
            name: node.name,
            type: node.type,
            description: node.description
          });
        }
        if (node.children) {
          node.children.forEach(findComponents);
        }
      }
      
      findComponents(nodeData.document);
      
      result = {
        nodeId: nodeId,
        nodeName: nodeData.document.name,
        componentsFound: components.length,
        components: components
      };
      
      console.log(`✅ Found ${components.length} components/instances`);
    }
    
    // ========================================================================
    // TOOL: analyze_hierarchy
    // ========================================================================
    else if (toolName === 'analyze_hierarchy') {
      const { fileKey, nodeId } = toolArgs;
      
      if (!fileKey || !nodeId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameters: fileKey and nodeId'
          }
        });
      }
      
      console.log(`📊 Analyzing hierarchy: ${fileKey} / ${nodeId}`);
      
      const response = await figmaRequest(`/files/${fileKey}/nodes?ids=${nodeId}`);
      
      if (!response.success) {
        return res.status(500).json({
          error: {
            code: 'FIGMA_API_ERROR',
            message: response.error
          }
        });
      }
      
      const nodeData = response.data.nodes[nodeId];
      if (!nodeData) {
        return res.status(404).json({
          error: {
            code: 'NODE_NOT_FOUND',
            message: `Node ${nodeId} not found`
          }
        });
      }
      
      let maxDepth = 0;
      const depthCounts = {};
      const sizesAtDepth = {};
      
      function analyzeNode(node, depth = 0) {
        maxDepth = Math.max(maxDepth, depth);
        depthCounts[depth] = (depthCounts[depth] || 0) + 1;
        
        if (node.absoluteBoundingBox) {
          if (!sizesAtDepth[depth]) sizesAtDepth[depth] = [];
          sizesAtDepth[depth].push({
            width: node.absoluteBoundingBox.width,
            height: node.absoluteBoundingBox.height,
            area: node.absoluteBoundingBox.width * node.absoluteBoundingBox.height
          });
        }
        
        if (node.children) {
          node.children.forEach(child => analyzeNode(child, depth + 1));
        }
      }
      
      analyzeNode(nodeData.document);
      
      result = {
        nodeId: nodeId,
        nodeName: nodeData.document.name,
        maxNestingDepth: maxDepth,
        nodesAtEachDepth: depthCounts,
        hierarchyComplexity: maxDepth > 4 ? 'high' : maxDepth > 2 ? 'medium' : 'low',
        sizesAtDepth: sizesAtDepth
      };
      
      console.log(`✅ Hierarchy analysis complete: max depth ${maxDepth}`);
    }
    
    // ========================================================================
    // MCP PROTOCOL: initialize
    // ========================================================================
    else if (toolName === 'initialize') {
      console.log('🤝 MCP Protocol: Initialize handshake');
      
      result = {
        protocolVersion: '2025-03-26',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'Figma Custom MCP Server',
          version: '3.0.0'
        }
      };
      
      console.log('✅ Initialize handshake complete');
    }
    
    // ========================================================================
    // MCP PROTOCOL: tools/list
    // ========================================================================
    else if (toolName === 'tools/list') {
      console.log('📋 MCP Protocol: List tools');
      
      result = {
        tools: [
          {
            name: 'get_node_details',
            description: 'Get detailed properties including dimensions, layout, colors, effects, and all children',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: { type: 'string', description: 'Figma file key' },
                nodeId: { type: 'string', description: 'Node ID' }
              },
              required: ['fileKey', 'nodeId']
            }
          },
          {
            name: 'get_design_system',
            description: 'Fetch all styles and variables from design system file',
            inputSchema: {
              type: 'object',
              properties: {
                designSystemFileKey: { type: 'string', description: 'Design system file key' }
              },
              required: ['designSystemFileKey']
            }
          },
          {
            name: 'verify_design_system_compliance',
            description: 'Check if node uses proper design system tokens',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: { type: 'string', description: 'Figma file key' },
                nodeId: { type: 'string', description: 'Node ID' },
                designSystemFileKey: { type: 'string', description: 'Design system file key' }
              },
              required: ['fileKey', 'nodeId', 'designSystemFileKey']
            }
          },
          {
            name: 'analyze_spacing',
            description: 'Check 8px grid compliance for padding and spacing',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: { type: 'string', description: 'Figma file key' },
                nodeId: { type: 'string', description: 'Node ID' }
              },
              required: ['fileKey', 'nodeId']
            }
          },
          {
            name: 'get_file_styles',
            description: 'Get all color and text styles from the file',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: { type: 'string', description: 'Figma file key' }
              },
              required: ['fileKey']
            }
          },
          {
            name: 'get_typography',
            description: 'Get all text nodes with font properties',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: { type: 'string', description: 'Figma file key' },
                nodeId: { type: 'string', description: 'Node ID' }
              },
              required: ['fileKey', 'nodeId']
            }
          },
          {
            name: 'get_color_analysis',
            description: 'Get all colors used in fills and strokes',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: { type: 'string', description: 'Figma file key' },
                nodeId: { type: 'string', description: 'Node ID' }
              },
              required: ['fileKey', 'nodeId']
            }
          },
          {
            name: 'check_wcag_contrast',
            description: 'Check WCAG 2.1 contrast ratios for all text',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: { type: 'string', description: 'Figma file key' },
                nodeId: { type: 'string', description: 'Node ID' }
              },
              required: ['fileKey', 'nodeId']
            }
          },
          {
            name: 'get_components',
            description: 'Find all component instances',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: { type: 'string', description: 'Figma file key' },
                nodeId: { type: 'string', description: 'Node ID' }
              },
              required: ['fileKey', 'nodeId']
            }
          },
          {
            name: 'analyze_hierarchy',
            description: 'Analyze nesting depth',
            inputSchema: {
              type: 'object',
              properties: {
                fileKey: { type: 'string', description: 'Figma file key' },
                nodeId: { type: 'string', description: 'Node ID' }
              },
              required: ['fileKey', 'nodeId']
            }
          }
        ]
      };
      
      console.log('✅ Tools list sent: 10 tools');
    }
    
    // ========================================================================
    // UNKNOWN TOOL
    // ========================================================================
    else {
      console.error(`❌ Unknown tool: ${toolName}`);
      return res.status(400).json({
        error: {
          code: 'UNKNOWN_TOOL',
          message: `Tool "${toolName}" not found`,
          availableTools: [
            'get_node_details', 
            'get_design_system',
            'verify_design_system_compliance',
            'analyze_spacing', 
            'get_file_styles',
            'get_typography',
            'get_color_analysis',
            'check_wcag_contrast',
            'get_components',
            'analyze_hierarchy'
          ]
        }
      });
    }
    
    // ========================================================================
    // SEND RESPONSE
    // ========================================================================
    
    console.log('📤 Sending successful response');
    console.log('   Result preview:', JSON.stringify(result).substring(0, 200) + '...');
    
    const isJsonRpc = req.body.jsonrpc === '2.0' && req.body.id !== undefined;
    
    if (isJsonRpc) {
      const response = {
        jsonrpc: '2.0',
        id: req.body.id,
        result: result
      };
      console.log('📡 Using JSON-RPC response format');
      return res.json(response);
    } else {
      const response = {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
      console.log('📡 Using standard MCP response format');
      return res.json(response);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

// OPTIONS handler for CORS preflight
app.options('*', cors());

// 404 handler
app.use((req, res) => {
  console.log(`❓ 404: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: {
      health: 'GET /health',
      tools: 'GET /mcp/tools',
      mcp: 'POST /mcp'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message
    }
  });
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║         🚀  FIGMA CUSTOM MCP SERVER v3.0  🚀                  ║');
  console.log('║                                                               ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║  📡 Port:        ${PORT.toString().padEnd(45)}║`);
  console.log(`║  🔑 Token:       ${(FIGMA_TOKEN ? '✅ Configured' : '❌ Missing').padEnd(45)}║`);
  console.log(`║  🌍 Environment: ${(process.env.NODE_ENV || 'production').padEnd(45)}║`);
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║  🛠️ Available Tools: 10                                        ║');
  console.log('║     • get_node_details                                        ║');
  console.log('║     • get_design_system (NEW)                                 ║');
  console.log('║     • verify_design_system_compliance (NEW)                   ║');
  console.log('║     • analyze_spacing                                         ║');
  console.log('║     • check_wcag_contrast                                     ║');
  console.log('║     • get_typography                                          ║');
  console.log('║     • get_color_analysis                                      ║');
  console.log('║     • get_components                                          ║');
  console.log('║     • analyze_hierarchy                                       ║');
  console.log('║     • get_file_styles                                         ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║  📍 Endpoints:                                                ║');
  console.log(`║     Health:  http://localhost:${PORT}/health${' '.repeat(25)}║`);
  console.log(`║     Tools:   http://localhost:${PORT}/mcp/tools${' '.repeat(22)}║`);
  console.log(`║     MCP:     http://localhost:${PORT}/mcp${' '.repeat(28)}║`);
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║  🔍 Debug Mode: ENABLED                                       ║');
  console.log('║     All requests will be logged in detail                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  if (!FIGMA_TOKEN) {
    console.log('⚠️  WARNING: FIGMA_TOKEN environment variable not set!');
    console.log('   Server will not be able to access Figma API');
    console.log('   Set FIGMA_TOKEN in Railway environment variables\n');
  }
});