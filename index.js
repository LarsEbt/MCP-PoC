#!/usr/bin/env node

/**
 * Intershop MCP Server
 * Ein spezialisierter MCP Server für Intershop E-Commerce Integration
 */

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { IntershopIcmClient } from './intershop-client.js';

// Server-Instanz erstellen
const server = new Server(
  {
    name: 'intershop-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Intershop-spezifische Schemas
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
  itemId: z.string().optional().describe('Item ID für Updates/Löschungen'),
});

const AdvancedSearchSchema = z.object({
  query: z.string().optional().describe('Suchbegriff'),
  category: z.string().optional().describe('Kategorie ID'),
  minPrice: z.number().optional().describe('Mindestpreis'),
  maxPrice: z.number().optional().describe('Höchstpreis'),
  brand: z.string().optional().describe('Marke/Hersteller'),
  sortBy: z.string().optional().default('relevance').describe('Sortierung'),
  limit: z.number().optional().default(24).describe('Anzahl der Ergebnisse'),
  offset: z.number().optional().default(0).describe('Offset für Paginierung'),
});

// Intershop Client initialisieren
const intershopClient = new IntershopIcmClient();

// Intershop Tools definieren
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
        name: 'advanced_product_search',
        description: 'Erweiterte Produktsuche mit Filtern (Preis, Marke, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Suchbegriff',
            },
            category: {
              type: 'string',
              description: 'Kategorie ID',
            },
            minPrice: {
              type: 'number',
              description: 'Mindestpreis',
            },
            maxPrice: {
              type: 'number',
              description: 'Höchstpreis',
            },
            brand: {
              type: 'string',
              description: 'Marke/Hersteller',
            },
            sortBy: {
              type: 'string',
              enum: ['relevance', 'price-asc', 'price-desc', 'name', 'newest'],
              default: 'relevance',
              description: 'Sortierung',
            },
            limit: {
              type: 'number',
              default: 24,
              description: 'Anzahl der Ergebnisse',
            },
            offset: {
              type: 'number',
              default: 0,
              description: 'Offset für Paginierung',
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
        name: 'get_product_reviews',
        description: 'Produktbewertungen und Reviews abrufen',
        inputSchema: {
          type: 'object',
          properties: {
            sku: {
              type: 'string',
              description: 'Produkt SKU/Artikelnummer',
            },
          },
          required: ['sku'],
        },
      },
      {
        name: 'get_similar_products',
        description: 'Ähnliche/Empfohlene Produkte finden',
        inputSchema: {
          type: 'object',
          properties: {
            sku: {
              type: 'string',
              description: 'Produkt SKU als Basis für Empfehlungen',
            },
          },
          required: ['sku'],
        },
      },
      {
        name: 'check_product_availability',
        description: 'Produktverfügbarkeit und Lagerbestand prüfen',
        inputSchema: {
          type: 'object',
          properties: {
            sku: {
              type: 'string',
              description: 'Produkt SKU/Artikelnummer',
            },
          },
          required: ['sku'],
        },
      },
      {
        name: 'manage_basket',
        description: 'Warenkorb verwalten (erstellen, Produkte hinzufügen, anzeigen, aktualisieren, löschen)',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['create', 'add_product', 'view', 'update_item', 'remove_item'],
              description: 'Warenkorb-Aktion',
            },
            basketId: {
              type: 'string',
              description: 'Warenkorb ID (wird automatisch erstellt wenn leer bei create)',
            },
            sku: {
              type: 'string',
              description: 'Produkt SKU (für add_product)',
            },
            quantity: {
              type: 'number',
              default: 1,
              description: 'Anzahl des Produkts (für add_product und update_item)',
            },
            itemId: {
              type: 'string',
              description: 'Item ID (für update_item und remove_item)',
            },
          },
          required: ['action'],
        },
      },
      {
        name: 'get_categories',
        description: 'Produktkategorien abrufen (alle oder spezifische)',
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
        name: 'get_category_products',
        description: 'Alle Produkte einer bestimmten Kategorie abrufen',
        inputSchema: {
          type: 'object',
          properties: {
            categoryId: {
              type: 'string',
              description: 'Kategorie ID',
            },
            limit: {
              type: 'number',
              default: 24,
              description: 'Anzahl der Ergebnisse',
            },
            offset: {
              type: 'number',
              default: 0,
              description: 'Offset für Paginierung',
            },
          },
          required: ['categoryId'],
        },
      },
      {
        name: 'start_checkout',
        description: 'Checkout-Prozess für einen Warenkorb starten',
        inputSchema: {
          type: 'object',
          properties: {
            basketId: {
              type: 'string',
              description: 'Warenkorb ID für den Checkout',
            },
          },
          required: ['basketId'],
        },
      },
    ],
  };
});

// Intershop Tool-Handler implementieren
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
              text: `🛍️ Produktsuche erfolgreich!\n\n📊 Ergebnisse: ${products.length} Produkte gefunden\n🔍 Suche: "${query || 'Alle Produkte'}"\n� Kategorie: ${category || 'Alle'}\n\n�🔝 Top 5 Produkte:\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
        };
      }

      case 'advanced_product_search': {
        const params = AdvancedSearchSchema.parse(args);
        
        const result = await intershopClient.advancedProductSearch(params);
        const products = result.products || result.elements || [];
        
        const summary = products.slice(0, 5).map(product => ({
          sku: product.sku,
          name: product.productName || product.name,
          price: intershopClient.formatPrice(product.listPrice || product.salePrice),
          manufacturer: product.manufacturer,
          inStock: product.inStock,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `🔍 Erweiterte Produktsuche erfolgreich!\n\n📊 ${products.length} Produkte gefunden\n💰 Preisbereich: ${params.minPrice || 0} - ${params.maxPrice || '∞'}\n🏷️ Marke: ${params.brand || 'Alle'}\n📋 Sortierung: ${params.sortBy}\n\n🔝 Top 5 Ergebnisse:\n${JSON.stringify(summary, null, 2)}`,
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
              text: `📋 Produktdetails für SKU: ${sku}\n\n${JSON.stringify(details, null, 2)}`,
            },
          ],
        };
      }

      case 'get_product_reviews': {
        const { sku } = ProductDetailsSchema.parse(args);
        
        const reviews = await intershopClient.getProductReviews(sku);
        
        return {
          content: [
            {
              type: 'text',
              text: `⭐ Bewertungen für Produkt ${sku}:\n\n${JSON.stringify(reviews, null, 2)}`,
            },
          ],
        };
      }

      case 'get_similar_products': {
        const { sku } = ProductDetailsSchema.parse(args);
        
        const similar = await intershopClient.getSimilarProducts(sku);
        
        return {
          content: [
            {
              type: 'text',
              text: `🔗 Ähnliche Produkte für ${sku}:\n\n${JSON.stringify(similar, null, 2)}`,
            },
          ],
        };
      }

      case 'check_product_availability': {
        const { sku } = ProductDetailsSchema.parse(args);
        
        const availability = await intershopClient.checkAvailability(sku);
        
        return {
          content: [
            {
              type: 'text',
              text: `📦 Verfügbarkeit für Produkt ${sku}:\n\n${JSON.stringify(availability, null, 2)}`,
            },
          ],
        };
      }

      case 'manage_basket': {
        const { action, basketId, sku, quantity = 1, itemId } = BasketActionSchema.parse(args);
        
        let result;
        
        switch (action) {
          case 'create':
            result = await intershopClient.createBasket();
            return {
              content: [
                {
                  type: 'text',
                  text: `🛒 Warenkorb erstellt!\n\n🆔 Basket ID: ${result.basketId || result.id}\n📊 Status: ${result.status || 'Neu'}`,
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
                  text: `✅ Produkt zum Warenkorb hinzugefügt!\n\n🏷️ Produkt: ${sku}\n📊 Menge: ${quantity}\n🛒 Basket ID: ${basketId}`,
                },
              ],
            };
            
          case 'update_item':
            if (!basketId || !itemId || !quantity) {
              throw new Error('basketId, itemId und quantity sind für update_item erforderlich');
            }
            result = await intershopClient.updateBasketItem(basketId, itemId, quantity);
            return {
              content: [
                {
                  type: 'text',
                  text: `🔄 Warenkorb-Item aktualisiert!\n\n🆔 Item ID: ${itemId}\n📊 Neue Menge: ${quantity}\n🛒 Basket ID: ${basketId}`,
                },
              ],
            };
            
          case 'remove_item':
            if (!basketId || !itemId) {
              throw new Error('basketId und itemId sind für remove_item erforderlich');
            }
            result = await intershopClient.removeFromBasket(basketId, itemId);
            return {
              content: [
                {
                  type: 'text',
                  text: `🗑️ Item aus Warenkorb entfernt!\n\n🆔 Item ID: ${itemId}\n🛒 Basket ID: ${basketId}`,
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
                id: item.itemId,
                sku: item.sku,
                name: item.productName,
                quantity: item.quantity,
                price: intershopClient.formatPrice(item.singleBasePrice),
                total: intershopClient.formatPrice(item.totalPrice),
              })) || [],
            };
            
            return {
              content: [
                {
                  type: 'text',
                  text: `🛒 Warenkorb Details:\n\n${JSON.stringify(basketSummary, null, 2)}`,
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
              text: `📂 Kategorien ${categoryId ? `(${categoryId})` : '(Alle)'}:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'get_category_products': {
        const { categoryId, limit = 24, offset = 0 } = args;
        
        if (!categoryId) {
          throw new Error('categoryId ist erforderlich');
        }
        
        const result = await intershopClient.getCategoryProducts(categoryId, { limit, offset });
        const products = result.products || result.elements || [];
        
        const summary = products.slice(0, 5).map(product => ({
          sku: product.sku,
          name: product.productName || product.name,
          price: intershopClient.formatPrice(product.listPrice || product.salePrice),
        }));

        return {
          content: [
            {
              type: 'text',
              text: `📂 Produkte in Kategorie ${categoryId}:\n\n📊 ${products.length} Produkte gefunden\n\n🔝 Top 5:\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
        };
      }

      case 'start_checkout': {
        const { basketId } = args;
        
        if (!basketId) {
          throw new Error('basketId ist erforderlich');
        }
        
        const result = await intershopClient.startCheckout(basketId);
        
        return {
          content: [
            {
              type: 'text',
              text: `💳 Checkout gestartet für Warenkorb ${basketId}:\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unbekanntes Intershop Tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Fehler beim Ausführen des Tools "${name}": ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Intershop MCP Server starten
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🛍️ Intershop MCP Server gestartet und bereit für E-Commerce-Anfragen!');
}

main().catch((error) => {
  console.error('❌ Server-Fehler:', error);
  process.exit(1);
});
