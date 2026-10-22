import { HttpRequestError } from 'viem';
import { safeErrorMessage } from './usdt-transfer-watcher.service.js';

const RPC_URL = 'https://eth-mainnet.g.alchemy.com/v2/secret-key-123';

describe('safeErrorMessage', () => {
  it('leaves the secret key out of viem errors, whose full message includes it', () => {
    const error = new HttpRequestError({ url: RPC_URL, status: 429 });

    expect(error.message).toContain('secret-key-123');
    expect(safeErrorMessage(error, RPC_URL)).not.toContain('secret-key-123');
  });

  it('blanks out the URL in other errors too', () => {
    const error = new Error(`fetch failed for ${RPC_URL}`);

    expect(safeErrorMessage(error, RPC_URL)).toBe(
      'fetch failed for [ETH_RPC_URL]',
    );
  });
});
