/**
 * Intershop ICM E-Commerce API Client
 * Spezialisierte Funktionen für die Intershop Commerce Management API
 */

import { makeHttpRequest, interpolateUrl, appendQueryParams } from './utils.js';

export class IntershopIcmClient {
  constructor() {
    this.baseUrl = 'https://develop.icm.intershop.de/INTERSHOP/rest/WFS/inSPIRED-inTRONICS_Business-Site/-;loc=en_US;cur=USD';
    this.defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  async get(endpoint, params = {}, pathParams = {}) {
    let url = interpolateUrl(`${this.baseUrl}${endpoint}`, pathParams);
    url = appendQueryParams(url, params);
    
    const response = await makeHttpRequest(url, {
      method: 'GET',
      headers: this.defaultHeaders,
    });
    
    return await response.json();
  }

  async post(endpoint, data = {}, pathParams = {}) {
    const url = interpolateUrl(`${this.baseUrl}${endpoint}`, pathParams);
    
    const response = await makeHttpRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  }

  async put(endpoint, data = {}, pathParams = {}) {
    const url = interpolateUrl(`${this.baseUrl}${endpoint}`, pathParams);
    
    const response = await makeHttpRequest(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  }

  async delete(endpoint, pathParams = {}) {
    const url = interpolateUrl(`${this.baseUrl}${endpoint}`, pathParams);
    
    const response = await makeHttpRequest(url, {
      method: 'DELETE',
      headers: this.defaultHeaders,
    });
    
    return await response.json();
  }

  /**
   * Einzelnes Produkt mit allen Details abrufen
   */
  async getProduct(sku, options = {}) {
    const params = {
      allImages: true,
      extended: true,
      ...options,
    };

    return await this.get(`/products/${sku}`, params);
  }

  /**
   * Produktsuche durchführen
   */
  async searchProducts(query, options = {}) {
    const params = {
      searchTerm: query,
      limit: 24,
      offset: 0,
      allImages: true,
      ...options,
    };

    return await this.get('/products', params);
  }

  /**
   * Alle Kategorien abrufen
   */
  async getCategories() {
    return await this.get('/categories');
  }

  /**
   * Einzelne Kategorie mit Details
   */
  async getCategory(categoryId) {
    return await this.get(`/categories/${categoryId}`);
  }

  /**
   * Produkte einer Kategorie abrufen
   */
  async getCategoryProducts(categoryId, options = {}) {
    const params = {
      limit: 24,
      offset: 0,
      allImages: true,
      ...options,
    };

    return await this.get(`/categories/${categoryId}/products`, params);
  }

  /**
   * Neuen Warenkorb erstellen
   */
  async createBasket() {
    return await this.post('/baskets');
  }

  /**
   * Warenkorb Details abrufen
   */
  async getBasket(basketId) {
    return await this.get(`/baskets/${basketId}`);
  }

  /**
   * Produkt zum Warenkorb hinzufügen
   */
  async addToBasket(basketId, sku, quantity = 1) {
    const data = {
      sku,
      quantity,
    };

    return await this.post(`/baskets/${basketId}/items`, data);
  }

  /**
   * Warenkorb aktualisieren
   */
  async updateBasketItem(basketId, itemId, quantity) {
    const data = { quantity };
    return await this.put(`/baskets/${basketId}/items/${itemId}`, data);
  }

  /**
   * Artikel aus Warenkorb entfernen
   */
  async removeFromBasket(basketId, itemId) {
    return await this.delete(`/baskets/${basketId}/items/${itemId}`);
  }

  /**
   * Produktbewertungen abrufen
   */
  async getProductReviews(sku) {
    return await this.get(`/products/${sku}/reviews`);
  }

  /**
   * Ähnliche Produkte finden
   */
  async getSimilarProducts(sku) {
    return await this.get(`/products/${sku}/recommendations`);
  }

  /**
   * Produktverfügbarkeit prüfen
   */
  async checkAvailability(sku) {
    return await this.get(`/products/${sku}/availability`);
  }

  /**
   * Hilfsfunktion: Produktbilder extrahieren
   */
  extractProductImages(product) {
    if (!product.images) return [];

    return product.images.map(image => ({
      type: image.typeID,
      url: `https://develop.icm.intershop.de${image.effectiveUrl}`,
      size: `${image.imageActualWidth}x${image.imageActualHeight}`,
      view: image.viewID,
      isPrimary: image.primaryImage || false,
    }));
  }

  /**
   * Hilfsfunktion: Produktattribute formatieren
   */
  formatProductAttributes(product) {
    if (!product.attributes) return {};

    const formatted = {};
    product.attributes.forEach(attr => {
      formatted[attr.name] = {
        type: attr.type,
        value: attr.value,
      };
    });

    return formatted;
  }

  /**
   * Hilfsfunktion: Preise formatieren
   * Unterstützt sowohl die alte als auch die neue Preis-API-Struktur
   */
  formatPrice(priceObj) {
    if (!priceObj) return null;

    // Neue Intershop Pricing API v1 Struktur
    if (priceObj.prices) {
      const prices = priceObj.prices;
      
      return {
        sku: priceObj.sku,
        salePrice: prices.SalePrice?.[0] ? {
          gross: prices.SalePrice[0].gross.value,
          net: prices.SalePrice[0].net.value,
          currency: prices.SalePrice[0].gross.currency,
          formatted: `${prices.SalePrice[0].gross.currency} ${prices.SalePrice[0].gross.value.toFixed(2)}`
        } : null,
        listPrice: prices.ListPrice?.[0] ? {
          gross: prices.ListPrice[0].gross.value,
          net: prices.ListPrice[0].net.value,
          currency: prices.ListPrice[0].gross.currency,
          formatted: `${prices.ListPrice[0].gross.currency} ${prices.ListPrice[0].gross.value.toFixed(2)}`
        } : null
      };
    }

    // Alte Preis-API Struktur (von /productprices)
    if (priceObj.listPrice || priceObj.salesPrice) {
      return {
        listPrice: priceObj.listPrice ? {
          value: priceObj.listPrice.value,
          currency: priceObj.listPrice.currency,
          formatted: `${priceObj.listPrice.currency} ${priceObj.listPrice.value.toFixed(2)}`
        } : null,
        salesPrice: priceObj.salesPrice ? {
          value: priceObj.salesPrice.value,
          currency: priceObj.salesPrice.currency,
          formatted: `${priceObj.salesPrice.currency} ${priceObj.salesPrice.value.toFixed(2)}`
        } : null,
        sku: priceObj.sku
      };
    }

    // Alte API-Struktur (fallback)
    return {
      value: priceObj.value,
      currency: priceObj.currency || priceObj.currencyMnemonic,
      formatted: `${priceObj.currencyMnemonic || '$'} ${priceObj.value.toFixed(2)}`,
    };
  }

  /**
   * Erweiterte Produktsuche mit Filtern
   */
  async advancedProductSearch(options = {}) {
    const {
      query = '',
      category = '',
      minPrice = null,
      maxPrice = null,
      brand = '',
      sortBy = 'relevance',
      limit = 24,
      offset = 0,
    } = options;

    const params = {
      limit,
      offset,
      allImages: true,
    };

    if (query) params.searchTerm = query;
    if (category) params.categoryId = category;
    if (minPrice) params.priceFrom = minPrice;
    if (maxPrice) params.priceTo = maxPrice;
    if (brand) params.manufacturer = brand;
    if (sortBy) params.sorting = sortBy;

    return await this.get('/products', params);
  }

  /**
   * Checkout-Prozess starten
   */
  async startCheckout(basketId) {
    return await this.post(`/baskets/${basketId}/checkout`);
  }

  /**
   * Produktpreise für eine oder mehrere SKUs abrufen
   * @param {string|string[]} skus - Einzelne SKU oder Array von SKUs
   * @returns {Promise<Object>} Preisinformationen
   */
  async getProductPrices(skus) {
    // Sicherstellen, dass skus ein Array ist
    const skuArray = Array.isArray(skus) ? skus : [skus];
    
    // Query-Parameter für jede SKU erstellen - direkt als Array
    const params = {
      sku: skuArray
    };

    // Spezial-Header für Intershop Pricing API
    const specialHeaders = {
      'Accept': 'application/vnd.intershop.pricing.v1+json',
      'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
      'Content-Type': 'application/json'
    };

    let url = interpolateUrl(`${this.baseUrl}/productprices`, {});
    url = appendQueryParams(url, params);
    
    const response = await makeHttpRequest(url, {
      method: 'GET',
      headers: specialHeaders,
    });
    
    return await response.json();
  }

  /**
   * Preis für eine einzelne SKU abrufen
   * @param {string} sku - Produkt-SKU
   * @returns {Promise<Object>} Preisinformation für das Produkt
   */
  async getProductPrice(sku) {
    const result = await this.getProductPrices(sku);
    return result;
  }

  /**
   * Test-Methode für die Preis-API
   * @param {string[]} testSkus - Test-SKUs
   */
  async testPriceApi(testSkus = ['1727541', '4818001']) {
    console.log('🧪 Teste Preis-API...');
    console.log('Test-SKUs:', testSkus);
    
    try {
      const result = await this.getProductPrices(testSkus);
      console.log('✅ Preis-API Antwort:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('❌ Preis-API Fehler:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Produkte mit Preisen anreichern
   * @param {Array} products - Array von Produktobjekten
   * @returns {Promise<Array>} Produkte mit Preisinformationen
   */
  async enrichProductsWithPrices(products) {
    if (!products || products.length === 0) return products;

    // SKUs aus URIs extrahieren und zu Produkten hinzufügen
    const productsWithSkus = products.map(product => {
      // SKU aus URI extrahieren: "/products/1588415" -> "1588415"
      let sku = null;
      if (product.uri) {
        const match = product.uri.match(/\/products\/([^\/\?]+)/);
        sku = match ? match[1] : null;
      }
      
      return {
        ...product,
        sku: sku,
        name: product.title // API verwendet 'title' statt 'name'
      };
    });

    // SKUs extrahieren
    const skus = productsWithSkus.map(product => product.sku).filter(Boolean);
    
    if (skus.length === 0) return productsWithSkus;

    try {
      // Versuche die neue Intershop Pricing API
      console.log('🔍 Versuche Preis-API für SKUs:', skus.slice(0, 10)); // Bis zu 10 SKUs
      const priceData = await this.getProductPrices(skus.slice(0, 10));
      
      console.log('🔍 Debug - Preis-API Antwort:', JSON.stringify(priceData, null, 2));
      
      // Neue API-Struktur: data Array mit Preisobjekten
      let priceElements = [];
      if (priceData.data && Array.isArray(priceData.data)) {
        priceElements = priceData.data;
      } else if (priceData.elements) {
        priceElements = priceData.elements;
      } else if (Array.isArray(priceData)) {
        priceElements = priceData;
      }
      
      // Preise den Produkten zuordnen
      return productsWithSkus.map(product => {
        const productPrice = priceElements.find(price => price.sku === product.sku);
        
        return {
          ...product,
          priceInfo: productPrice ? this.formatPrice(productPrice) : null
        };
      });
      
    } catch (error) {
      console.warn('❌ Preis-API fehlgeschlagen, verwende Fallback:', error.message);
      
      // Fallback: Detailierte Produktinformationen für die ersten paar Produkte abrufen
      const detailedProducts = await Promise.all(
        productsWithSkus.slice(0, 5).map(async product => {
          if (!product.sku) return product;
          
          try {
            const details = await this.getProduct(product.sku);
            console.log(`📋 Produktdetails für ${product.sku}:`, JSON.stringify(details, null, 2));
            
            // Preisinformationen aus Produktdetails extrahieren
            let priceInfo = null;
            if (details.price) {
              priceInfo = this.formatPrice(details.price);
            } else if (details.prices) {
              priceInfo = this.formatPrice(details.prices);
            } else if (details.listPrice || details.salesPrice) {
              priceInfo = this.formatPrice(details);
            }
            
            return {
              ...product,
              priceInfo,
              detailedInfo: {
                availability: details.availability,
                manufacturer: details.manufacturer,
                attributes: details.attributes
              }
            };
          } catch (detailError) {
            console.warn(`❌ Fehler beim Abrufen der Details für ${product.sku}:`, detailError.message);
            return product;
          }
        })
      );
      
      // Restliche Produkte ohne Details zurückgeben
      const remainingProducts = productsWithSkus.slice(5);
      
      return [...detailedProducts, ...remainingProducts];
    }
  }
}
