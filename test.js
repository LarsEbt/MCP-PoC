/**
 * Test-Script für den Custom MCP Server
 * Führe dieses Script aus, um die Funktionalität zu testen
 */

import { CustomApiClient, JsonPlaceholderClient, WeatherApiClient } from './api-clients.js';
import { loadConfig, validateData } from './utils.js';

async function testApiClients() {
  console.log('🧪 Teste API Clients...\n');

  // Test JSONPlaceholder API
  console.log('📝 Teste JSONPlaceholder API:');
  const jsonClient = new JsonPlaceholderClient();
  
  try {
    const posts = await jsonClient.getAllPosts();
    console.log(`✅ ${posts.length} Posts abgerufen`);
    
    const post = await jsonClient.getPost(1);
    console.log(`✅ Post #1: "${post.title}"`);
    
    const newPost = await jsonClient.createPost(
      'Test Post',
      'Das ist ein Test Post vom MCP Server',
      1
    );
    console.log(`✅ Neuer Post erstellt: ID ${newPost.id}`);
  } catch (error) {
    console.error('❌ JSONPlaceholder API Fehler:', error.message);
  }

  console.log('');

  // Test Custom API Client
  console.log('🔧 Teste Custom API Client:');
  const customClient = new CustomApiClient({
    base_url: 'https://httpbin.org',
  });

  try {
    const response = await customClient.get('/json');
    console.log('✅ GET Request erfolgreich:', Object.keys(response).join(', '));
    
    const postResponse = await customClient.post('/post', {
      message: 'Hello from MCP Server',
      timestamp: new Date().toISOString(),
    });
    console.log('✅ POST Request erfolgreich');
  } catch (error) {
    console.error('❌ Custom API Client Fehler:', error.message);
  }

  console.log('');
}

async function testDataValidation() {
  console.log('✅ Teste Datenvalidierung...\n');

  const testData = {
    name: 'Test User',
    email: 'test@example.com',
    age: 25,
  };

  const schema = {
    required: ['name', 'email'],
    types: {
      name: 'string',
      email: 'string',
      age: 'number',
    },
  };

  const validationResult = validateData(testData, schema);
  
  if (validationResult.valid) {
    console.log('✅ Datenvalidierung erfolgreich');
  } else {
    console.log('❌ Datenvalidierung fehlgeschlagen:', validationResult.errors);
  }

  console.log('');
}

async function testConfiguration() {
  console.log('⚙️ Teste Konfiguration...\n');

  try {
    const config = await loadConfig();
    
    if (config) {
      console.log('✅ Konfiguration geladen');
      console.log('📋 Verfügbare APIs:', Object.keys(config.apis || {}).join(', '));
      console.log('🗄️ Datenbank Type:', config.database?.type || 'nicht konfiguriert');
      console.log('⚡ Rate Limit:', config.settings?.rate_limit?.requests_per_minute || 'nicht gesetzt');
    } else {
      console.log('❌ Konfiguration konnte nicht geladen werden');
    }
  } catch (error) {
    console.error('❌ Konfigurationsfehler:', error.message);
  }

  console.log('');
}

async function simulateMcpToolCall() {
  console.log('🔧 Simuliere MCP Tool Aufrufe...\n');

  // Simuliere call_custom_api Tool
  console.log('📞 Teste call_custom_api:');
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    console.log(`✅ API Aufruf erfolgreich: "${data.title}"`);
  } catch (error) {
    console.error('❌ API Aufruf fehlgeschlagen:', error.message);
  }

  // Simuliere process_data Tool
  console.log('🔄 Teste process_data:');
  const testData = [
    { name: 'Alice', age: 30, active: true },
    { name: 'Bob', age: 25, active: false },
    { name: 'Charlie', age: 35, active: true },
  ];

  // Filter aktive Benutzer
  const activeUsers = testData.filter(user => user.active);
  console.log(`✅ ${activeUsers.length} aktive Benutzer gefiltert`);

  // Transform Daten
  const transformedUsers = activeUsers.map(user => ({
    ...user,
    processed: true,
    timestamp: new Date().toISOString(),
  }));
  console.log('✅ Daten transformiert');

  console.log('');
}

async function runTests() {
  console.log('🚀 Starte Custom MCP Server Tests\n');
  console.log('='.repeat(50));
  console.log('');

  await testConfiguration();
  await testDataValidation();
  await testApiClients();
  await simulateMcpToolCall();

  console.log('='.repeat(50));
  console.log('✨ Alle Tests abgeschlossen!\n');
  console.log('💡 Tipps:');
  console.log('- Bearbeite config.json für deine eigenen APIs');
  console.log('- Füge API-Keys in .env ein');
  console.log('- Starte den Server mit: npm start');
  console.log('- Füge eigene Tools in index.js hinzu');
}

// Tests ausführen, wenn das Script direkt aufgerufen wird
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    console.error('❌ Test-Fehler:', error);
    process.exit(1);
  });
}

export { runTests };
