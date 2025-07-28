/**
 * Test-Script für die Preis-API
 */

import { IntershopIcmClient } from './intershop-client.js';

async function testPrices() {
  const client = new IntershopIcmClient();
  
  console.log('🧪 Teste Intershop Preis-API...\n');
  
  // Test 1: Bekannte SKUs testen
  const testSkus = ['1727541', '4818001', '7911525'];
  console.log('📋 Test 1: Bekannte SKUs');
  console.log('SKUs:', testSkus);
  
  try {
    const priceResult = await client.testPriceApi(testSkus);
    console.log('\n✅ Preis-API Test erfolgreich\n');
  } catch (error) {
    console.log('\n❌ Preis-API Test fehlgeschlagen\n');
  }
  
  // Test 2: Produktsuche mit Preisen
  console.log('📋 Test 2: Produktsuche mit Preisen');
  try {
    const searchResult = await client.searchProducts('HP', { limit: 3 });
    console.log('🔍 Gefundene Produkte:', searchResult.elements?.length || 0);
    console.log('🔍 Vollständige API-Antwort:', JSON.stringify(searchResult, null, 2));
    
    if (searchResult.elements && searchResult.elements.length > 0) {
      console.log('📦 Erste 3 Produkte:');
      searchResult.elements.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. SKU: ${product.sku || 'undefined'} - Name: ${product.name || 'undefined'}`);
        console.log(`      Vollständiges Produkt:`, JSON.stringify(product, null, 4));
      });
      
      console.log('\n💰 Teste Preisanreicherung...');
      const enrichedProducts = await client.enrichProductsWithPrices(searchResult.elements.slice(0, 3));
      
      console.log('\n📊 Ergebnis:');
      enrichedProducts.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.sku}:`);
        console.log(`     Preis: ${product.priceInfo ? 'gefunden' : 'nicht gefunden'}`);
        if (product._debug) {
          console.log(`     Debug: ${JSON.stringify(product._debug, null, 6)}`);
        }
      });
    }
  } catch (error) {
    console.error('❌ Produktsuche-Test fehlgeschlagen:', error.message);
  }
}

// Test ausführen
testPrices().catch(console.error);
