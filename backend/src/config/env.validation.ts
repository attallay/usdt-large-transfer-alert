import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** The backend's settings, after they have been checked. */
export interface EnvConfig {
  PORT: number;
  ETH_RPC_URL: string;
  /** Absolute path to the Firebase service-account key file. */
  FIREBASE_SERVICE_ACCOUNT_PATH: string;
  /** Web address of the frontend, which browsers allow to call this backend (CORS). */
  FRONTEND_ORIGIN: string;
}

const DEFAULT_PORT = 3000;
const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:5173';

/**
 * Checks the environment variables (from backend/.env and the system) when the app starts.
 * Throws a single error that lists every problem, so the app stops right away with a clear
 * message instead of failing later in a confusing way. Secret values are never put in messages.
 */
export function validateEnv(raw: Record<string, unknown>): EnvConfig {
  const problems: string[] = [];

  const ethRpcUrl = readRequired(raw, 'ETH_RPC_URL', problems);
  if (ethRpcUrl && !ethRpcUrl.startsWith('https://')) {
    problems.push('ETH_RPC_URL must start with https://');
  } else if (ethRpcUrl.includes('YOUR_ALCHEMY_API_KEY')) {
    problems.push(
      'ETH_RPC_URL still contains the placeholder YOUR_ALCHEMY_API_KEY',
    );
  }

  const serviceAccountPath = readRequired(
    raw,
    'FIREBASE_SERVICE_ACCOUNT_PATH',
    problems,
  );
  const absoluteServiceAccountPath = serviceAccountPath
    ? resolve(serviceAccountPath)
    : '';
  if (serviceAccountPath && !existsSync(absoluteServiceAccountPath)) {
    problems.push(
      `FIREBASE_SERVICE_ACCOUNT_PATH points to a file that does not exist: ${absoluteServiceAccountPath}`,
    );
  }

  const portText = readOptional(raw, 'PORT');
  const port = portText === undefined ? DEFAULT_PORT : Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    problems.push('PORT must be a whole number between 1 and 65535');
  }

  const frontendOrigin = toOrigin(
    readOptional(raw, 'FRONTEND_ORIGIN') ?? DEFAULT_FRONTEND_ORIGIN,
  );
  if (frontendOrigin === null) {
    problems.push(
      'FRONTEND_ORIGIN must be a web address like http://localhost:5173',
    );
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid backend configuration (check backend/.env):\n  - ${problems.join('\n  - ')}`,
    );
  }

  return {
    PORT: port,
    ETH_RPC_URL: ethRpcUrl,
    FIREBASE_SERVICE_ACCOUNT_PATH: absoluteServiceAccountPath,
    FRONTEND_ORIGIN: frontendOrigin ?? DEFAULT_FRONTEND_ORIGIN,
  };
}

/** Returns the trimmed value, or '' after recording a problem if the variable is missing. */
function readRequired(
  raw: Record<string, unknown>,
  name: string,
  problems: string[],
): string {
  const value = readOptional(raw, name);
  if (value === undefined) {
    problems.push(`${name} is missing`);
    return '';
  }
  return value;
}

/** Returns the trimmed value, or undefined if the variable is missing or empty. */
function readOptional(
  raw: Record<string, unknown>,
  name: string,
): string | undefined {
  const value = raw[name];
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined;
}

/** "http://localhost:5173/" -> "http://localhost:5173"; null if it is not an http(s) address. */
function toOrigin(value: string): string | null {
  if (!URL.canParse(value)) {
    return null;
  }
  const url = new URL(value);
  return url.protocol === 'http:' || url.protocol === 'https:'
    ? url.origin
    : null;
}
