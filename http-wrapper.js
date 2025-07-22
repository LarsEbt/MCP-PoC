/**
 * HTTP Wrapper für MCP Server
 * Ermöglicht die Integration in beliebige Chatbot-Plattformen über HTTP/REST
 */

import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.HTTP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Chatbot Integration Endpoint
 * POST /chat - Verarbeitet Chatbot-Anfragen und leitet sie an den MCP Server weiter
 */
app.post('/chat', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        usage: 'POST /chat with { "message": "your message", "context": {} }'
      });
    }

    // Hier würden Sie die Nachricht an Ihren MCP Server weiterleiten
    // und die Antwort zurückgeben
    const response = await processChatMessage(message, context);
    
    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * MCP Tools direkt aufrufen
 * POST /tools/:toolName - Ruft spezifische MCP Tools auf
 */
app.post('/tools/:toolName', async (req, res) => {
  try {
    const { toolName } = req.params;
    const { parameters = {} } = req.body;
    
    // Simuliere MCP Tool-Aufruf
    const result = await callMcpTool(toolName, parameters);
    
    res.json({
      success: true,
      tool: toolName,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Tool ${req.params.toolName} error:`, error);
    res.status(500).json({
      error: 'Tool execution failed',
      message: error.message
    });
  }
});

/**
 * Verfügbare Tools auflisten
 * GET /tools - Listet alle verfügbaren MCP Tools auf
 */
app.get('/tools', async (req, res) => {
  try {
    const tools = await getAvailableTools();
    res.json({
      success: true,
      tools,
      count: tools.length
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve tools',
      message: error.message
    });
  }
});

/**
 * Health Check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'mcp-http-wrapper',
    timestamp: new Date().toISOString()
  });
});

/**
 * Webhook für externe Chatbot-Plattformen
 * POST /webhook/:platform - Spezifische Webhooks für verschiedene Plattformen
 */
app.post('/webhook/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const payload = req.body;
    
    let response;
    
    switch (platform) {
      case 'discord':
        response = await handleDiscordWebhook(payload);
        break;
      case 'slack':
        response = await handleSlackWebhook(payload);
        break;
      case 'teams':
        response = await handleTeamsWebhook(payload);
        break;
      case 'telegram':
        response = await handleTelegramWebhook(payload);
        break;
      default:
        return res.status(400).json({
          error: 'Unsupported platform',
          supported: ['discord', 'slack', 'teams', 'telegram']
        });
    }
    
    res.json(response);
    
  } catch (error) {
    console.error(`Webhook ${req.params.platform} error:`, error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

// Helper Functions
async function processChatMessage(message, context) {
  // Hier implementieren Sie die Logik zur Verarbeitung von Chat-Nachrichten
  // durch Ihren MCP Server
  return {
    reply: `Verarbeitet: ${message}`,
    context,
    tools_used: []
  };
}

async function callMcpTool(toolName, parameters) {
  // Simuliert einen MCP Tool-Aufruf
  // In der echten Implementierung würden Sie hier Ihren MCP Server aufrufen
  return {
    tool: toolName,
    parameters,
    result: `Tool ${toolName} wurde ausgeführt`
  };
}

async function getAvailableTools() {
  // Gibt die verfügbaren MCP Tools zurück
  return [
    'custom-api-call',
    'database-query',
    'intershop-search-products',
    'intershop-get-categories',
    'data-processing'
  ];
}

// Platform-spezifische Webhook-Handler
async function handleDiscordWebhook(payload) {
  return { type: 4, data: { content: "Hello from MCP Server!" } };
}

async function handleSlackWebhook(payload) {
  return { text: "Hello from MCP Server!" };
}

async function handleTeamsWebhook(payload) {
  return { type: "message", text: "Hello from MCP Server!" };
}

async function handleTelegramWebhook(payload) {
  return { 
    method: "sendMessage", 
    chat_id: payload.message.chat.id, 
    text: "Hello from MCP Server!" 
  };
}

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 MCP HTTP Wrapper running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /tools - List available tools`);
  console.log(`  POST /chat - Process chat messages`);
  console.log(`  POST /tools/:toolName - Call specific tools`);
  console.log(`  POST /webhook/:platform - Platform webhooks`);
});

export default app;
