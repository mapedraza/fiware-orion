const request = require('supertest');
const OrionTestUtils = require('../utils/test-utils');

describe('Batch Operations', () => {
  const utils = new OrionTestUtils();
  const createdEntities = [];

  afterEach(async () => {
    // Clean up any entities created during tests
    for (const entityId of createdEntities) {
      await utils.deleteTestEntity(entityId);
    }
    createdEntities.length = 0;
  });

  describe('POST /v2/op/update', () => {
    test('should create multiple entities', async () => {
      const entityIds = [
        utils.generateEntityId('BatchRoom1'),
        utils.generateEntityId('BatchRoom2'),
        utils.generateEntityId('BatchCar1')
      ];

      const updateOperation = {
        actionType: 'append',
        entities: [
          {
            id: entityIds[0],
            type: 'Room',
            temperature: {
              value: 21.7
            },
            humidity: {
              value: 60
            }
          },
          {
            id: entityIds[1],
            type: 'Room',
            temperature: {
              value: 23.5
            },
            humidity: {
              value: 55
            }
          },
          {
            id: entityIds[2],
            type: 'Car',
            speed: {
              value: 80
            },
            location: {
              value: '40.418889, -3.691944'
            }
          }
        ]
      };

      const response = await request(utils.app)
        .post('/v2/op/update')
        .send(updateOperation)
        .set('Content-Type', 'application/json')
        .expect(204);

      // Add to cleanup list
      createdEntities.push(...entityIds);

      // Verify entities were created
      for (const entityId of entityIds) {
        const getResponse = await request(utils.app)
          .get(`/v2/entities/${entityId}`)
          .expect(200);

        expect(getResponse.body.id).toBe(entityId);
      }

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should update multiple entities', async () => {
      // First create entities
      const entityIds = [
        utils.generateEntityId('UpdateRoom1'),
        utils.generateEntityId('UpdateRoom2')
      ];

      const createOperation = {
        actionType: 'append',
        entities: [
          {
            id: entityIds[0],
            type: 'Room',
            temperature: { value: 20.0 }
          },
          {
            id: entityIds[1],
            type: 'Room',
            temperature: { value: 22.0 }
          }
        ]
      };

      await request(utils.app)
        .post('/v2/op/update')
        .send(createOperation)
        .set('Content-Type', 'application/json')
        .expect(204);

      createdEntities.push(...entityIds);

      // Now update them
      const updateOperation = {
        actionType: 'update',
        entities: [
          {
            id: entityIds[0],
            type: 'Room',
            temperature: { value: 25.0 },
            humidity: { value: 65 }
          },
          {
            id: entityIds[1],
            type: 'Room',
            temperature: { value: 27.0 },
            humidity: { value: 70 }
          }
        ]
      };

      await request(utils.app)
        .post('/v2/op/update')
        .send(updateOperation)
        .set('Content-Type', 'application/json')
        .expect(204);

      // Verify updates
      const response1 = await request(utils.app)
        .get(`/v2/entities/${entityIds[0]}`)
        .expect(200);

      const response2 = await request(utils.app)
        .get(`/v2/entities/${entityIds[1]}`)
        .expect(200);

      expect(response1.body.temperature.value).toBe(25.0);
      expect(response1.body.humidity.value).toBe(65);
      expect(response2.body.temperature.value).toBe(27.0);
      expect(response2.body.humidity.value).toBe(70);
    });

    test('should delete multiple entities', async () => {
      // First create entities
      const entityIds = [
        utils.generateEntityId('DeleteRoom1'),
        utils.generateEntityId('DeleteRoom2')
      ];

      const createOperation = {
        actionType: 'append',
        entities: [
          {
            id: entityIds[0],
            type: 'Room',
            temperature: { value: 20.0 }
          },
          {
            id: entityIds[1],
            type: 'Room',
            temperature: { value: 22.0 }
          }
        ]
      };

      await request(utils.app)
        .post('/v2/op/update')
        .send(createOperation)
        .set('Content-Type', 'application/json')
        .expect(204);

      // Delete them
      const deleteOperation = {
        actionType: 'delete',
        entities: [
          {
            id: entityIds[0],
            type: 'Room'
          },
          {
            id: entityIds[1],
            type: 'Room'
          }
        ]
      };

      await request(utils.app)
        .post('/v2/op/update')
        .send(deleteOperation)
        .set('Content-Type', 'application/json')
        .expect(204);

      // Verify deletion
      await request(utils.app)
        .get(`/v2/entities/${entityIds[0]}`)
        .expect(404);

      await request(utils.app)
        .get(`/v2/entities/${entityIds[1]}`)
        .expect(404);
    });

    test('should handle invalid action type', async () => {
      const updateOperation = {
        actionType: 'invalid',
        entities: [
          {
            id: utils.generateEntityId('TestEntity'),
            type: 'Room',
            temperature: { value: 21.7 }
          }
        ]
      };

      await request(utils.app)
        .post('/v2/op/update')
        .send(updateOperation)
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    test('should reject invalid JSON', async () => {
      await request(utils.app)
        .post('/v2/op/update')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('POST /v2/op/query', () => {
    beforeEach(async () => {
      // Create test entities for querying
      const testEntities = [
        {
          id: utils.generateEntityId('QueryRoom1'),
          type: 'Room',
          temperature: { value: 21.7 },
          humidity: { value: 60 },
          location: { value: 'Building A' }
        },
        {
          id: utils.generateEntityId('QueryRoom2'),
          type: 'Room',
          temperature: { value: 25.3 },
          humidity: { value: 55 },
          location: { value: 'Building B' }
        },
        {
          id: utils.generateEntityId('QueryCar1'),
          type: 'Car',
          speed: { value: 80 },
          location: { value: 'Highway A1' }
        }
      ];

      const createOperation = {
        actionType: 'append',
        entities: testEntities
      };

      await request(utils.app)
        .post('/v2/op/update')
        .send(createOperation)
        .set('Content-Type', 'application/json')
        .expect(204);

      // Add to cleanup list
      testEntities.forEach(entity => createdEntities.push(entity.id));
    });

    test('should query entities by type', async () => {
      const queryOperation = {
        entities: [
          {
            type: 'Room'
          }
        ]
      };

      const response = await request(utils.app)
        .post('/v2/op/query')
        .send(queryOperation)
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      // All returned entities should be of type Room
      response.body.forEach(entity => {
        expect(entity.type).toBe('Room');
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('temperature');
        expect(entity).toHaveProperty('humidity');
      });

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should query entities with attribute filter', async () => {
      const queryOperation = {
        entities: [
          {
            type: 'Room'
          }
        ],
        expression: {
          q: 'temperature>22'
        }
      };

      const response = await request(utils.app)
        .post('/v2/op/query')
        .send(queryOperation)
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);

      // All returned entities should have temperature > 22
      response.body.forEach(entity => {
        expect(entity.type).toBe('Room');
        expect(entity.temperature.value).toBeGreaterThan(22);
      });

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should query entities with specific attributes', async () => {
      const queryOperation = {
        entities: [
          {
            type: 'Room'
          }
        ],
        attrs: ['temperature', 'location']
      };

      const response = await request(utils.app)
        .post('/v2/op/query')
        .send(queryOperation)
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);

      response.body.forEach(entity => {
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('type');
        expect(entity).toHaveProperty('temperature');
        expect(entity).toHaveProperty('location');
        expect(entity).not.toHaveProperty('humidity');
      });

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should query entities with keyValues option', async () => {
      const queryOperation = {
        entities: [
          {
            type: 'Room'
          }
        ]
      };

      const response = await request(utils.app)
        .post('/v2/op/query')
        .send(queryOperation)
        .query({ options: 'keyValues' })
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const entity = response.body[0];
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('type');
        
        // In keyValues format, attributes should be simple values
        if (entity.temperature !== undefined) {
          expect(typeof entity.temperature).not.toBe('object');
        }
      }

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should handle empty query result', async () => {
      const queryOperation = {
        entities: [
          {
            type: 'NonExistentType'
          }
        ]
      };

      const response = await request(utils.app)
        .post('/v2/op/query')
        .send(queryOperation)
        .set('Content-Type', 'application/json')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should reject invalid JSON', async () => {
      await request(utils.app)
        .post('/v2/op/query')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });
});