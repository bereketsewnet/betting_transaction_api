import request from 'supertest';
import { app } from '../src/app';
import { sequelize } from '../src/config/database';

describe('Transaction API', () => {
  let accessToken: string;
  let playerUuid: string;

  beforeAll(async () => {
    // Initialize database for testing
    await sequelize.sync({ force: true });

    // Login to get access token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'admin@example.com',
        password: 'AdminPass123!',
      });

    accessToken = loginResponse.body.accessToken;

    // Create a player profile
    const playerResponse = await request(app)
      .post('/api/v1/players')
      .send({
        telegramId: '123456789',
        telegramUsername: 'testuser',
        languageCode: 'en',
      });

    playerUuid = playerResponse.body.player.playerUuid;
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  describe('POST /api/v1/transactions', () => {
    it('should create a deposit transaction', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .send({
          playerUuid,
          type: 'DEPOSIT',
          amount: 100.00,
          currency: 'USD',
          depositBankId: 1,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('transaction');
      expect(response.body.transaction.type).toBe('DEPOSIT');
      expect(response.body.transaction.amount).toBe('100.00');
      expect(response.body.transaction.status).toBe('Pending');
    });

    it('should create a withdrawal transaction', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .send({
          playerUuid,
          type: 'WITHDRAW',
          amount: 50.00,
          currency: 'USD',
          withdrawalBankId: 1,
          withdrawalAddress: 'test-address-123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('transaction');
      expect(response.body.transaction.type).toBe('WITHDRAW');
      expect(response.body.transaction.amount).toBe('50.00');
      expect(response.body.transaction.status).toBe('Pending');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .send({
          playerUuid,
          type: 'DEPOSIT',
          // Missing amount
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid player UUID', async () => {
      const response = await request(app)
        .post('/api/v1/transactions')
        .send({
          playerUuid: 'invalid-uuid',
          type: 'DEPOSIT',
          amount: 100.00,
          currency: 'USD',
          depositBankId: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('should get transactions by player UUID', async () => {
      const response = await request(app)
        .get('/api/v1/transactions')
        .query({ playerUuid });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });

    it('should require player UUID', async () => {
      const response = await request(app)
        .get('/api/v1/transactions');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/admin/transactions', () => {
    it('should get all transactions for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/transactions')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/transactions');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
