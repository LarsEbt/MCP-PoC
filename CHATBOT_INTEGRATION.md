# MCP Server Chatbot Integration Guide

## 🤖 Wie Sie Ihren MCP Server an Chatbots anschließen

### 1. Claude Desktop Integration

#### Schritt 1: Claude Desktop installieren
- Laden Sie Claude Desktop von der offiziellen Website herunter
- Installieren Sie die Anwendung

#### Schritt 2: Konfiguration erstellen
```bash
# Windows PowerShell
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
New-Item -Path (Split-Path $configPath) -ItemType Directory -Force
```

#### Schritt 3: Konfigurationsdatei bearbeiten
Kopieren Sie den Inhalt aus `claude-desktop-config.example` in die Konfigurationsdatei:

```json
{
  "mcpServers": {
    "custom-mcp-server": {
      "command": "node",
      "args": ["c:\\Users\\larse\\Desktop\\MCP\\index.js"],
      "env": {
        "INTERSHOP_API_URL": "YOUR_INTERSHOP_URL",
        "INTERSHOP_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

#### Schritt 4: Claude Desktop neu starten
Nach dem Speichern der Konfiguration, starten Sie Claude Desktop neu.

### 2. VS Code Integration (Copilot/Claude)

#### Für VS Code Copilot:
1. Installieren Sie die MCP Extension (falls verfügbar)
2. Konfigurieren Sie den Server in den VS Code Settings
3. Verwenden Sie die `mcp-config.json` Datei

### 3. HTTP Wrapper für andere Chatbots

#### Schritt 1: Zusätzliche Dependencies installieren
```bash
npm install express cors
```

#### Schritt 2: HTTP Wrapper starten
```bash
npm run http
```

#### Schritt 3: Chatbot-Plattform konfigurieren

**Discord Bot:**
```javascript
// Discord.js Beispiel
const webhook = 'http://localhost:3001/webhook/discord';

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message.content,
      user: message.author.id
    })
  });
  
  const data = await response.json();
  message.reply(data.reply);
});
```

**Slack App:**
```javascript
// Slack Bolt Beispiel
app.message(async ({ message, say }) => {
  const response = await fetch('http://localhost:3001/webhook/slack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: message.text,
      user: message.user
    })
  });
  
  const data = await response.json();
  await say(data.text);
});
```

**Telegram Bot:**
```javascript
// Telegram Bot API Beispiel
bot.on('text', async (ctx) => {
  const response = await fetch('http://localhost:3001/webhook/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        text: ctx.message.text,
        chat: ctx.message.chat
      }
    })
  });
  
  const data = await response.json();
  ctx.reply(data.text);
});
```

### 4. Direkte API Integration

#### REST API Aufrufe:
```bash
# Chat-Nachricht senden
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Suche nach Produkten", "context": {}}'

# Spezifisches Tool aufrufen  
curl -X POST http://localhost:3001/tools/intershop-search-products \
  -H "Content-Type: application/json" \
  -d '{"parameters": {"query": "laptop", "limit": 10}}'

# Verfügbare Tools anzeigen
curl http://localhost:3001/tools
```

### 5. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env` Datei:
```bash
# API Konfiguration
INTERSHOP_API_URL=https://your-intershop-instance.com/api
INTERSHOP_API_KEY=your-api-key-here

# HTTP Wrapper Konfiguration  
HTTP_PORT=3001
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

### 6. Testbeispiele

#### MCP Server direkt testen:
```bash
npm run test:intershop
```

#### HTTP Wrapper testen:
```bash
# In einem Terminal: HTTP Wrapper starten
npm run http

# In einem anderen Terminal: Test-Anfrage
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hallo, kannst du mir Produkte zeigen?"}'
```

## 🔧 Troubleshooting

### Häufige Probleme:

1. **Claude Desktop erkennt Server nicht:**
   - Prüfen Sie den Pfad in der Konfiguration
   - Stellen Sie sicher, dass Node.js installiert ist
   - Überprüfen Sie die Berechtigungen

2. **HTTP Wrapper startet nicht:**
   - Installieren Sie fehlende Dependencies: `npm install express cors`
   - Prüfen Sie, ob Port 3001 verfügbar ist

3. **Intershop API Fehler:**
   - Überprüfen Sie die API-URL und den API-Key
   - Testen Sie die Verbindung mit: `npm run test:intershop`

## 📞 Support

Bei Problemen oder Fragen:
1. Prüfen Sie die Logs in der Konsole
2. Testen Sie zunächst den MCP Server direkt
3. Überprüfen Sie die Netzwerkverbindung
4. Konsultieren Sie die MCP Documentation: https://modelcontextprotocol.io/

## 🚀 Erweiterte Integration

Für erweiterte Integrationen können Sie:
- WebSocket-Support hinzufügen
- Authentifizierung implementieren
- Rate Limiting erweitern
- Monitoring und Logging verbessern
- Custom Protokoll-Handler entwickeln
