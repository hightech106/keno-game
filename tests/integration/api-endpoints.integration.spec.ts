import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/backend/app.module';
import { DataSource } from 'typeorm';
import { RoundService } from '../../src/backend/round/services/round.service';
import { BetService } from '../../src/backend/bet/services/bet.service';
import { createTestModule, closeTestModule } from './test-setup';

describe('API Endpoints Integration', () => {
  let app: INestApplication;
  let module: TestingModule;
  let roundService: RoundService;
  let betService: BetService;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await createTestModule();
    app = module.createNestApplication();
    await app.init();

    roundService = module.get<RoundService>(RoundService);
    betService = module.get<BetService>(BetService);
    dataSource = module.get<DataSource>(DataSource);

    // Setup test operator
    const operatorRepo = dataSource.getRepository('Operator');
    const configRepo = dataSource.getRepository('OperatorConfig');
    
    // Note: This is simplified - in real tests, use proper entity repositories
  });

  afterAll(async () => {
    await app.close();
    await closeTestModule(module);
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE bets CASCADE');
    await dataSource.query('TRUNCATE TABLE rounds CASCADE');
  });

  describe('Round Endpoints', () => {
    it('GET /rounds/current should return current round', async () => {
      const round = await roundService.createRound(new Date());

      const response = await request(app.getHttpServer())
        .get('/rounds/current')
        .expect(200);

      expect(response.body).toHaveProperty('roundId');
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OPEN');
      expect(response.body).toHaveProperty('countdownSeconds');
    });

    it('GET /rounds/:roundId should return round details', async () => {
      const round = await roundService.createRound(new Date());

      const response = await request(app.getHttpServer())
        .get(`/rounds/${round.roundId}`)
        .expect(200);

      expect(response.body.roundId).toBe(round.roundId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('scheduledTime');
    });

    it('GET /rounds/:roundId/result should return round results', async () => {
      const round = await roundService.createRound(new Date());
      await roundService.transitionRound(round.roundId, 'CLOSING' as any);
      await roundService.transitionRound(round.roundId, 'DRAWING' as any);

      const response = await request(app.getHttpServer())
        .get(`/rounds/${round.roundId}/result`)
        .expect(200);

      expect(response.body).toHaveProperty('numbersDrawn');
      expect(response.body.numbersDrawn).toHaveLength(20);
    });
  });

  describe('Bet Endpoints', () => {
    it('POST /bets should place a bet', async () => {
      const round = await roundService.createRound(new Date());

      const response = await request(app.getHttpServer())
        .post('/bets')
        .send({
          operatorId: 'test-op-1',
          playerId: 'test-player-1',
          currency: 'USD',
          stake: 10,
          selections: [1, 2, 3, 4, 5],
        })
        .expect(201);

      expect(response.body).toHaveProperty('betId');
      expect(response.body.betAmount).toBe(10);
      expect(response.body.numbersSelected).toEqual([1, 2, 3, 4, 5]);
    });

    it('GET /bets/:betId should return bet details', async () => {
      const round = await roundService.createRound(new Date());
      const bet = await betService.placeBet({
        operatorId: 'test-op-1',
        playerId: 'test-player-1',
        currency: 'USD',
        stake: 10,
        selections: [1, 2, 3],
      });

      const response = await request(app.getHttpServer())
        .get(`/bets/${bet.betId}`)
        .expect(200);

      expect(response.body.betId).toBe(bet.betId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('betAmount');
    });

    it('POST /bets/rollback should rollback a bet', async () => {
      const round = await roundService.createRound(new Date());
      const bet = await betService.placeBet({
        operatorId: 'test-op-1',
        playerId: 'test-player-1',
        currency: 'USD',
        stake: 10,
        selections: [1, 2, 3],
      });

      const response = await request(app.getHttpServer())
        .post('/bets/rollback')
        .send({
          betId: bet.betId,
          reason: 'TEST_ROLLBACK',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });
  });

  describe('Fairness Endpoint', () => {
    it('GET /fairness/verify should verify round fairness', async () => {
      const response = await request(app.getHttpServer())
        .get('/fairness/verify')
        .query({
          serverSeed: 'test-seed-123',
          clientSeed: 'client-seed-456',
          nonce: 1,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('numbers');
      expect(response.body.result.numbers).toHaveLength(20);
    });
  });
});
