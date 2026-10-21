import type { SendResponse } from 'firebase-admin/messaging';
import { findDeadTokens } from './notifications.service.js';

const delivered: SendResponse = {
  success: true,
  messageId: 'projects/p/messages/1',
};

function failed(code: string): SendResponse {
  // findDeadTokens only looks at the error code, so a minimal error object is enough.
  const error = { code, message: code } as NonNullable<SendResponse['error']>;
  return { success: false, error };
}

describe('findDeadTokens', () => {
  it('finds tokens that Firebase reports as no longer registered or invalid', () => {
    const tokens = ['a', 'b', 'c', 'd'];
    const responses = [
      delivered,
      failed('messaging/registration-token-not-registered'),
      delivered,
      failed('messaging/invalid-registration-token'),
    ];
    expect(findDeadTokens(tokens, responses)).toEqual(['b', 'd']);
  });

  it('keeps tokens whose send failed for a temporary reason', () => {
    const responses = [
      failed('messaging/server-unavailable'),
      failed('messaging/internal-error'),
    ];
    expect(findDeadTokens(['a', 'b'], responses)).toEqual([]);
  });
});
