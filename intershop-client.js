/**
 * Intershop ICM E-Commerce API Client
 * Spezialisierte Funktionen für die Intershop Commerce Management API
 */

import { CustomApiClient } from './api-clients.js';

export class IntershopIcmClient extends CustomApiClient {
  constructor() {
    super({
      base_url: 'https://develop.icm.intershop.de/INTERSHOP/rest/WFS/inSPIRED-inTRONICS_Business-Site/-;loc=en_US;cur=USD',
      default_headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
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
   */
  formatPrice(priceObj) {
    if (!priceObj) return null;

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
}

export default IntershopIcmClient;
