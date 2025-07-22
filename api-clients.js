/**
 * Beispiele für Custom API Integrationen
 * Diese Datei zeigt, wie du deine eigenen APIs integrieren kannst
 */

import { loadConfig, makeHttpRequest, interpolateUrl, appendQueryParams } from './utils.js';

/**
 * Beispiel: REST API Client
 */
export class CustomApiClient {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.base_url;
    this.defaultHeaders = config.default_headers || {};
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
}

/**
 * Beispiel: Weather API Integration
 */
export class WeatherApiClient extends CustomApiClient {
  constructor(apiKey) {
    super({
      base_url: 'https://api.openweathermap.org/data/2.5',
      default_headers: {},
    });
    this.apiKey = apiKey;
  }

  async getCurrentWeather(city) {
    return await this.get('/weather', {
      q: city,
      appid: this.apiKey,
      units: 'metric',
      lang: 'de',
    });
  }

  async getForecast(city, days = 5) {
    return await this.get('/forecast', {
      q: city,
      appid: this.apiKey,
      cnt: days * 8, // 8 Vorhersagen pro Tag (alle 3 Stunden)
      units: 'metric',
      lang: 'de',
    });
  }
}

/**
 * Beispiel: JSONPlaceholder API Integration (für Tests)
 */
export class JsonPlaceholderClient extends CustomApiClient {
  constructor() {
    super({
      base_url: 'https://jsonplaceholder.typicode.com',
    });
  }

  async getAllPosts() {
    return await this.get('/posts');
  }

  async getPost(id) {
    return await this.get('/posts/{id}', {}, { id });
  }

  async createPost(title, body, userId) {
    return await this.post('/posts', {
      title,
      body,
      userId,
    });
  }

  async updatePost(id, title, body, userId) {
    return await this.put('/posts/{id}', {
      id,
      title,
      body,
      userId,
    }, { id });
  }

  async deletePost(id) {
    return await this.delete('/posts/{id}', { id });
  }

  async getComments(postId) {
    return await this.get('/posts/{postId}/comments', {}, { postId });
  }

  async getUsers() {
    return await this.get('/users');
  }

  async getUser(id) {
    return await this.get('/users/{id}', {}, { id });
  }
}

/**
 * Beispiel: GraphQL API Client
 */
export class GraphQLApiClient {
  constructor(endpoint, headers = {}) {
    this.endpoint = endpoint;
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    };
  }

  async query(query, variables = {}) {
    const response = await makeHttpRequest(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }
    
    return result.data;
  }

  async mutation(mutation, variables = {}) {
    return await this.query(mutation, variables);
  }
}

/**
 * Beispiel: Datenbank-Client (SQLite)
 */
export class DatabaseClient {
  constructor(dbPath) {
    // Hier würdest du eine echte DB-Bibliothek wie sqlite3 verwenden
    this.dbPath = dbPath;
  }

  async query(sql, params = []) {
    // Simulierte Datenbankabfrage - ersetze mit echter Implementierung
    console.log(`Executing query: ${sql}`, params);
    
    // Beispiel-Rückgabe
    return {
      sql,
      params,
      rows: [
        { id: 1, name: 'Beispiel', created_at: new Date().toISOString() },
      ],
      rowCount: 1,
    };
  }

  async insert(table, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    return await this.query(sql, values);
  }

  async update(table, data, condition, conditionParams = []) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), ...conditionParams];
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${condition}`;
    return await this.query(sql, values);
  }

  async delete(table, condition, params = []) {
    const sql = `DELETE FROM ${table} WHERE ${condition}`;
    return await this.query(sql, params);
  }
}

/**
 * Factory-Funktion zur Erstellung von API-Clients basierend auf Konfiguration
 */
export async function createApiClients() {
  const config = await loadConfig();
  const clients = {};
  
  if (config?.apis) {
    for (const [name, apiConfig] of Object.entries(config.apis)) {
      clients[name] = new CustomApiClient(apiConfig);
    }
  }
  
  return clients;
}

export default {
  CustomApiClient,
  WeatherApiClient,
  JsonPlaceholderClient,
  GraphQLApiClient,
  DatabaseClient,
  createApiClients,
};
