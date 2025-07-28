/**
 * Finale Test-Demonstration der Preis-Integration
 */

import { IntershopIcmClient } from './intershop-client.js';

async function demonstratePrice() {
  const client = new IntershopIcmClient();
  
  console.log('🛍️ Intershop E-Commerce Integration - Preis-Demo\n');
  
  // HP Compaq LA2006x Suche (wie im Original)
  console.log('🔍 Suche nach "HP Compaq LA2006x"...\n');
  
  try {
    const searchResult = await client.searchProducts('HP Compaq LA2006x', { limit: 6 });
    
    if (searchResult.elements && searchResult.elements.length > 0) {
      console.log(`📊 Ergebnisse: ${searchResult.elements.length} Produkte gefunden`);
      console.log('🔍 Suche: "HP Compaq LA2006x"');
      console.log('📂 Kategorie: Alle\n');
      
      // Preise hinzufügen
      const productsWithPrices = await client.enrichProductsWithPrices(searchResult.elements);
      
      console.log('🔝 Top 5 Produkte:\n');
      
      productsWithPrices.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. 📦 ${product.name || 'Unbekanntes Produkt'}`);
        console.log(`   SKU: ${product.sku}`);
        
        if (product.priceInfo) {
          const salePrice = product.priceInfo.salePrice;
          const listPrice = product.priceInfo.listPrice;
          
          if (salePrice) {
            console.log(`   💰 Verkaufspreis: ${salePrice.formatted} (Netto: ${salePrice.currency} ${salePrice.net.toFixed(2)})`);
          }
          if (listPrice && listPrice.gross !== salePrice?.gross) {
            console.log(`   💵 Listenpreis: ${listPrice.formatted} (Netto: ${listPrice.currency} ${listPrice.net.toFixed(2)})`);
          }
        } else {
          console.log('   💰 Preis: Nicht verfügbar');
        }
        
        console.log(`   📝 ${product.description || 'Keine Beschreibung'}\n`);
      });
      
      // Zusammenfassung als JSON (wie im Original gewünscht)
      const summary = productsWithPrices.slice(0, 5).map(product => ({
        name: product.name,
        sku: product.sku,
        price: product.priceInfo ? {
          salePrice: product.priceInfo.salePrice?.formatted || null,
          listPrice: product.priceInfo.listPrice?.formatted || null,
          currency: product.priceInfo.salePrice?.currency || null
        } : null,
        description: product.description
      }));
      
      console.log('📋 JSON Zusammenfassung:');
      console.log(JSON.stringify(summary, null, 2));
      
    } else {
      console.log('❌ Keine Produkte gefunden');
    }
    
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  }
}

// Demo ausführen
demonstratePrice().catch(console.error);
