const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('JWT Authentication Middleware', () => {
  let testUser;
  let validToken;
  let expiredToken;
  let invalidToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/recurspace-test');
    
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    validToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    expiredToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1ms' });
    invalidToken = 'invalid.token.here';
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Protected Route Access', () => {
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject request with missing token', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('MISSING_TOKEN');
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    it('should reject request with invalid token format', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('MISSING_TOKEN');
    });

    it('should reject request with expired token', async () => {
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('TOKEN_EXPIRED');
      expect(response.body.message).toBe('Token expired.');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_TOKEN');
      expect(response.body.message).toBe('Invalid token.');
    });

    it('should reject request with non-existent user ID', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      const fakeToken = jwt.sign({ id: fakeUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('USER_NOT_FOUND');
      expect(response.body.message).toBe('Invalid token. User not found.');
    });

    it('should reject request for deactivated user', async () => {
      await User.findByIdAndUpdate(testUser._id, { isActive: false });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ACCOUNT_DEACTIVATED');
      expect(response.body.message).toBe('Account is deactivated.');

      await User.findByIdAndUpdate(testUser._id, { isActive: true });
    });
  });

  describe('User Object Attachment', () => {
    it('should attach user object to request', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not include password in user object', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.user.password).toBeUndefined();
    });
  });

  describe('Token Validation', () => {
    it('should handle malformed token payload', async () => {
      const malformedToken = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${malformedToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_TOKEN_FORMAT');
      expect(response.body.message).toBe('Invalid token format.');
    });

    it('should handle invalid user ID format', async () => {
      const invalidIdToken = jwt.sign({ id: 'invalid-id' }, process.env.JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${invalidIdToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('INVALID_USER_ID');
      expect(response.body.message).toBe('Invalid user ID in token.');
    });
  });

  describe('Error Handling', () => {
    it('should handle server configuration errors', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('JWT_CONFIG_ERROR');
      expect(response.body.message).toBe('Server configuration error.');

      process.env.JWT_SECRET = originalSecret;
    });
  });
}); 