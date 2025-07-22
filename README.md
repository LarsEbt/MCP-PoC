# Custom MCP Server mit Intershop E-Commerce Integration

Ein eigener Model Context Protocol (MCP) Server in JavaScript mit vollständiger Intershop Commerce Management (ICM) Integration für E-Commerce-Funktionalität.

## 🚀 Features

- **🛒 Intershop E-Commerce Integration**: Vollständiger Zugriff auf Produkte, Kategorien, Warenkorb
- **📱 Produktmanagement**: Detaillierte Produktsuche, Bilder, Attribute, Preise
- **🗂️ Kategorien-Navigation**: Hierarchische Produktkategorien
- **�️ Warenkorb-Funktionen**: Erstellen, Verwalten, Checkout-Prozess
- **Custom API Integration**: Einfache Integration eigener REST APIs
- **Database Support**: Datenbankabfragen und -operationen
- **Data Processing**: Datenverarbeitung und -transformation
- **Rate Limiting**: Automatische Anfragenbegrenzung
- **Error Handling**: Robuste Fehlerbehandlung mit Retry-Logik

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

## 🛠️ Verfügbare MCP Tools

### 🛒 E-Commerce Tools (Intershop ICM)

#### 1. `search_products`
Sucht nach Produkten im E-Commerce System.

**Parameter:**
- `query` (string, optional): Suchbegriff
- `category` (string, optional): Kategorie ID
- `limit` (number, optional): Anzahl Ergebnisse (Standard: 24)
- `offset` (number, optional): Offset für Paginierung

**Beispiel:**
```json
{
  "query": "Surface",
  "limit": 10
}
```

#### 2. `get_product_details`
Detaillierte Produktinformationen mit Bildern, Attributen und Preisen.

**Parameter:**
- `sku` (string): Produkt SKU/Artikelnummer

**Beispiel:**
```json
{
  "sku": "201807231-01"
}
```

#### 3. `manage_basket`
Warenkorb-Management (erstellen, Produkte hinzufügen, anzeigen).

**Parameter:**
- `action` (string): "create", "add_product", "view"
- `basketId` (string, optional): Warenkorb ID
- `sku` (string, optional): Produkt SKU
- `quantity` (number, optional): Anzahl (Standard: 1)

**Beispiele:**
```json
// Warenkorb erstellen
{"action": "create"}

// Produkt hinzufügen
{"action": "add_product", "basketId": "xyz", "sku": "201807231-01", "quantity": 2}

// Warenkorb anzeigen
{"action": "view", "basketId": "xyz"}
```

#### 4. `get_categories`
Produktkategorien und Kategorie-Navigation.

**Parameter:**
- `categoryId` (string, optional): Spezifische Kategorie ID

**Beispiel:**
```json
{
  "categoryId": "Computers"
}
```

### 🔧 Allgemeine Tools

#### 5. `call_custom_api`
Direkter Aufruf eigener APIs mit automatischer API-Key-Behandlung.

#### 6. `query_database`
Datenbankabfragen für weitere Datenquellen.

#### 7. `process_data`
Datenverarbeitung und -transformation.

## 🌐 Intershop E-Commerce Demo

Die Integration nutzt die **Intershop inSPIRED Demo-Umgebung**:

- **Base URL:** `https://develop.icm.intershop.de/INTERSHOP/rest/WFS/inSPIRED-inTRONICS_Business-Site/`
- **Vollständiger Produktkatalog** mit Elektronik, Computern, Tablets
- **Echte Produktdaten:** Microsoft Surface, Dell, HP, etc.
- **Produktbilder** in verschiedenen Größen (S, M, L, ZOOM)
- **Detaillierte Attribute:** Speicher, Prozessor, Bildschirmgröße
- **Preise und Verfügbarkeit** in USD
- **Kategoriestruktur:** Computers → Tablets → Microsoft

### Beispiel-Produkte
- **Microsoft Surface Book 2** (SKU: 201807231-01)
- **Dell Laptops** verschiedene Modelle
- **HP Desktop Computer**
- **Tablets und Zubehör**

## 🧪 Testen der Integration

```bash
# Grundlegende Tests
npm test

# Intershop E-Commerce spezifische Tests
npm run test:intershop
```

Die Tests prüfen:
- ✅ Produktsuche und -details
- ✅ Kategorien-Navigation
- ✅ Bildextraktion
- ✅ Preisformatierung
- ✅ Warenkorb-Funktionen
- ✅ Attribut-Verarbeitung

## 💻 Code-Beispiele

### JavaScript Integration
```javascript
import IntershopIcmClient from './intershop-client.js';

const client = new IntershopIcmClient();

// Produkt suchen
const results = await client.searchProducts('Surface');

// Produktdetails
const product = await client.getProduct('201807231-01');

// Bilder extrahieren
const images = client.extractProductImages(product);

// Preise formatieren
const price = client.formatPrice(product.listPrice);
```

### MCP Tool Aufrufe
```json
// Produktsuche
{
  "tool": "search_products",
  "args": {"query": "Microsoft Surface", "limit": 5}
}

// Produktdetails
{
  "tool": "get_product_details", 
  "args": {"sku": "201807231-01"}
}

// Kategorien anzeigen
{
  "tool": "get_categories",
  "args": {}
}
```

## ⚙️ Konfiguration erweitern

### Eigene E-Commerce APIs hinzufügen
```json
{
  "apis": {
    "mein_shop": {
      "base_url": "https://api.mein-shop.de",
      "endpoints": {
        "produkte": {
          "path": "/products",
          "method": "GET"
        }
      }
    }
  }
}
```

### Weitere Intershop Instanzen
```json
{
  "base_url": "https://ihr-intershop-server.de/INTERSHOP/rest/WFS/ihr-site/-;loc=de_DE;cur=EUR"
}
```

## 📊 Verfügbare Daten

### Produktinformationen
- Name, Beschreibung, SKU
- Preise (Liste, Angebot)
- Verfügbarkeit und Lieferzeit
- Technische Attribute
- Produktbilder (verschiedene Größen)
- Hersteller und Kategorien

### E-Commerce-Funktionen
- Produktsuche mit Filtern
- Kategorien-Navigation
- Warenkorb-Management
- Checkout-Vorbereitung
- Produktempfehlungen
- Bewertungen und Reviews

## � Produktive Nutzung

### Eigene Intershop-Instanz
1. Base URL in `config.json` ändern
2. Authentifizierung konfigurieren
3. Site- und Lokalisierungsparameter anpassen

### API-Keys und Sicherheit
```bash
# .env Datei erstellen
cp .env.example .env

# Eigene Keys eintragen
INTERSHOP_API_KEY=ihr_api_key
INTERSHOP_BASE_URL=https://ihr-server.de
```

## 📚 Weitere Ressourcen

- [Intershop ICM REST API Dokumentation](https://knowledge.intershop.com/kb/index.php/Display/314H02)
- [MCP Documentation](https://modelcontextprotocol.io/llms-full.txt)
- [Intershop Commerce Management](https://www.intershop.com/)

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Öffne einen Pull Request

## 📄 License

ISC License - siehe LICENSE Datei für Details.
