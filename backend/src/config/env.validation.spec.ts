import { fileURLToPath } from 'node:url';
import { validateEnv } from './env.validation.js';

// This test file itself is guaranteed to exist, so it stands in for the real key file.
const EXISTING_FILE = fileURLToPath(import.meta.url);
const VALID_URL = 'https://eth-mainnet.g.alchemy.com/v2/test-key';

function validEnv(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ETH_RPC_URL: VALID_URL,
    FIREBASE_SERVICE_ACCOUNT_PATH: EXISTING_FILE,
    ...overrides,
  };
}

describe('validateEnv', () => {
  it('returns the checked settings, using defaults for the optional ones', () => {
    expect(validateEnv(validEnv())).toEqual({
      PORT: 3000,
      ETH_RPC_URL: VALID_URL,
      FIREBASE_SERVICE_ACCOUNT_PATH: EXISTING_FILE,
      FRONTEND_ORIGIN: 'http://localhost:5173',
    });
  });

  it('removes a trailing slash from FRONTEND_ORIGIN, since browsers send it without one', () => {
    const env = validEnv({ FRONTEND_ORIGIN: 'http://localhost:4000/' });
    expect(validateEnv(env).FRONTEND_ORIGIN).toBe('http://localhost:4000');
  });

  it.each(['localhost:5173', 'not a web address'])(
    'rejects FRONTEND_ORIGIN "%s"',
    (origin) => {
      expect(() => validateEnv(validEnv({ FRONTEND_ORIGIN: origin }))).toThrow(
        /FRONTEND_ORIGIN must be a web address/,
      );
    },
  );

  it('reads PORT as a number', () => {
    expect(validateEnv(validEnv({ PORT: '4000' })).PORT).toBe(4000);
  });

  it('lists every missing variable in one error', () => {
    expect(() => validateEnv({})).toThrow(
      /ETH_RPC_URL is missing[\s\S]*FIREBASE_SERVICE_ACCOUNT_PATH is missing/,
    );
  });

  it('rejects the placeholder Alchemy URL from .env.example', () => {
    const env = validEnv({
      ETH_RPC_URL: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY',
    });
    expect(() => validateEnv(env)).toThrow(/placeholder/);
  });

  it('rejects a URL that does not use https', () => {
    expect(() =>
      validateEnv(validEnv({ ETH_RPC_URL: 'http://example.com' })),
    ).toThrow(/must start with https/);
  });

  it('rejects a service-account path that points to no file', () => {
    const env = validEnv({
      FIREBASE_SERVICE_ACCOUNT_PATH: './secrets/does-not-exist.json',
    });
    expect(() => validateEnv(env)).toThrow(/does not exist/);
  });

  it('rejects an invalid PORT', () => {
    expect(() => validateEnv(validEnv({ PORT: 'abc' }))).toThrow(
      /PORT must be/,
    );
  });

  it('never puts the secret URL in the error message', () => {
    let message = '';
    try {
      validateEnv(validEnv({ ETH_RPC_URL: 'http://secret-api-key-123' }));
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('ETH_RPC_URL must start with https://');
    expect(message).not.toContain('secret-api-key-123');
  });
});
