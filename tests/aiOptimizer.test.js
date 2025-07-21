const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const Workflow = require('../models/Workflow');
const AIOptimization = require('../models/AIOptimization');

let authToken;
let testUser;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
  
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });

  const loginResponse = await request(app)
    .post('/api/users/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });

  authToken = loginResponse.body.token;
});

afterAll(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
  await Workflow.deleteMany({});
  await AIOptimization.deleteMany({});
  await mongoose.connection.close();
});

describe('AI Optimizer API', () => {
  beforeEach(async () => {
    await Task.deleteMany({});
    await Workflow.deleteMany({});
    await AIOptimization.deleteMany({});
  });

  describe('GET /api/ai-optimizer/stats', () => {
    it('should return optimization stats', async () => {
      await AIOptimization.create([
        {
          type: 'workflow',
          category: 'efficiency',
          title: 'Test Optimization 1',
          description: 'Test description',
          suggestion: 'Test suggestion',
          impact: 'high',
          confidence: 85,
          estimatedSavings: { time: 2, efficiency: 25 },
          status: 'pending',
          user: testUser._id
        },
        {
          type: 'task',
          category: 'time_management',
          title: 'Test Optimization 2',
          description: 'Test description',
          suggestion: 'Test suggestion',
          impact: 'medium',
          confidence: 75,
          estimatedSavings: { time: 1, efficiency: 15 },
          status: 'applied',
          user: testUser._id
        }
      ]);

      const response = await request(app)
        .get('/api/ai-optimizer/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats.total).toBe(2);
      expect(response.body.stats.applied).toBe(1);
      expect(response.body.stats.applicationRate).toBe('50.0');
    });
  });

  describe('GET /api/ai-optimizer/patterns', () => {
    it('should return pattern analysis', async () => {
      await Task.create([
        {
          title: 'Test Task 1',
          description: 'Test description',
          status: 'completed',
          priority: 'high',
          dueDate: new Date(),
          completedAt: new Date(),
          user: testUser._id
        },
        {
          title: 'Test Task 2',
          description: 'Test description',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date(Date.now() - 86400000),
          user: testUser._id
        }
      ]);

      const response = await request(app)
        .get('/api/ai-optimizer/patterns')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.patterns).toBeInstanceOf(Array);
      expect(response.body.summary).toBeDefined();
    });
  });

  describe('POST /api/ai-optimizer/generate', () => {
    it('should generate new optimizations', async () => {
      const response = await request(app)
        .post('/api/ai-optimizer/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'general'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.optimizations).toBeInstanceOf(Array);
    });
  });

  describe('PATCH /api/ai-optimizer/:id/status', () => {
    it('should update optimization status', async () => {
      const optimization = await AIOptimization.create({
        type: 'workflow',
        category: 'efficiency',
        title: 'Test Optimization',
        description: 'Test description',
        suggestion: 'Test suggestion',
        impact: 'high',
        confidence: 85,
        estimatedSavings: { time: 2, efficiency: 25 },
        status: 'pending',
        user: testUser._id
      });

      const response = await request(app)
        .patch(`/api/ai-optimizer/${optimization._id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'applied'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.optimization.status).toBe('applied');
    });
  });
}); 