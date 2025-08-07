const jestOpenAPI = require('jest-openapi').default;
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '../../openapi.yaml');
const openApiSpec = YAML.parse(fs.readFileSync(openApiPath, 'utf8'));

// Initialize jest-openapi
jestOpenAPI(openApiSpec);

// Global test configuration
global.ORION_BASE_URL = process.env.ORION_BASE_URL || 'http://localhost:1026';
global.ORION_TIMEOUT = parseInt(process.env.ORION_TIMEOUT) || 10000;

// Set Jest timeout
jest.setTimeout(global.ORION_TIMEOUT);

console.log(`Testing Orion Context Broker at: ${global.ORION_BASE_URL}`);