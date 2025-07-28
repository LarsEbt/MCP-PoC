/**
 * Test verschiedener Preis-API Ansätze
 */

import { IntershopIcmClient } from './intershop-client.js';
import { makeHttpRequest } from './utils.js';

async function testPriceApproaches() {
  const client = new IntershopIcmClient();
  const baseUrl = 'https://develop.icm.intershop.de/INTERSHOP/rest/WFS/inSPIRED-inTRONICS_Business-Site/-;loc=en_US;cur=USD';
  
  console.log('🧪 Teste verschiedene Preis-API Ansätze...\n');
  
  // Test 1: Direkt URL wie in der Browser-Anfrage
  console.log('📋 Test 1: Direkte URL');
  const directUrl = `${baseUrl}/productprices?sku=1727541&sku=4818001&sku=7911525`;
  console.log('URL:', directUrl);
  
  try {
    const response = await makeHttpRequest(directUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const result = await response.json();
    console.log('✅ Direkte URL erfolgreich:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Direkte URL fehlgeschlagen:', error.message);
  }
  
  // Test 2: Ohne User-Agent
  console.log('\n📋 Test 2: Ohne User-Agent');
  try {
    const response = await makeHttpRequest(directUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    const result = await response.json();
    console.log('✅ Ohne User-Agent erfolgreich:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Ohne User-Agent fehlgeschlagen:', error.message);
  }
  
  // Test 3: Mit anderen Headers
  console.log('\n📋 Test 3: Mit erweiterten Headers');
  try {
    const response = await makeHttpRequest(directUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    const result = await response.json();
    console.log('✅ Erweiterte Headers erfolgreich:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Erweiterte Headers fehlgeschlagen:', error.message);
  }
  
  // Test 4: Einzelne SKU
  console.log('\n📋 Test 4: Einzelne SKU');
  const singleSkuUrl = `${baseUrl}/productprices?sku=7911525`;
  console.log('URL:', singleSkuUrl);
  
  try {
    const response = await makeHttpRequest(singleSkuUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    const result = await response.json();
    console.log('✅ Einzelne SKU erfolgreich:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Einzelne SKU fehlgeschlagen:', error.message);
  }
}

// Test ausführen
testPriceApproaches().catch(console.error);
