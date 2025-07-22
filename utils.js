/**
 * Utility-Funktionen für API-Aufrufe und Datenverarbeitung
 */

import fs from 'fs/promises';
import path from 'path';

// Konfiguration laden
export async function loadConfig() {
  try {
    const configPath = path.join(process.cwd(), 'config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Fehler beim Laden der Konfiguration:', error.message);
    return null;
  }
}

// Rate Limiting implementieren
class RateLimiter {
  constructor(requestsPerMinute = 60) {
    this.requestsPerMinute = requestsPerMinute;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Alte Requests entfernen
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    
    if (this.requests.length < this.requestsPerMinute) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }
}

const rateLimiter = new RateLimiter();

// HTTP-Request mit Retry-Logik
export async function makeHttpRequest(url, options = {}, maxRetries = 3) {
  if (!rateLimiter.canMakeRequest()) {
    throw new Error('Rate limit erreicht. Bitte warte einen Moment.');
  }

  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        timeout: options.timeout || 30000,
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Request failed after ${maxRetries} attempts: ${lastError.message}`);
}

// URL-Parameter interpolieren
export function interpolateUrl(url, params = {}) {
  let interpolatedUrl = url;
  
  for (const [key, value] of Object.entries(params)) {
    interpolatedUrl = interpolatedUrl.replace(`{${key}}`, encodeURIComponent(value));
  }
  
  return interpolatedUrl;
}

// Query-Parameter anhängen
export function appendQueryParams(url, params = {}) {
  const urlObj = new URL(url);
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      urlObj.searchParams.append(key, value.toString());
    }
  }
  
  return urlObj.toString();
}

// Daten validieren
export function validateData(data, schema = {}) {
  const errors = [];
  
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data) || data[field] === undefined || data[field] === null) {
        errors.push(`Pflichtfeld fehlt: ${field}`);
      }
    }
  }
  
  if (schema.types) {
    for (const [field, expectedType] of Object.entries(schema.types)) {
      if (field in data && typeof data[field] !== expectedType) {
        errors.push(`Falscher Datentyp für ${field}: erwartet ${expectedType}, erhalten ${typeof data[field]}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Log-Funktion
export function logRequest(method, url, status, duration) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${method} ${url} - Status: ${status} - Duration: ${duration}ms`);
}

// Sichere JSON-Parsing
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('JSON Parse Error:', error.message);
    return fallback;
  }
}

// Daten transformieren
export function transformData(data, transformations = []) {
  let result = data;
  
  for (const transformation of transformations) {
    switch (transformation.type) {
      case 'map':
        if (Array.isArray(result)) {
          result = result.map(transformation.fn);
        }
        break;
        
      case 'filter':
        if (Array.isArray(result)) {
          result = result.filter(transformation.fn);
        }
        break;
        
      case 'reduce':
        if (Array.isArray(result)) {
          result = result.reduce(transformation.fn, transformation.initial);
        }
        break;
        
      case 'sort':
        if (Array.isArray(result)) {
          result = result.sort(transformation.fn);
        }
        break;
        
      default:
        console.warn(`Unbekannte Transformation: ${transformation.type}`);
    }
  }
  
  return result;
}

export default {
  loadConfig,
  makeHttpRequest,
  interpolateUrl,
  appendQueryParams,
  validateData,
  logRequest,
  safeJsonParse,
  transformData,
};
