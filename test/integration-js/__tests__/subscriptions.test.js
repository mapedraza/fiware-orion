const request = require('supertest');
const OrionTestUtils = require('../utils/test-utils');

describe('Subscription Operations', () => {
  const utils = new OrionTestUtils();
  const createdEntities = [];
  const createdSubscriptions = [];

  afterEach(async () => {
    // Clean up subscriptions and entities
    for (const subId of createdSubscriptions) {
      await utils.deleteTestSubscription(subId);
    }
    for (const entityId of createdEntities) {
      await utils.deleteTestEntity(entityId);
    }
    createdSubscriptions.length = 0;
    createdEntities.length = 0;
  });

  describe('POST /v2/subscriptions', () => {
    test('should create a new subscription', async () => {
      const subscription = {
        description: 'Test subscription for temperature changes',
        subject: {
          entities: [
            {
              type: 'Room'
            }
          ],
          condition: {
            attrs: ['temperature']
          }
        },
        notification: {
          http: {
            url: 'http://localhost:3000/notify'
          },
          attrs: ['temperature', 'humidity']
        },
        expires: '2030-12-31T23:59:59.000Z',
        throttling: 5
      };

      const response = await request(utils.app)
        .post('/v2/subscriptions')
        .send(subscription)
        .set('Content-Type', 'application/json')
        .expect(201);

      // Should return Location header with subscription ID
      expect(response.headers.location).toMatch(/^\/v2\/subscriptions\/[a-f0-9]{24}$/);
      
      const subscriptionId = response.headers.location.split('/').pop();
      createdSubscriptions.push(subscriptionId);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should reject subscription with invalid JSON', async () => {
      await request(utils.app)
        .post('/v2/subscriptions')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    test('should reject subscription without required fields', async () => {
      const subscription = {
        description: 'Incomplete subscription'
        // Missing subject and notification
      };

      await request(utils.app)
        .post('/v2/subscriptions')
        .send(subscription)
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('GET /v2/subscriptions', () => {
    beforeEach(async () => {
      // Create test subscriptions
      const subscriptions = [
        {
          description: 'Test subscription 1',
          subject: {
            entities: [{ type: 'Room' }],
            condition: { attrs: ['temperature'] }
          },
          notification: {
            http: { url: 'http://localhost:3000/notify1' },
            attrs: ['temperature']
          }
        },
        {
          description: 'Test subscription 2',
          subject: {
            entities: [{ type: 'Car' }],
            condition: { attrs: ['speed'] }
          },
          notification: {
            http: { url: 'http://localhost:3000/notify2' },
            attrs: ['speed']
          }
        }
      ];

      for (const sub of subscriptions) {
        const response = await request(utils.app)
          .post('/v2/subscriptions')
          .send(sub)
          .set('Content-Type', 'application/json')
          .expect(201);
        
        const subscriptionId = response.headers.location.split('/').pop();
        createdSubscriptions.push(subscriptionId);
      }
    });

    test('should list all subscriptions', async () => {
      const response = await request(utils.app)
        .get('/v2/subscriptions')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      // Find our test subscriptions
      const roomSub = response.body.find(s => s.description === 'Test subscription 1');
      const carSub = response.body.find(s => s.description === 'Test subscription 2');

      expect(roomSub).toBeDefined();
      expect(carSub).toBeDefined();

      // Validate subscription structure
      expect(roomSub).toHaveProperty('id');
      expect(roomSub).toHaveProperty('status');
      expect(roomSub).toHaveProperty('subject');
      expect(roomSub).toHaveProperty('notification');
      expect(roomSub.subject).toHaveProperty('entities');
      expect(roomSub.notification).toHaveProperty('http');

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should limit number of subscriptions returned', async () => {
      const response = await request(utils.app)
        .get('/v2/subscriptions')
        .query({ limit: 1 })
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });
  });

  describe('GET /v2/subscriptions/{subscriptionId}', () => {
    let testSubscriptionId;

    beforeEach(async () => {
      const subscription = {
        description: 'Test subscription for retrieval',
        subject: {
          entities: [
            {
              id: 'Room1',
              type: 'Room'
            }
          ],
          condition: {
            attrs: ['temperature', 'humidity']
          }
        },
        notification: {
          http: {
            url: 'http://localhost:3000/notify'
          },
          attrs: ['temperature', 'humidity'],
          metadata: ['timestamp']
        },
        expires: '2030-12-31T23:59:59.000Z',
        throttling: 10
      };

      const response = await request(utils.app)
        .post('/v2/subscriptions')
        .send(subscription)
        .set('Content-Type', 'application/json')
        .expect(201);

      testSubscriptionId = response.headers.location.split('/').pop();
      createdSubscriptions.push(testSubscriptionId);
    });

    test('should retrieve subscription by ID', async () => {
      const response = await request(utils.app)
        .get(`/v2/subscriptions/${testSubscriptionId}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(response.body.id).toBe(testSubscriptionId);
      expect(response.body.description).toBe('Test subscription for retrieval');
      expect(response.body.status).toBeDefined();
      expect(response.body.subject).toBeDefined();
      expect(response.body.notification).toBeDefined();
      expect(response.body.throttling).toBe(10);

      // Validate subject structure
      expect(response.body.subject.entities).toHaveLength(1);
      expect(response.body.subject.entities[0].id).toBe('Room1');
      expect(response.body.subject.entities[0].type).toBe('Room');
      expect(response.body.subject.condition.attrs).toEqual(['temperature', 'humidity']);

      // Validate notification structure
      expect(response.body.notification.http.url).toBe('http://localhost:3000/notify');
      expect(response.body.notification.attrs).toEqual(['temperature', 'humidity']);
      expect(response.body.notification.metadata).toEqual(['timestamp']);

      // Validate OpenAPI compliance
      expect(response).toSatisfyApiSpec();
    });

    test('should return 404 for non-existent subscription', async () => {
      await request(utils.app)
        .get('/v2/subscriptions/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });

  describe('PATCH /v2/subscriptions/{subscriptionId}', () => {
    let testSubscriptionId;

    beforeEach(async () => {
      const subscription = {
        description: 'Test subscription for update',
        subject: {
          entities: [{ type: 'Room' }],
          condition: { attrs: ['temperature'] }
        },
        notification: {
          http: { url: 'http://localhost:3000/notify' },
          attrs: ['temperature']
        },
        throttling: 5
      };

      const response = await request(utils.app)
        .post('/v2/subscriptions')
        .send(subscription)
        .set('Content-Type', 'application/json')
        .expect(201);

      testSubscriptionId = response.headers.location.split('/').pop();
      createdSubscriptions.push(testSubscriptionId);
    });

    test('should update subscription', async () => {
      const updates = {
        description: 'Updated test subscription',
        throttling: 15,
        notification: {
          http: {
            url: 'http://localhost:3000/updated-notify'
          },
          attrs: ['temperature', 'humidity']
        }
      };

      await request(utils.app)
        .patch(`/v2/subscriptions/${testSubscriptionId}`)
        .send(updates)
        .set('Content-Type', 'application/json')
        .expect(204);

      // Verify the update
      const response = await request(utils.app)
        .get(`/v2/subscriptions/${testSubscriptionId}`)
        .expect(200);

      expect(response.body.description).toBe('Updated test subscription');
      expect(response.body.throttling).toBe(15);
      expect(response.body.notification.http.url).toBe('http://localhost:3000/updated-notify');
      expect(response.body.notification.attrs).toEqual(['temperature', 'humidity']);
    });

    test('should return 404 for non-existent subscription', async () => {
      const updates = {
        description: 'Updated description'
      };

      await request(utils.app)
        .patch('/v2/subscriptions/507f1f77bcf86cd799439011')
        .send(updates)
        .set('Content-Type', 'application/json')
        .expect(404);
    });
  });

  describe('DELETE /v2/subscriptions/{subscriptionId}', () => {
    test('should delete subscription', async () => {
      const subscription = {
        description: 'Test subscription for deletion',
        subject: {
          entities: [{ type: 'Room' }],
          condition: { attrs: ['temperature'] }
        },
        notification: {
          http: { url: 'http://localhost:3000/notify' },
          attrs: ['temperature']
        }
      };

      // Create subscription
      const response = await request(utils.app)
        .post('/v2/subscriptions')
        .send(subscription)
        .set('Content-Type', 'application/json')
        .expect(201);

      const subscriptionId = response.headers.location.split('/').pop();

      // Delete subscription
      await request(utils.app)
        .delete(`/v2/subscriptions/${subscriptionId}`)
        .expect(204);

      // Verify deletion
      await request(utils.app)
        .get(`/v2/subscriptions/${subscriptionId}`)
        .expect(404);
    });

    test('should return 404 for non-existent subscription', async () => {
      await request(utils.app)
        .delete('/v2/subscriptions/507f1f77bcf86cd799439011')
        .expect(404);
    });
  });
});