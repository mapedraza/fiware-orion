# FIWARE Orion OpenAPI Specification

## Overview

This directory contains the OpenAPI 3.0 specification for the FIWARE Orion Context Broker API, generated based on:

1. **Source Code Analysis**: Complete review of REST service definitions in `src/app/contextBroker/orionRestServices.cpp`
2. **API Documentation**: Comprehensive analysis of `doc/manuals/orion-api.md`
3. **Functional Tests**: Examination of test cases in `test/functionalTest/cases/` to understand real API usage patterns

## Generated Files

- **`openapi.yaml`** - OpenAPI specification in YAML format (1,751 lines)
- **`openapi.json`** - OpenAPI specification in JSON format (2,679 lines, 71KB)

Both files are valid OpenAPI 3.0.3 specifications and have been validated using the official OpenAPI validator.

## API Coverage

The specification covers all major FIWARE Orion Context Broker API endpoints:

### Core Entity Operations (14 endpoints)
- `GET /v2` - API entry points
- `GET /v2/entities` - List entities with comprehensive query parameters
- `POST /v2/entities` - Create entity
- `GET /v2/entities/{entityId}` - Retrieve entity
- `DELETE /v2/entities/{entityId}` - Delete entity
- `GET /v2/entities/{entityId}/attrs` - Get entity attributes
- `POST /v2/entities/{entityId}/attrs` - Add/update entity attributes
- `PATCH /v2/entities/{entityId}/attrs` - Update existing entity attributes
- `PUT /v2/entities/{entityId}/attrs` - Replace all entity attributes
- `GET /v2/entities/{entityId}/attrs/{attrName}` - Get specific attribute
- `PUT /v2/entities/{entityId}/attrs/{attrName}` - Update specific attribute
- `DELETE /v2/entities/{entityId}/attrs/{attrName}` - Delete specific attribute
- `GET /v2/entities/{entityId}/attrs/{attrName}/value` - Get attribute value
- `PUT /v2/entities/{entityId}/attrs/{attrName}/value` - Update attribute value

### Entity Types (2 endpoints)
- `GET /v2/types` - List entity types
- `GET /v2/types/{type}` - Get entity type information

### Subscriptions (5 endpoints)
- `GET /v2/subscriptions` - List subscriptions
- `POST /v2/subscriptions` - Create subscription
- `GET /v2/subscriptions/{subscriptionId}` - Get subscription
- `PATCH /v2/subscriptions/{subscriptionId}` - Update subscription
- `DELETE /v2/subscriptions/{subscriptionId}` - Delete subscription

### Registrations (4 endpoints)
- `GET /v2/registrations` - List registrations
- `POST /v2/registrations` - Create registration
- `GET /v2/registrations/{registrationId}` - Get registration
- `DELETE /v2/registrations/{registrationId}` - Delete registration

### Batch Operations (3 endpoints)
- `POST /v2/op/query` - Batch query
- `POST /v2/op/update` - Batch update
- `POST /v2/op/notify` - Notify context

### Management Operations (2 endpoints)
- `GET /version` - Get version information
- `GET /statistics` - Get statistics
- `DELETE /statistics` - Reset statistics

## Key Features Documented

### Query Parameters
The specification includes comprehensive query parameter documentation, especially for entity listing operations:
- **Filtering**: `id`, `type`, `idPattern`, `typePattern`
- **Query Language**: `q` (simple query language), `mq` (metadata query)
- **Geographical Queries**: `georel`, `geometry`, `coords`
- **Pagination**: `limit`, `offset`
- **Attribute Selection**: `attrs`, `metadata`
- **Ordering**: `orderBy`
- **Options**: `count`, `keyValues`, `values`, `unique`, `skipForwarding`

### Headers
- **Multi-tenancy**: `Fiware-Service` header support
- **Service Path**: `Fiware-ServicePath` header support
- **Correlation**: `Fiware-Correlator` header for request tracing

### Request/Response Schemas
- **Entity**: Complete entity representation with attributes and metadata
- **Attribute**: Attribute structure with type, value, and metadata
- **Subscription**: Full subscription model with subject, condition, and notification
- **Registration**: Registration model with data provider information
- **Batch Operations**: Batch query and update request/response schemas
- **Error Handling**: Comprehensive error response schemas

### Content Types
- **JSON**: Primary content type (`application/json`)
- **Text**: Plain text support for attribute values (`text/plain`)

## Consistency Validation

The OpenAPI specification has been validated against:

1. **Source Code**: All REST service endpoints from `orionRestServices.cpp` are included
2. **Documentation**: Parameter descriptions and examples match `orion-api.md`
3. **Test Cases**: Request/response examples derived from functional tests
4. **OpenAPI Standard**: Validated using official OpenAPI 3.0.3 validator

## Usage

These OpenAPI specifications can be used for:

1. **API Documentation**: Generate interactive documentation using tools like Swagger UI
2. **Code Generation**: Generate client SDKs in various programming languages
3. **API Testing**: Use with tools like Postman, Insomnia, or automated testing frameworks
4. **API Validation**: Validate API requests and responses against the specification
5. **Mock Servers**: Create mock API servers for development and testing

## Integration Examples

### Swagger UI
```bash
# Serve with Swagger UI
docker run -p 8080:8080 -v $(pwd):/usr/share/nginx/html/specs swaggerapi/swagger-ui
# Open http://localhost:8080/?url=specs/openapi.yaml
```

### OpenAPI Generator
```bash
# Generate Python client
openapi-generator generate -i openapi.yaml -g python -o ./python-client

# Generate JavaScript client
openapi-generator generate -i openapi.yaml -g javascript -o ./js-client
```

## Version Information

- **OpenAPI Version**: 3.0.3
- **API Version**: 4.1.0 (matches FIWARE Orion version)
- **Generated**: Based on FIWARE Orion source code analysis
- **Last Updated**: December 2024

## Additional Resources

- [FIWARE Orion Documentation](https://fiware-orion.readthedocs.io/)
- [FIWARE Orion GitHub Repository](https://github.com/telefonicaid/fiware-orion)
- [NGSI v2 Specification](http://telefonicaid.github.io/fiware-orion/api/v2/stable/)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3)