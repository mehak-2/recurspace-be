const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Suggestions Endpoints', () => {
  let authToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/recurspace-test');
    
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    await request(app)
      .post('/api/users/signup')
      .send(userData);

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/suggestions', () => {
    it('should analyze tasks and return suggestions', async () => {
      const tasksData = {
        tasks: [
          {
            title: 'Check emails',
            frequency: 'daily',
            dueDate: '2024-01-10T09:00:00.000Z',
            completed: true
          },
          {
            title: 'Weekly review',
            frequency: 'weekly',
            dueDate: '2024-01-15T17:00:00.000Z',
            completed: false
          },
          {
            title: 'Monthly planning',
            frequency: 'monthly',
            dueDate: '2024-01-30T10:00:00.000Z',
            completed: false
          }
        ]
      };

      const response = await request(app)
        .post('/api/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tasksData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.suggestions).toBeDefined();
      expect(response.body.suggestions.summary).toBeDefined();
      expect(response.body.suggestions.recommendations).toBeDefined();
      expect(response.body.suggestions.insights).toBeDefined();
      expect(response.body.analysis).toBeDefined();
    });

    it('should return error for empty tasks array', async () => {
      const response = await request(app)
        .post('/api/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tasks: [] })
        .expect(400);

      expect(response.body.message).toBe('At least one task is required for analysis');
    });

    it('should return error for missing tasks', async () => {
      const response = await request(app)
        .post('/api/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Tasks array is required');
    });

    it('should validate task structure', async () => {
      const invalidTasksData = {
        tasks: [
          {
            title: '',
            frequency: 'invalid',
            dueDate: 'invalid-date',
            completed: 'not-boolean'
          }
        ]
      };

      const response = await request(app)
        .post('/api/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTasksData)
        .expect(400);

      expect(response.body.message).toContain('Task title must be between 1 and 100 characters');
    });

    it('should detect overdue patterns', async () => {
      const overdueTasksData = {
        tasks: [
          {
            title: 'Overdue daily task',
            frequency: 'daily',
            dueDate: '2024-01-01T09:00:00.000Z',
            completed: false
          },
          {
            title: 'Overdue weekly task',
            frequency: 'weekly',
            dueDate: '2024-01-01T17:00:00.000Z',
            completed: false
          }
        ]
      };

      const response = await request(app)
        .post('/api/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(overdueTasksData)
        .expect(200);

      expect(response.body.suggestions.summary.overdueCount).toBe(2);
      expect(response.body.suggestions.recommendations.some(r => r.type === 'time_optimization')).toBe(true);
    });

    it('should suggest task batching for multiple similar tasks', async () => {
      const batchTasksData = {
        tasks: [
          {
            title: 'Check emails',
            frequency: 'daily',
            dueDate: '2024-01-10T09:00:00.000Z',
            completed: true
          },
          {
            title: 'Review reports',
            frequency: 'daily',
            dueDate: '2024-01-10T10:00:00.000Z',
            completed: false
          },
          {
            title: 'Email follow-ups',
            frequency: 'daily',
            dueDate: '2024-01-10T11:00:00.000Z',
            completed: false
          }
        ]
      };

      const response = await request(app)
        .post('/api/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(batchTasksData)
        .expect(200);

      expect(response.body.suggestions.recommendations.some(r => r.type === 'task_batching')).toBe(true);
    });
  });
}); 