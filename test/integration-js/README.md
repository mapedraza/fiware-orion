# FIWARE Orion Context Broker - Integration Tests

This directory contains comprehensive JavaScript integration tests for the FIWARE Orion Context Broker API, generated based on the OpenAPI specification.

## Overview

These tests validate that a running Orion Context Broker instance behaves exactly as documented in the OpenAPI specification. The tests use Jest as the testing framework and Supertest for HTTP API testing.

## Features

- **OpenAPI Compliance Validation**: All responses are validated against the OpenAPI specification
- **Comprehensive Coverage**: Tests cover all major API endpoints including:
  - API Entry Points (`/v2`, `/version`, `/statistics`)
  - Entity Operations (CRUD operations on entities)
  - Subscription Management (create, read, update, delete subscriptions)
  - Type Information (entity type discovery and details)
  - Batch Operations (bulk entity operations and queries)
- **Automatic Cleanup**: Tests automatically clean up created entities and subscriptions
- **Configurable Target**: Can test against any Orion instance via environment variables

## Prerequisites

1. **Node.js**: Version 14 or higher
2. **Running Orion Instance**: A FIWARE Orion Context Broker instance must be running and accessible

## Installation

```bash
cd test/integration-js
npm install
```

## Configuration

Configure the target Orion instance using environment variables:

```bash
# Target Orion URL (default: http://localhost:1026)
export ORION_BASE_URL="http://your-orion-instance:1026"

# Test timeout in milliseconds (default: 10000)
export ORION_TIMEOUT=15000
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Verbose Output
```bash
npm run test:verbose
```

### Run Tests in Watch Mode (for development)
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test Suites
```bash
# Run only entity tests
npx jest entities.test.js

# Run only subscription tests
npx jest subscriptions.test.js

# Run only API entry point tests
npx jest api-entry-points.test.js
```

## Test Structure

```
test/integration-js/
├── package.json              # Dependencies and test configuration
├── setup.js                  # Global test setup and OpenAPI validation
├── utils/
│   └── test-utils.js         # Test utilities and helper functions
└── __tests__/
    ├── api-entry-points.test.js    # Tests for /v2, /version, /statistics endpoints
    ├── entities.test.js            # Entity CRUD operations
    ├── subscriptions.test.js       # Subscription management
    ├── types.test.js              # Entity type information
    └── batch-operations.test.js    # Batch update and query operations
```

## Test Coverage

### API Entry Points
- `GET /v2` - Retrieve API entry points
- `GET /version` - Get version information
- `GET /statistics` - Get statistics
- `GET /cache/statistics` - Get cache statistics

### Entity Operations
- `POST /v2/entities` - Create entities
- `GET /v2/entities` - List entities with various filters
- `GET /v2/entities/{entityId}` - Retrieve specific entity
- `PATCH /v2/entities/{entityId}/attrs` - Update entity attributes
- `DELETE /v2/entities/{entityId}` - Delete entity

### Subscription Operations
- `POST /v2/subscriptions` - Create subscriptions
- `GET /v2/subscriptions` - List subscriptions
- `GET /v2/subscriptions/{subscriptionId}` - Retrieve specific subscription
- `PATCH /v2/subscriptions/{subscriptionId}` - Update subscription
- `DELETE /v2/subscriptions/{subscriptionId}` - Delete subscription

### Type Operations
- `GET /v2/types` - List entity types
- `GET /v2/types/{entityType}` - Get specific type information

### Batch Operations
- `POST /v2/op/update` - Batch entity updates (create/update/delete)
- `POST /v2/op/query` - Batch entity queries

## Error Handling

The tests validate various error conditions:
- Invalid JSON payloads (400 Bad Request)
- Missing required fields (400 Bad Request)
- Non-existent resources (404 Not Found)
- Duplicate entities (422 Unprocessable Entity)

## OpenAPI Validation

All test responses are automatically validated against the OpenAPI specification using the `jest-openapi` library. This ensures that:
- Response schemas match the specification
- Status codes are correct
- Content types are appropriate
- All required fields are present

## Example Usage

```javascript
// Example of running a single test
const request = require('supertest');
const OrionTestUtils = require('../utils/test-utils');

describe('Custom Test', () => {
  const utils = new OrionTestUtils();
  
  test('should create and retrieve entity', async () => {
    const entityId = utils.generateEntityId('MyRoom');
    
    // Create entity
    await request(utils.app)
      .post('/v2/entities')
      .send({
        id: entityId,
        type: 'Room',
        temperature: { value: 21.7 }
      })
      .expect(201);
    
    // Retrieve entity
    const response = await request(utils.app)
      .get(`/v2/entities/${entityId}`)
      .expect(200);
    
    expect(response.body.temperature.value).toBe(21.7);
    
    // Cleanup
    await utils.deleteTestEntity(entityId);
  });
});
```

## Continuous Integration

These tests can be integrated into CI/CD pipelines to validate Orion deployments:

```yaml
# Example GitHub Actions workflow
- name: Run Integration Tests
  env:
    ORION_BASE_URL: http://orion:1026
  run: |
    cd test/integration-js
    npm install
    npm test
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure Orion is running and accessible at the configured URL
2. **Timeout Errors**: Increase `ORION_TIMEOUT` for slower instances
3. **Test Failures**: Check Orion logs for any errors during test execution

### Debug Mode

Run tests with debug output:
```bash
DEBUG=* npm test
```

### Manual Verification

Verify your Orion instance is working:
```bash
curl http://localhost:1026/v2
```

Should return:
```json
{
  "entities_url": "/v2/entities",
  "types_url": "/v2/types",
  "subscriptions_url": "/v2/subscriptions",
  "registrations_url": "/v2/registrations"
}
```

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use the `OrionTestUtils` class for common operations
3. Always clean up created resources in `afterEach` hooks
4. Validate OpenAPI compliance with `expect(response).toSatisfyApiSpec()`
5. Test both success and error scenarios

## License

These tests are part of the FIWARE Orion Context Broker project and are licensed under AGPL-3.0.