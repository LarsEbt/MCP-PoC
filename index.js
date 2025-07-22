#!/usr/bin/env node

/**
 * Custom MCP Server
 * Ein MCP Server für eigene APIs und Tools
 */

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import IntershopIcmClient from './intershop-client.js';

// Server-Instanz erstellen
const server = new Server(
  {
    name: 'custom-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Schema für die Custom API Parameter
const ApiCallSchema = z.object({
  endpoint: z.string().describe('API Endpoint URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
  headers: z.record(z.string()).optional().describe('HTTP Headers'),
  body: z.string().optional().describe('Request Body (JSON string)'),
});

const DatabaseQuerySchema = z.object({
  query: z.string().describe('SQL Query oder Database Query'),
  params: z.array(z.any()).optional().describe('Query Parameters'),
});

// E-Commerce spezifische Schemas
const ProductSearchSchema = z.object({
  query: z.string().optional().describe('Suchbegriff für Produkte'),
  category: z.string().optional().describe('Kategorie ID'),
  limit: z.number().optional().default(24).describe('Anzahl der Ergebnisse'),
  offset: z.number().optional().default(0).describe('Offset für Paginierung'),
});

const ProductDetailsSchema = z.object({
  sku: z.string().describe('Produkt SKU/Artikelnummer'),
});

const BasketActionSchema = z.object({
  basketId: z.string().optional().describe('Warenkorb ID (wird erstellt wenn leer)'),
  sku: z.string().optional().describe('Produkt SKU zum Hinzufügen'),
  quantity: z.number().optional().default(1).describe('Anzahl des Produkts'),
});

// Intershop Client initialisieren
const intershopClient = new IntershopIcmClient();

// Tools definieren
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_products',
        description: 'Suche nach Produkten im Intershop E-Commerce System',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Suchbegriff für Produkte (optional)',
            },
            category: {
              type: 'string',
              description: 'Kategorie ID zum Filtern (optional)',
            },
            limit: {
              type: 'number',
              default: 24,
              description: 'Anzahl der Ergebnisse (Standard: 24)',
            },
            offset: {
              type: 'number',
              default: 0,
              description: 'Offset für Paginierung (Standard: 0)',
            },
          },
        },
      },
      {
        name: 'get_product_details',
        description: 'Detaillierte Produktinformationen abrufen',
        inputSchema: {
          type: 'object',
          properties: {
            sku: {
              type: 'string',
              description: 'Produkt SKU/Artikelnummer (z.B. "201807231-01")',
            },
          },
          required: ['sku'],
        },
      },
      {
        name: 'manage_basket',
        description: 'Warenkorb verwalten (erstellen, Produkte hinzufügen, anzeigen)',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'add_product', 'view', 'update', 'remove'],
              description: 'Aktion: create (erstellen), add_product (Produkt hinzufügen), view (anzeigen)',
            },
            basketId: {
              type: 'string',
              description: 'Warenkorb ID (wird automatisch erstellt wenn leer)',
            },
            sku: {
              type: 'string',
              description: 'Produkt SKU zum Hinzufügen',
            },
            quantity: {
              type: 'number',
              default: 1,
              description: 'Anzahl des Produkts (Standard: 1)',
            },
          },
          required: ['action'],
        },
      },
      {
        name: 'get_categories',
        description: 'Produktkategorien abrufen',
        inputSchema: {
          type: 'object',
          properties: {
            categoryId: {
              type: 'string',
              description: 'Spezifische Kategorie ID (optional - zeigt alle wenn leer)',
            },
          },
        },
      },
      {
        name: 'call_custom_api',
        description: 'Ruft eine eigene API auf',
        inputSchema: {
          type: 'object',
          properties: {
            endpoint: {
              type: 'string',
              description: 'Die URL des API Endpoints',
            },
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'DELETE'],
              default: 'GET',
              description: 'HTTP Method',
            },
            headers: {
              type: 'object',
              description: 'HTTP Headers (optional)',
            },
            body: {
              type: 'string',
              description: 'Request Body als JSON String (optional)',
            },
          },
          required: ['endpoint'],
        },
      },
      {
        name: 'query_database',
        description: 'Führt eine Datenbank-Abfrage aus',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL Query oder Database Query',
            },
            params: {
              type: 'array',
              description: 'Query Parameters (optional)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'process_data',
        description: 'Verarbeitet Daten mit eigener Logik',
        inputSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'string',
              description: 'Daten zum Verarbeiten (JSON String)',
            },
            operation: {
              type: 'string',
              enum: ['filter', 'transform', 'aggregate', 'validate'],
              description: 'Art der Datenverarbeitung',
            },
            options: {
              type: 'object',
              description: 'Zusätzliche Optionen für die Verarbeitung',
            },
          },
          required: ['data', 'operation'],
        },
      },
    ],
  };
});

// Tool-Handler implementieren
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_products': {
        const { query = '', category, limit = 24, offset = 0 } = ProductSearchSchema.parse(args);
        
        let result;
        if (category) {
          result = await intershopClient.getCategoryProducts(category, { limit, offset });
        } else if (query) {
          result = await intershopClient.searchProducts(query, { limit, offset });
        } else {
          result = await intershopClient.searchProducts('', { limit, offset });
        }

        const products = result.products || result.elements || [];
        const summary = products.slice(0, 5).map(product => ({
          sku: product.sku,
          name: product.productName || product.name,
          price: intershopClient.formatPrice(product.listPrice || product.salePrice),
          inStock: product.inStock,
          image: product.images?.[0]?.effectiveUrl,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Produktsuche erfolgreich!\n\n📊 Ergebnisse: ${products.length} Produkte gefunden\n\n🔝 Top 5 Produkte:\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
        };
      }

      case 'get_product_details': {
        const { sku } = ProductDetailsSchema.parse(args);
        
        const product = await intershopClient.getProduct(sku);
        
        const details = {
          name: product.productName,
          sku: product.sku,
          description: product.shortDescription,
          longDescription: product.longDescription,
          price: {
            list: intershopClient.formatPrice(product.listPrice),
            sale: intershopClient.formatPrice(product.salePrice),
          },
          availability: {
            inStock: product.inStock,
            available: product.availability,
            readyForShipment: `${product.readyForShipmentMin}-${product.readyForShipmentMax} Tage`,
          },
          attributes: intershopClient.formatProductAttributes(product),
          images: intershopClient.extractProductImages(product),
          manufacturer: product.manufacturer,
          categories: product.defaultCategory?.categoryPath || [],
        };

        return {
          content: [
            {
              type: 'text',
              text: `Produktdetails für SKU: ${sku}\n\n${JSON.stringify(details, null, 2)}`,
            },
          ],
        };
      }

      case 'manage_basket': {
        const { action, basketId, sku, quantity = 1 } = args;
        
        let result;
        
        switch (action) {
          case 'create':
            result = await intershopClient.createBasket();
            return {
              content: [
                {
                  type: 'text',
                  text: `Warenkorb erstellt!\n\nBasket ID: ${result.basketId || result.id}\nStatus: ${result.status || 'Neu'}`,
                },
              ],
            };
            
          case 'add_product':
            if (!basketId || !sku) {
              throw new Error('basketId und sku sind für add_product erforderlich');
            }
            result = await intershopClient.addToBasket(basketId, sku, quantity);
            return {
              content: [
                {
                  type: 'text',
                  text: `Produkt zum Warenkorb hinzugefügt!\n\nProdukt: ${sku}\nMenge: ${quantity}\nBasket ID: ${basketId}`,
                },
              ],
            };
            
          case 'view':
            if (!basketId) {
              throw new Error('basketId ist für view erforderlich');
            }
            result = await intershopClient.getBasket(basketId);
            
            const basketSummary = {
              basketId: result.basketId || basketId,
              itemCount: result.lineItems?.length || 0,
              total: intershopClient.formatPrice(result.total),
              items: result.lineItems?.map(item => ({
                sku: item.sku,
                name: item.productName,
                quantity: item.quantity,
                price: intershopClient.formatPrice(item.singleBasePrice),
              })) || [],
            };
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Warenkorb Details:\n\n${JSON.stringify(basketSummary, null, 2)}`,
                },
              ],
            };
            
          default:
            throw new Error(`Unbekannte Warenkorb-Aktion: ${action}`);
        }
      }

      case 'get_categories': {
        const { categoryId } = args;
        
        let result;
        if (categoryId) {
          result = await intershopClient.getCategory(categoryId);
        } else {
          result = await intershopClient.getCategories();
        }

        return {
          content: [
            {
              type: 'text',
              text: `Kategorien:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'call_custom_api': {
        const { endpoint, method = 'GET', headers = {}, body } = ApiCallSchema.parse(args);
        
        // Automatische API-Key-Behandlung für bekannte Services
        let finalHeaders = { 'Content-Type': 'application/json', ...headers };
        let finalEndpoint = endpoint;
        
        // OpenWeather API - automatisch API Key hinzufügen
        if (endpoint.includes('openweathermap.org') && process.env.WEATHER_API_KEY) {
          const url = new URL(endpoint);
          url.searchParams.set('appid', process.env.WEATHER_API_KEY);
          finalEndpoint = url.toString();
        }
        
        // RapidAPI - automatisch Headers hinzufügen
        if (endpoint.includes('rapidapi.com') && process.env.RAPIDAPI_KEY) {
          finalHeaders['X-RapidAPI-Key'] = process.env.RAPIDAPI_KEY;
        }
        
        // News API - automatisch API Key hinzufügen
        if (endpoint.includes('newsapi.org') && process.env.NEWS_API_KEY) {
          const url = new URL(endpoint);
          url.searchParams.set('apiKey', process.env.NEWS_API_KEY);
          finalEndpoint = url.toString();
        }
        
        // Custom API Key als Authorization Header
        if (process.env.CUSTOM_API_KEY && !finalHeaders.Authorization) {
          finalHeaders.Authorization = `Bearer ${process.env.CUSTOM_API_KEY}`;
        }

        const fetchOptions = {
          method,
          headers: finalHeaders,
        };

        if (body && method !== 'GET') {
          fetchOptions.body = body;
        }

        const response = await fetch(finalEndpoint, fetchOptions);
        const data = await response.text();
        
        let jsonData;
        try {
          jsonData = JSON.parse(data);
        } catch {
          jsonData = data;
        }

        return {
          content: [
            {
              type: 'text',
              text: `API Aufruf erfolgreich!\n\nStatus: ${response.status}\nEndpoint: ${finalEndpoint}\nResponse:\n${JSON.stringify(jsonData, null, 2)}`,
            },
          ],
        };
      }

      case 'query_database': {
        const { query, params = [] } = DatabaseQuerySchema.parse(args);
        
        // Hier würdest du deine echte Datenbankverbindung implementieren
        // Beispiel für verschiedene Database-Systeme:
        
        // Simulierte Antwort - ersetze dies mit deiner echten DB-Logik
        const simulatedResult = {
          query,
          params,
          result: 'Hier würde das echte Datenbank-Ergebnis stehen',
          timestamp: new Date().toISOString(),
        };

        return {
          content: [
            {
              type: 'text',
              text: `Datenbank-Abfrage ausgeführt:\n\n${JSON.stringify(simulatedResult, null, 2)}`,
            },
          ],
        };
      }

      case 'process_data': {
        const { data, operation, options = {} } = args;
        
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          throw new Error(`Ungültige JSON-Daten: ${error.message}`);
        }

        let result;
        
        switch (operation) {
          case 'filter':
            // Beispiel für Datenfilterung
            result = Array.isArray(parsedData) 
              ? parsedData.filter(item => {
                  // Implementiere deine Filter-Logik hier
                  return true; // Placeholder
                })
              : parsedData;
            break;
            
          case 'transform':
            // Beispiel für Datentransformation
            result = Array.isArray(parsedData)
              ? parsedData.map(item => ({
                  ...item,
                  processed: true,
                  timestamp: new Date().toISOString(),
                }))
              : { ...parsedData, processed: true, timestamp: new Date().toISOString() };
            break;
            
          case 'aggregate':
            // Beispiel für Datenaggregation
            if (Array.isArray(parsedData)) {
              result = {
                count: parsedData.length,
                summary: 'Aggregierte Daten',
                items: parsedData,
              };
            } else {
              result = { single_item: parsedData };
            }
            break;
            
          case 'validate':
            // Beispiel für Datenvalidierung
            result = {
              valid: true,
              data: parsedData,
              validation_timestamp: new Date().toISOString(),
            };
            break;
            
          default:
            throw new Error(`Unbekannte Operation: ${operation}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: `Daten verarbeitet (${operation}):\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unbekanntes Tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Fehler beim Ausführen des Tools "${name}": ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Server starten
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Custom MCP Server gestartet und bereit!');
}

main().catch((error) => {
  console.error('Server-Fehler:', error);
  process.exit(1);
});
