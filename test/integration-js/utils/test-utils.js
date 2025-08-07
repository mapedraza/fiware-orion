const request = require('supertest');

/**
 * Test utilities for Orion Context Broker API testing
 */
class OrionTestUtils {
  constructor(baseUrl = global.ORION_BASE_URL) {
    this.baseUrl = baseUrl;
    this.app = baseUrl;
  }

  /**
   * Generate a unique entity ID for testing
   */
  generateEntityId(prefix = 'TestEntity') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique subscription ID for testing
   */
  generateSubscriptionId(prefix = 'TestSub') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a test entity
   */
  async createTestEntity(entityData) {
    const entityId = entityData.id || this.generateEntityId();
    const entity = {
      id: entityId,
      type: entityData.type || 'TestType',
      ...entityData.attributes || {}
    };

    const response = await request(this.app)
      .post('/v2/entities')
      .send(entity)
      .set('Content-Type', 'application/json');

    return { entity, response, entityId };
  }

  /**
   * Clean up test entity
   */
  async deleteTestEntity(entityId) {
    try {
      await request(this.app)
        .delete(`/v2/entities/${entityId}`)
        .expect((res) => {
          // Accept both 204 (success) and 404 (already deleted)
          if (res.status !== 204 && res.status !== 404) {
            throw new Error(`Unexpected status: ${res.status}`);
          }
        });
    } catch (error) {
      console.warn(`Warning: Could not delete entity ${entityId}:`, error.message);
    }
  }

  /**
   * Clean up test subscription
   */
  async deleteTestSubscription(subscriptionId) {
    try {
      await request(this.app)
        .delete(`/v2/subscriptions/${subscriptionId}`)
        .expect((res) => {
          // Accept both 204 (success) and 404 (already deleted)
          if (res.status !== 204 && res.status !== 404) {
            throw new Error(`Unexpected status: ${res.status}`);
          }
        });
    } catch (error) {
      console.warn(`Warning: Could not delete subscription ${subscriptionId}:`, error.message);
    }
  }

  /**
   * Wait for a condition to be met
   */
  async waitFor(conditionFn, timeout = 5000, interval = 100) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await conditionFn()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    return false;
  }
}

module.exports = OrionTestUtils;