import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppController } from '../src/app.controller.js';
import { NotificationsService } from '../src/notifications/notifications.service.js';
import { SubscriptionsController } from '../src/notifications/subscriptions.controller.js';

const VALID_TOKEN = `fGx1_abc-DEF:APA91b${'x'.repeat(140)}`;

/**
 * Sends real HTTP requests to the backend's endpoints. Firebase is replaced by a stand-in,
 * so this test needs no secrets and no network connection.
 */
describe('HTTP API (e2e)', () => {
  const addSubscriber = vi.fn();
  let app: INestApplication<App>;

  beforeEach(async () => {
    addSubscriber.mockReset().mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController, SubscriptionsController],
      providers: [
        { provide: NotificationsService, useValue: { addSubscriber } },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / reports that the backend is running', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('POST /subscriptions accepts a token with its language', async () => {
    await request(app.getHttpServer())
      .post('/subscriptions')
      .send({ token: VALID_TOKEN, language: 'tr' })
      .expect(201)
      .expect({ subscribed: true });
    expect(addSubscriber).toHaveBeenCalledWith(VALID_TOKEN, 'tr');
  });

  it('POST /subscriptions answers 400 with an explanation when the token is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/subscriptions')
      .send({})
      .expect(400);
    expect(response.body).toMatchObject({
      message: expect.stringMatching(/"token" field/),
    });
  });

  it('POST /subscriptions answers 400 for an unsupported language', async () => {
    const response = await request(app.getHttpServer())
      .post('/subscriptions')
      .send({ token: VALID_TOKEN, language: 'de' })
      .expect(400);
    expect(response.body).toMatchObject({
      message: expect.stringMatching(/language/),
    });
  });

  it('POST /subscriptions answers 400 when the body is not valid JSON', async () => {
    await request(app.getHttpServer())
      .post('/subscriptions')
      .set('Content-Type', 'application/json')
      .send('this is not json')
      .expect(400);
    expect(addSubscriber).not.toHaveBeenCalled();
  });
});
