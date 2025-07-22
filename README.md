# Intershop MCP Server

Ein spezialisierter Model Context Protocol (MCP) Server für vollständige Intershop Commerce Management (ICM) Integration.

## 🚀 Features

- **🛒 Intershop E-Commerce Integration**: Vollständiger Zugriff auf Produkte, Kategorien, Warenkorb
- **🔍 Produktsuche**: Einfache und erweiterte Suche mit Filtern
- **📱 Produktmanagement**: Detaillierte Produktinformationen, Bilder, Attribute, Preise
- **⭐ Produktbewertungen**: Abrufen von Kundenbewertungen und Reviews
- **🔗 Produktempfehlungen**: Ähnliche Produkte finden
- **📦 Verfügbarkeit**: Lagerbestand und Lieferzeiten prüfen
- **🗂️ Kategorien-Navigation**: Hierarchische Produktkategorien durchsuchen
- **🛍️ Warenkorb-Funktionen**: Erstellen, Verwalten, Items hinzufügen/entfernen/aktualisieren
- **💳 Checkout-Prozess**: Checkout-Funktionalität starten
- **🔄 Fehlerbehandlung**: Robuste Fehlerbehandlung mit informativen Meldungen

## 📦 Installation

```bash
# Dependencies installieren
npm install

# Server starten
npm start

# Development-Modus mit Debugging
npm run dev

# Intershop E-Commerce Tests
npm run test:intershop
```

## ⚙️ Konfiguration

Erstellen Sie eine `.env` Datei im Projektverzeichnis:

```bash
# Intershop API Konfiguration (optional - Standard-Demo verwendet)
INTERSHOP_API_URL=https://your-intershop-instance.com/api
INTERSHOP_API_KEY=your-api-key-here

# Logging
LOG_LEVEL=info
```

## 🛠️ Verfügbare Tools

### Produktsuche
- **`search_products`**: Grundlegende Produktsuche
- **`advanced_product_search`**: Erweiterte Suche mit Preis-, Marken- und Sortierungsfiltern

### Produktinformationen
- **`get_product_details`**: Detaillierte Produktinformationen abrufen
- **`get_product_reviews`**: Kundenbewertungen und Reviews
- **`get_similar_products`**: Ähnliche/empfohlene Produkte
- **`check_product_availability`**: Verfügbarkeit und Lagerbestand

### Kategorien
- **`get_categories`**: Alle oder spezifische Kategorien abrufen
- **`get_category_products`**: Produkte einer bestimmten Kategorie

### Warenkorb
- **`manage_basket`**: Komplette Warenkorbverwaltung
  - `create`: Neuen Warenkorb erstellen
  - `add_product`: Produkt hinzufügen
  - `view`: Warenkorbinhalt anzeigen
  - `update_item`: Item-Menge aktualisieren
  - `remove_item`: Item entfernen

### Checkout
- **`start_checkout`**: Checkout-Prozess für Warenkorb starten

## 📋 Beispiele

### Produktsuche
```javascript
// Grundlegende Suche
{
  "name": "search_products",
  "arguments": {
    "query": "laptop",
    "limit": 10
  }
}

// Erweiterte Suche
{
  "name": "advanced_product_search", 
  "arguments": {
    "query": "smartphone",
    "minPrice": 200,
    "maxPrice": 800,
    "brand": "Samsung",
    "sortBy": "price-asc"
  }
}
```

### Warenkorbverwaltung
```javascript
// Warenkorb erstellen
{
  "name": "manage_basket",
  "arguments": {
    "action": "create"
  }
}

// Produkt hinzufügen
{
  "name": "manage_basket",
  "arguments": {
    "action": "add_product",
    "basketId": "basket-123",
    "sku": "201807231-01", 
    "quantity": 2
  }
}
```

## 🔧 Integration

### Claude Desktop
Erstellen Sie eine `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "intershop-mcp-server": {
      "command": "node",
      "args": ["path/to/your/project/index.js"],
      "env": {
        "INTERSHOP_API_URL": "https://your-instance.com/api"
      }
    }
  }
}
```

### VS Code
Nutzen Sie die MCP Extension oder konfigurieren Sie einen Task in VS Code.

## 🏗️ Architektur

```
📁 Intershop MCP Server
├── 📄 index.js              # Haupt-MCP-Server
├── 📄 intershop-client.js    # Intershop API Client
├── 📄 utils.js               # Hilfsfunktionen
├── 📄 test-intershop.js      # Intershop-Tests
└── 📄 config.json            # Konfiguration
```

## 🧪 Tests

```bash
# Intershop API Tests ausführen
npm run test:intershop
```

Die Tests prüfen:
- Produktsuche Funktionalität
- Produktdetails Abruf
- Kategorien Navigation
- Warenkorboperationen
- API-Verbindung und Antwortzeiten

## 🌐 Intershop API

Dieses Projekt nutzt standardmäßig die Intershop Demo-API:
- **Base URL**: `https://develop.icm.intershop.de/INTERSHOP/rest/WFS/inSPIRED-inTRONICS_Business-Site/-;loc=en_US;cur=USD`
- **Shop**: inSPIRED - inTRONICS Business
- **Locale**: en_US
- **Currency**: USD

Für Ihre eigene Intershop-Instanz passen Sie die Konfiguration in der `.env` Datei an.

## 🛡️ Fehlerbehandlung

Der Server implementiert umfassende Fehlerbehandlung:
- Netzwerk-Timeouts und Retry-Mechanismen
- Validierung aller Eingabeparameter
- Informative Fehlermeldungen mit Kontext
- Graceful Fallbacks bei API-Fehlern

## 📚 API Dokumentation

Alle verfügbaren Tools werden automatisch durch den MCP Server dokumentiert und können durch `ListToolsRequest` abgerufen werden.

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch
3. Committen Sie Ihre Änderungen
4. Push zum Branch  
5. Erstellen Sie einen Pull Request

## 📄 Lizenz

ISC License - siehe LICENSE Datei für Details.

---

**Bereit für E-Commerce! 🛍️**

Starten Sie den Server mit `npm start` und beginnen Sie sofort mit der Intershop-Integration in Ihren MCP-fähigen Client.
