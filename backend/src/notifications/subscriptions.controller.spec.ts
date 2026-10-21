import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NotificationsService } from './notifications.service.js';
import { SubscriptionsController } from './subscriptions.controller.js';

const VALID_TOKEN = `fGx1_abc-DEF:APA91b${'x'.repeat(140)}`;

describe('SubscriptionsController', () => {
  // A stand-in for the real NotificationsService, so the test never contacts Firebase.
  const addSubscriber = vi.fn();
  let controller: SubscriptionsController;

  beforeEach(async () => {
    addSubscriber.mockReset().mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        { provide: NotificationsService, useValue: { addSubscriber } },
      ],
    }).compile();
    controller = moduleRef.get(SubscriptionsController);
  });

  it('subscribes a valid token with its language', async () => {
    await expect(
      controller.subscribe({ token: VALID_TOKEN, language: 'tr' }),
    ).resolves.toEqual({ subscribed: true });
    expect(addSubscriber).toHaveBeenCalledWith(VALID_TOKEN, 'tr');
  });

  it('uses English when no language is given', async () => {
    await controller.subscribe({ token: VALID_TOKEN });
    expect(addSubscriber).toHaveBeenCalledWith(VALID_TOKEN, 'en');
  });

  it.each([
    ['no body', undefined],
    ['no token', {}],
    ['a number', { token: 123 }],
    ['an empty token', { token: '' }],
    ['spaces in the token', { token: 'this has spaces but is long enough' }],
    ['an unsupported language', { token: VALID_TOKEN, language: 'de' }],
  ])('rejects %s with 400 Bad Request', async (_case, body) => {
    await expect(controller.subscribe(body)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(addSubscriber).not.toHaveBeenCalled();
  });
});
