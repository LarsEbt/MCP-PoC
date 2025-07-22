# 🔑 API Key Setup Guide

## Schritt-für-Schritt Anleitungen für beliebte APIs

### 1. OpenWeather API ☀️
**Für Wetterdaten**

1. Gehe zu https://openweathermap.org/
2. Klicke auf "Sign Up" (kostenlos)
3. Bestätige deine E-Mail
4. Gehe zu https://home.openweathermap.org/api_keys
5. Kopiere deinen API Key
6. Füge in `.env` ein: `WEATHER_API_KEY=dein_key_hier`

**Beispiel API-Aufruf:**
```javascript
// Automatisch mit API Key:
"endpoint": "https://api.openweathermap.org/data/2.5/weather?q=Berlin"
```

### 2. RapidAPI 🚀
**Zugang zu tausenden APIs**

1. Gehe zu https://rapidapi.com/
2. Registriere dich kostenlos
3. Gehe zu https://rapidapi.com/developer/dashboard
4. Kopiere deinen "X-RapidAPI-Key"
5. Füge in `.env` ein: `RAPIDAPI_KEY=dein_key_hier`

**Beispiel APIs:**
- COVID-19 Data: https://rapidapi.com/api-sports/api/covid-193/
- Currency Exchange: https://rapidapi.com/fyhao/api/currency-exchange/
- QR Code Generator: https://rapidapi.com/LogoAPI/api/qr-generator4/

### 3. NewsAPI 📰
**Aktuelle Nachrichten**

1. Gehe zu https://newsapi.org/
2. Klicke "Get API Key"
3. Registriere dich kostenlos
4. Kopiere deinen API Key
5. Füge in `.env` ein: `NEWS_API_KEY=dein_key_hier`

**Beispiel API-Aufruf:**
```javascript
// Automatisch mit API Key:
"endpoint": "https://newsapi.org/v2/top-headlines?country=de"
```

### 4. GitHub API 🐙
**Repository und User Daten**

1. Gehe zu https://github.com/settings/tokens
2. Klicke "Generate new token (classic)"
3. Wähle Scopes (z.B. "repo", "user")
4. Kopiere den Token
5. Füge in `.env` ein: `GITHUB_TOKEN=dein_token_hier`

**Beispiel API-Aufruf:**
```javascript
{
  "endpoint": "https://api.github.com/user/repos",
  "headers": {
    "Authorization": "token YOUR_GITHUB_TOKEN"
  }
}
```

### 5. JSONPlaceholder 🧪
**Für Tests (KEIN API Key nötig!)**

Direkt verwenden:
```javascript
{
  "endpoint": "https://jsonplaceholder.typicode.com/posts",
  "method": "GET"
}
```

## 🛠️ Eigene APIs hinzufügen

### REST API mit API Key im Header:
```json
{
  "apis": {
    "meine_api": {
      "base_url": "https://api.example.com",
      "endpoints": {
        "get_data": {
          "path": "/data",
          "method": "GET",
          "headers": {
            "Authorization": "Bearer {{API_KEY}}",
            "X-Custom-Header": "value"
          }
        }
      }
    }
  }
}
```

### API mit Query Parameters:
```json
{
  "apis": {
    "search_api": {
      "base_url": "https://api.search.com",
      "endpoints": {
        "search": {
          "path": "/search",
          "method": "GET",
          "required_params": ["q", "api_key"]
        }
      }
    }
  }
}
```

## 🔒 Sicherheit Best Practices

1. **Niemals API Keys in Code committen!**
2. **Verwende .env für lokale Entwicklung**
3. **Für Production: Environment Variables setzen**
4. **Regelmäßig API Keys rotieren**
5. **Minimal nötige Permissions vergeben**

## 💰 Kostenlose Tier Limits (Stand 2025)

| Service | Kostenlos | Limit |
|---------|-----------|-------|
| OpenWeather | ✅ | 1.000/Tag |
| NewsAPI | ✅ | 1.000/Tag |
| GitHub | ✅ | 5.000/Stunde |
| RapidAPI | ✅ | Variiert je API |
| JSONPlaceholder | ✅ | Unlimited |

## 🧪 APIs testen

```bash
# Teste deine APIs:
npm test

# Oder manuel einen API-Aufruf:
node -e "
const response = await fetch('https://api.github.com/zen');
console.log(await response.text());
"
```
