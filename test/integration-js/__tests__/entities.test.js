const request = require('supertest');
const OrionTestUtils = require('../utils/test-utils');

describe('Entity Operations', () => {
  const utils = new OrionTestUtils();
  const createdEntities = [];

  afterEach(async () => {
    // Clean up any entities created during tests
    for (const entityId of createdEntities) {
      await utils.deleteTestEntity(entityId);
    }
    createdEntities.length = 0;
  });

  describe('POST /v2/entities', () => {
    test('should create a new entity', async () => {
      const entityId = utils.generateEntityId('Room');
      const entity = {
        id: entityId,
        type: 'Room',
        temperature: {
          value: 21.7
        },
        humidity: {
          value: 60
        }
      };

      const response = await request(utils.app)
        .post('/v2/entities')
        .send(entity)
        .set('Content-Type', 'application/json')
        .expect(201);

      createdEntities.push(entityId);

      // Should return Location header
      expect(response.headers.location).toBe(`/v2/entities/${entityId}`);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should reject entity with invalid JSON', async () => {
      await request(utils.app)
        .post('/v2/entities')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    test('should reject entity without required fields', async () => {
      const entity = {
        // Missing id and type
        temperature: {
          value: 21.7
        }
      };

      await request(utils.app)
        .post('/v2/entities')
        .send(entity)
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    test('should reject duplicate entity', async () => {
      const entityId = utils.generateEntityId('Duplicate');
      const entity = {
        id: entityId,
        type: 'Room',
        temperature: {
          value: 21.7
        }
      };

      // Create first entity
      await request(utils.app)
        .post('/v2/entities')
        .send(entity)
        .set('Content-Type', 'application/json')
        .expect(201);

      createdEntities.push(entityId);

      // Try to create duplicate
      await request(utils.app)
        .post('/v2/entities')
        .send(entity)
        .set('Content-Type', 'application/json')
        .expect(422);
    });
  });

  describe('GET /v2/entities', () => {
    beforeEach(async () => {
      // Create test entities
      const testEntities = [
        {
          id: utils.generateEntityId('Room'),
          type: 'Room',
          temperature: { value: 21.7 },
          humidity: { value: 60 }
        },
        {
          id: utils.generateEntityId('Car'),
          type: 'Car',
          speed: { value: 80 },
          location: { value: '40.418889, -3.691944' }
        }
      ];

      for (const entity of testEntities) {
        await request(utils.app)
          .post('/v2/entities')
          .send(entity)
          .set('Content-Type', 'application/json')
          .expect(201);
        createdEntities.push(entity.id);
      }
    });

    test('should list all entities', async () => {
      const response = await request(utils.app)
        .get('/v2/entities')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      // Find our test entities
      const roomEntity = response.body.find(e => e.type === 'Room' && createdEntities.includes(e.id));
      const carEntity = response.body.find(e => e.type === 'Car' && createdEntities.includes(e.id));

      expect(roomEntity).toBeDefined();
      expect(carEntity).toBeDefined();

      // Validate entity structure
      expect(roomEntity).toHaveProperty('id');
      expect(roomEntity).toHaveProperty('type');
      expect(roomEntity).toHaveProperty('temperature');
      expect(roomEntity.temperature).toHaveProperty('value', 21.7);
      expect(roomEntity.temperature).toHaveProperty('type', 'Number');

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should filter entities by type', async () => {
      const response = await request(utils.app)
        .get('/v2/entities')
        .query({ type: 'Room' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned entities should be of type Room
      response.body.forEach(entity => {
        expect(entity.type).toBe('Room');
      });

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should limit number of entities returned', async () => {
      const response = await request(utils.app)
        .get('/v2/entities')
        .query({ limit: 1 })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should return entities with keyValues option', async () => {
      const response = await request(utils.app)
        .get('/v2/entities')
        .query({ options: 'keyValues' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const entity = response.body[0];
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('type');
        
        // In keyValues format, attributes should be simple values
        Object.keys(entity).forEach(key => {
          if (key !== 'id' && key !== 'type') {
            expect(typeof entity[key]).not.toBe('object');
          }
        });
      }

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });
  });

  describe('GET /v2/entities/{entityId}', () => {
    let testEntityId;

    beforeEach(async () => {
      testEntityId = utils.generateEntityId('TestRoom');
      const entity = {
        id: testEntityId,
        type: 'Room',
        temperature: {
          value: 21.7,
          metadata: {
            accuracy: {
              value: 0.1,
              type: 'Float'
            }
          }
        },
        humidity: {
          value: 60
        }
      };

      await request(utils.app)
        .post('/v2/entities')
        .send(entity)
        .set('Content-Type', 'application/json')
        .expect(201);

      createdEntities.push(testEntityId);
    });

    test('should retrieve entity by ID', async () => {
      const response = await request(utils.app)
        .get(`/v2/entities/${testEntityId}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.id).toBe(testEntityId);
      expect(response.body.type).toBe('Room');
      expect(response.body.temperature.value).toBe(21.7);
      expect(response.body.temperature.type).toBe('Number');
      expect(response.body.humidity.value).toBe(60);

      // Validate metadata
      expect(response.body.temperature.metadata).toBeDefined();
      expect(response.body.temperature.metadata.accuracy.value).toBe(0.1);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should return 404 for non-existent entity', async () => {
      await request(utils.app)
        .get('/v2/entities/non-existent-entity')
        .expect(404);
    });

    test('should retrieve entity with keyValues option', async () => {
      const response = await request(utils.app)
        .get(`/v2/entities/${testEntityId}`)
        .query({ options: 'keyValues' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.id).toBe(testEntityId);
      expect(response.body.type).toBe('Room');
      expect(response.body.temperature).toBe(21.7);
      expect(response.body.humidity).toBe(60);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should retrieve specific attributes only', async () => {
      const response = await request(utils.app)
        .get(`/v2/entities/${testEntityId}`)
        .query({ attrs: 'temperature' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.id).toBe(testEntityId);
      expect(response.body.type).toBe('Room');
      expect(response.body.temperature).toBeDefined();
      expect(response.body.humidity).toBeUndefined();

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });
  });

  describe('PATCH /v2/entities/{entityId}/attrs', () => {
    let testEntityId;

    beforeEach(async () => {
      testEntityId = utils.generateEntityId('UpdateRoom');
      const entity = {
        id: testEntityId,
        type: 'Room',
        temperature: {
          value: 21.7
        },
        humidity: {
          value: 60
        }
      };

      await request(utils.app)
        .post('/v2/entities')
        .send(entity)
        .set('Content-Type', 'application/json')
        .expect(201);

      createdEntities.push(testEntityId);
    });

    test('should update entity attributes', async () => {
      const updates = {
        temperature: {
          value: 25.0
        },
        pressure: {
          value: 1013.25
        }
      };

      await request(utils.app)
        .patch(`/v2/entities/${testEntityId}/attrs`)
        .send(updates)
        .set('Content-Type', 'application/json')
        .expect(204);

      // Verify the update
      const response = await request(utils.app)
        .get(`/v2/entities/${testEntityId}`)
        .expect(200);

      expect(response.body.temperature.value).toBe(25.0);
      expect(response.body.pressure.value).toBe(1013.25);
      expect(response.body.humidity.value).toBe(60); // Should remain unchanged
    });

    test('should return 404 for non-existent entity', async () => {
      const updates = {
        temperature: {
          value: 25.0
        }
      };

      await request(utils.app)
        .patch('/v2/entities/non-existent-entity/attrs')
        .send(updates)
        .set('Content-Type', 'application/json')
        .expect(404);
    });
  });

  describe('DELETE /v2/entities/{entityId}', () => {
    test('should delete entity', async () => {
      const entityId = utils.generateEntityId('DeleteRoom');
      const entity = {
        id: entityId,
        type: 'Room',
        temperature: {
          value: 21.7
        }
      };

      // Create entity
      await request(utils.app)
        .post('/v2/entities')
        .send(entity)
        .set('Content-Type', 'application/json')
        .expect(201);

      // Delete entity
      await request(utils.app)
        .delete(`/v2/entities/${entityId}`)
        .expect(204);

      // Verify deletion
      await request(utils.app)
        .get(`/v2/entities/${entityId}`)
        .expect(404);
    });

    test('should return 404 for non-existent entity', async () => {
      await request(utils.app)
        .delete('/v2/entities/non-existent-entity')
        .expect(404);
    });
  });
});