const request = require('supertest');
const OrionTestUtils = require('../utils/test-utils');

describe('API Entry Points', () => {
  const utils = new OrionTestUtils();

  describe('GET /v2', () => {
    test('should return API entry points', async () => {
      const response = await request(utils.app)
        .get('/v2')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // Validate response structure matches OpenAPI spec
      expect(response.body).toHaveProperty('entities_url');
      expect(response.body).toHaveProperty('types_url');
      expect(response.body).toHaveProperty('subscriptions_url');
      expect(response.body).toHaveProperty('registrations_url');

      // Validate URLs format
      expect(response.body.entities_url).toBe('/v2/entities');
      expect(response.body.types_url).toBe('/v2/types');
      expect(response.body.subscriptions_url).toBe('/v2/subscriptions');
      expect(response.body.registrations_url).toBe('/v2/registrations');

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });
  });

  describe('GET /version', () => {
    test('should return version information', async () => {
      const response = await request(utils.app)
        .get('/version')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // Validate response structure
      expect(response.body).toHaveProperty('orion');
      expect(response.body.orion).toHaveProperty('version');
      expect(response.body.orion).toHaveProperty('uptime');
      expect(response.body.orion).toHaveProperty('git_hash');
      expect(response.body.orion).toHaveProperty('compile_time');
      expect(response.body.orion).toHaveProperty('compiled_by');
      expect(response.body.orion).toHaveProperty('compiled_in');

      // Validate version format
      expect(response.body.orion.version).toMatch(/^\d+\.\d+\.\d+/);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });
  });

  describe('GET /statistics', () => {
    test('should return statistics information', async () => {
      const response = await request(utils.app)
        .get('/statistics')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // Validate response structure
      expect(response.body).toHaveProperty('counters');
      expect(response.body).toHaveProperty('semWait');
      expect(response.body).toHaveProperty('timing');
      expect(response.body).toHaveProperty('notifQueue');

      // Validate counters structure
      expect(response.body.counters).toHaveProperty('jsonRequests');
      expect(response.body.counters).toHaveProperty('noPayloadRequests');
      expect(response.body.counters).toHaveProperty('requests');

      // Validate numeric values
      expect(typeof response.body.counters.jsonRequests).toBe('number');
      expect(typeof response.body.counters.noPayloadRequests).toBe('number');
      expect(typeof response.body.counters.requests).toBe('number');

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });
  });

  describe('GET /cache/statistics', () => {
    test('should return cache statistics', async () => {
      const response = await request(utils.app)
        .get('/cache/statistics')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // Validate response structure
      expect(response.body).toHaveProperty('ids');
      expect(response.body).toHaveProperty('refresh');
      expect(response.body).toHaveProperty('inserts');
      expect(response.body).toHaveProperty('removes');
      expect(response.body).toHaveProperty('updates');
      expect(response.body).toHaveProperty('items');

      // Validate numeric values
      expect(typeof response.body.ids).toBe('number');
      expect(typeof response.body.refresh).toBe('number');
      expect(typeof response.body.inserts).toBe('number');
      expect(typeof response.body.removes).toBe('number');
      expect(typeof response.body.updates).toBe('number');
      expect(typeof response.body.items).toBe('number');

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });
  });
});