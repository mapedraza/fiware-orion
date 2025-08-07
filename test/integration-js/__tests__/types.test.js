const request = require('supertest');
const OrionTestUtils = require('../utils/test-utils');

describe('Type Operations', () => {
  const utils = new OrionTestUtils();
  const createdEntities = [];

  afterEach(async () => {
    // Clean up any entities created during tests
    for (const entityId of createdEntities) {
      await utils.deleteTestEntity(entityId);
    }
    createdEntities.length = 0;
  });

  beforeEach(async () => {
    // Create test entities of different types
    const testEntities = [
      {
        id: utils.generateEntityId('Room1'),
        type: 'Room',
        temperature: { value: 21.7 },
        humidity: { value: 60 }
      },
      {
        id: utils.generateEntityId('Room2'),
        type: 'Room',
        temperature: { value: 23.5 },
        humidity: { value: 55 }
      },
      {
        id: utils.generateEntityId('Car1'),
        type: 'Car',
        speed: { value: 80 },
        location: { value: '40.418889, -3.691944' }
      },
      {
        id: utils.generateEntityId('Sensor1'),
        type: 'TemperatureSensor',
        temperature: { value: 25.1 },
        battery: { value: 87 }
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

  describe('GET /v2/types', () => {
    test('should list all entity types', async () => {
      const response = await request(utils.app)
        .get('/v2/types')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);

      // Find our test types
      const roomType = response.body.find(t => t.type === 'Room');
      const carType = response.body.find(t => t.type === 'Car');
      const sensorType = response.body.find(t => t.type === 'TemperatureSensor');

      expect(roomType).toBeDefined();
      expect(carType).toBeDefined();
      expect(sensorType).toBeDefined();

      // Validate type structure
      expect(roomType).toHaveProperty('type', 'Room');
      expect(roomType).toHaveProperty('attrs');
      expect(roomType).toHaveProperty('count');

      // Validate attributes
      expect(roomType.attrs).toHaveProperty('temperature');
      expect(roomType.attrs).toHaveProperty('humidity');
      expect(roomType.attrs.temperature).toHaveProperty('types');
      expect(roomType.attrs.temperature.types).toContain('Number');

      // Validate count
      expect(roomType.count).toBeGreaterThanOrEqual(2);
      expect(carType.count).toBeGreaterThanOrEqual(1);
      expect(sensorType.count).toBeGreaterThanOrEqual(1);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should limit number of types returned', async () => {
      const response = await request(utils.app)
        .get('/v2/types')
        .query({ limit: 2 })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(2);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should paginate types with offset', async () => {
      // Get first page
      const response1 = await request(utils.app)
        .get('/v2/types')
        .query({ limit: 1 })
        .expect(200);

      // Get second page
      const response2 = await request(utils.app)
        .get('/v2/types')
        .query({ limit: 1, offset: 1 })
        .expect(200);

      expect(Array.isArray(response1.body)).toBe(true);
      expect(Array.isArray(response2.body)).toBe(true);
      expect(response1.body.length).toBe(1);
      expect(response2.body.length).toBeLessThanOrEqual(1);

      // If both have results, they should be different
      if (response2.body.length > 0) {
        expect(response1.body[0].type).not.toBe(response2.body[0].type);
      }

      // Validate OpenAPI compliance
      expect(response1).toSatisfyApiSpec();
      expect(response2).toSatisfyApiSpec();
    });

    test('should return types with noAttrDetail option', async () => {
      const response = await request(utils.app)
        .get('/v2/types')
        .query({ options: 'noAttrDetail' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const type = response.body[0];
        expect(type).toHaveProperty('type');
        expect(type).toHaveProperty('count');
        
        // With noAttrDetail, attrs should be a simple array of attribute names
        if (type.attrs) {
          expect(Array.isArray(type.attrs)).toBe(true);
          type.attrs.forEach(attr => {
            expect(typeof attr).toBe('string');
          });
        }
      }

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });
  });

  describe('GET /v2/types/{entityType}', () => {
    test('should retrieve specific entity type information', async () => {
      const response = await request(utils.app)
        .get('/v2/types/Room')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      // Validate response structure
      expect(response.body).toHaveProperty('attrs');
      expect(response.body).toHaveProperty('count');

      // Validate attributes
      expect(response.body.attrs).toHaveProperty('temperature');
      expect(response.body.attrs).toHaveProperty('humidity');
      
      // Validate attribute structure
      expect(response.body.attrs.temperature).toHaveProperty('types');
      expect(response.body.attrs.temperature.types).toContain('Number');
      expect(response.body.attrs.humidity).toHaveProperty('types');
      expect(response.body.attrs.humidity.types).toContain('Number');

      // Validate count
      expect(response.body.count).toBeGreaterThanOrEqual(2);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should return 404 for non-existent entity type', async () => {
      await request(utils.app)
        .get('/v2/types/NonExistentType')
        .expect(404);
    });

    test('should retrieve type with noAttrDetail option', async () => {
      const response = await request(utils.app)
        .get('/v2/types/Room')
        .query({ options: 'noAttrDetail' })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body).toHaveProperty('count');
      
      // With noAttrDetail, attrs should be a simple array of attribute names
      if (response.body.attrs) {
        expect(Array.isArray(response.body.attrs)).toBe(true);
        response.body.attrs.forEach(attr => {
          expect(typeof attr).toBe('string');
        });
        expect(response.body.attrs).toContain('temperature');
        expect(response.body.attrs).toContain('humidity');
      }

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });
  });
});