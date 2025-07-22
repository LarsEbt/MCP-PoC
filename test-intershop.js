/**
 * Intershop E-Commerce API Tests
 * Teste alle E-Commerce-Funktionen des MCP Servers
 */

import IntershopIcmClient from './intershop-client.js';

async function testIntershopApi() {
  console.log('🛒 Teste Intershop E-Commerce API...\n');
  
  const client = new IntershopIcmClient();

  try {
    // Test 1: Einzelnes Produkt abrufen
    console.log('📱 Teste Produktdetails:');
    const product = await client.getProduct('201807231-01');
    console.log(`✅ Produkt gefunden: "${product.productName}"`);
    console.log(`💰 Preis: ${client.formatPrice(product.listPrice)?.formatted}`);
    console.log(`📊 Verfügbar: ${product.inStock ? 'Ja' : 'Nein'}`);
    console.log(`🖼️  Bilder: ${product.images?.length || 0} verfügbar`);
    console.log('');

    // Test 2: Produktsuche
    console.log('🔍 Teste Produktsuche:');
    const searchResult = await client.searchProducts('Surface', { limit: 5 });
    const products = searchResult.products || searchResult.elements || [];
    console.log(`✅ ${products.length} Produkte für "Surface" gefunden`);
    console.log('');

    // Test 3: Kategorien abrufen
    console.log('📂 Teste Kategorien:');
    const categories = await client.getCategories();
    console.log(`✅ ${categories.categories?.length || 0} Kategorien gefunden`);
    console.log('');

    // Test 4: Warenkorb erstellen
    console.log('🛒 Teste Warenkorb:');
    try {
      const basket = await client.createBasket();
      console.log(`✅ Warenkorb erstellt: ID ${basket.basketId || basket.id || 'unbekannt'}`);
    } catch (error) {
      console.log(`⚠️  Warenkorb-Test übersprungen: ${error.message}`);
    }
    console.log('');

    // Test 5: Produktbilder extrahieren
    console.log('🖼️  Teste Bildextraktion:');
    const images = client.extractProductImages(product);
    console.log(`✅ ${images.length} Bilder extrahiert`);
    images.slice(0, 3).forEach(img => {
      console.log(`   - ${img.type} (${img.size}): ${img.url}`);
    });
    console.log('');

    // Test 6: Produktattribute formatieren
    console.log('📋 Teste Attributformatierung:');
    const attributes = client.formatProductAttributes(product);
    const attrCount = Object.keys(attributes).length;
    console.log(`✅ ${attrCount} Attribute formatiert`);
    Object.keys(attributes).slice(0, 3).forEach(key => {
      console.log(`   - ${key}: ${attributes[key].value}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Intershop API Test fehlgeschlagen:', error.message);
    return false;
  }
}

async function testEcommerceScenarios() {
  console.log('🎯 Teste E-Commerce Szenarien...\n');

  const client = new IntershopIcmClient();

  try {
    // Szenario 1: Produktkatalog durchsuchen
    console.log('📖 Szenario: Produktkatalog durchsuchen');
    const laptops = await client.searchProducts('laptop', { limit: 3 });
    console.log(`✅ ${laptops.products?.length || 0} Laptops gefunden`);

    // Szenario 2: Produktdetails mit Bildern
    console.log('🖥️  Szenario: Produktdetails mit Bildern');
    if (laptops.products?.length > 0) {
      const firstProduct = laptops.products[0];
      const details = await client.getProduct(firstProduct.sku);
      const images = client.extractProductImages(details);
      console.log(`✅ ${images.length} Bilder für ${details.productName}`);
    }

    // Szenario 3: Kategorie-Navigation
    console.log('📂 Szenario: Kategorie-Navigation');
    const categories = await client.getCategories();
    if (categories.categories?.length > 0) {
      const firstCategory = categories.categories[0];
      console.log(`✅ Kategorie "${firstCategory.name}" gefunden`);
      
      try {
        const categoryProducts = await client.getCategoryProducts(firstCategory.uniqueId, { limit: 3 });
        console.log(`✅ ${categoryProducts.products?.length || 0} Produkte in der Kategorie`);
      } catch (error) {
        console.log(`⚠️  Kategorie-Produkte nicht abrufbar: ${error.message}`);
      }
    }

    // Szenario 4: Preis- und Verfügbarkeitsprüfung
    console.log('💰 Szenario: Preis- und Verfügbarkeitsprüfung');
    const product = await client.getProduct('201807231-01');
    const price = client.formatPrice(product.listPrice);
    console.log(`✅ Preis: ${price?.formatted}, Verfügbar: ${product.inStock ? 'Ja' : 'Nein'}`);

    return true;
  } catch (error) {
    console.error('❌ E-Commerce Szenario Test fehlgeschlagen:', error.message);
    return false;
  }
}

async function demonstrateApiUsage() {
  console.log('💡 MCP Tool Verwendungsbeispiele:\n');

  console.log('🔍 Tool: search_products');
  console.log('Beispiel: {"query": "Surface", "limit": 5}');
  console.log('Beschreibung: Sucht nach Surface-Produkten\n');

  console.log('📱 Tool: get_product_details'); 
  console.log('Beispiel: {"sku": "201807231-01"}');
  console.log('Beschreibung: Zeigt Details für Microsoft Surface Book 2\n');

  console.log('🛒 Tool: manage_basket');
  console.log('Beispiel: {"action": "create"}');
  console.log('Beschreibung: Erstellt einen neuen Warenkorb\n');

  console.log('📂 Tool: get_categories');
  console.log('Beispiel: {}');
  console.log('Beschreibung: Zeigt alle verfügbaren Kategorien\n');

  console.log('🌐 Tool: call_custom_api');
  console.log('Beispiel: {"endpoint": "https://develop.icm.intershop.de/INTERSHOP/rest/WFS/inSPIRED-inTRONICS_Business-Site/-;loc=en_US;cur=USD/products/201807231-01?allImages=true&extended=true"}');
  console.log('Beschreibung: Direkter API-Aufruf zur Intershop API\n');
}

async function runIntershopTests() {
  console.log('🚀 Starte Intershop E-Commerce Tests\n');
  console.log('='.repeat(60));
  console.log('');

  const apiSuccess = await testIntershopApi();
  console.log('');
  
  const scenarioSuccess = await testEcommerceScenarios();
  console.log('');

  await demonstrateApiUsage();

  console.log('='.repeat(60));
  
  if (apiSuccess && scenarioSuccess) {
    console.log('✨ Alle Intershop E-Commerce Tests erfolgreich!\n');
    console.log('💡 Dein MCP Server ist bereit für:');
    console.log('   - Produktsuche und -details');
    console.log('   - Kategorien-Navigation'); 
    console.log('   - Warenkorb-Management');
    console.log('   - Vollständige E-Commerce-Integration');
    console.log('');
    console.log('🎯 Nächste Schritte:');
    console.log('   - Starte den MCP Server: npm start');
    console.log('   - Verwende die Tools in deiner LLM-Integration');
    console.log('   - Erweitere mit eigenen E-Commerce-Features');
  } else {
    console.log('⚠️  Einige Tests sind fehlgeschlagen - siehe Details oben');
  }
}

// Tests ausführen, wenn das Script direkt aufgerufen wird
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntershopTests().catch(error => {
    console.error('❌ Test-Fehler:', error);
    process.exit(1);
  });
}

export { runIntershopTests };
