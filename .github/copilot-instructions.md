<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Custom MCP Server Development Instructions

You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt

## Project Overview
This is a custom Model Context Protocol (MCP) server built in JavaScript/Node.js. The server provides tools for:
- Custom API integration and calls
- Database querying
- Data processing and transformation

## Code Style Guidelines
- Use ES6+ modern JavaScript features
- Implement proper error handling with try-catch blocks
- Use Zod for input validation and schema definition
- Follow async/await patterns for asynchronous operations
- Include detailed JSDoc comments for functions
- Use meaningful variable and function names

## MCP Server Best Practices
- Always validate tool inputs using Zod schemas
- Return structured responses with proper content types
- Handle errors gracefully with informative error messages
- Use the proper MCP SDK types and schemas
- Implement proper logging for debugging and monitoring

## API Integration Guidelines
- Implement rate limiting for external API calls
- Use retry logic with exponential backoff
- Validate API responses before processing
- Support different authentication methods (API keys, OAuth, etc.)
- Cache responses when appropriate

## Database Operations
- Use parameterized queries to prevent SQL injection
- Implement connection pooling for better performance
- Handle database errors and connection timeouts
- Support multiple database types through configuration

## Configuration Management
- Store sensitive data in environment variables
- Use config.json for non-sensitive configuration
- Validate configuration on startup
- Support different environments (dev, prod, etc.)
