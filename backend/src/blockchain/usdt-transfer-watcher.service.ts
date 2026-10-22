import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseError, createPublicClient, erc20Abi, http } from 'viem';
import { mainnet } from 'viem/chains';
import type { EnvConfig } from '../config/env.validation.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import {
  USDT_ADDRESS,
  toLargeTransfer,
  type LargeTransfer,
} from './usdt-transfer.js';

/** Ethereum adds a new block about every 12 seconds, so we check for new events at that pace. */
const POLLING_INTERVAL_MS = 12_000;

/** Watches the USDT contract on Ethereum Mainnet and reports every transfer of at least 100,000 USDT. */
@Injectable()
export class UsdtTransferWatcherService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(UsdtTransferWatcherService.name);
  private readonly rpcUrl: string;
  private stopWatching?: () => void;

  constructor(
    config: ConfigService<EnvConfig, true>,
    private readonly notifications: NotificationsService,
  ) {
    this.rpcUrl = config.get('ETH_RPC_URL', { infer: true });
  }

  onApplicationBootstrap(): void {
    const client = createPublicClient({
      chain: mainnet,
      transport: http(this.rpcUrl),
    });

    // Startup check: the URL works and really points to Ethereum Mainnet (chain id 1), not
    // to a test network, where the USDT contract does not exist and nothing would ever arrive.
    void Promise.all([client.getChainId(), client.getBlockNumber()]).then(
      ([chainId, blockNumber]) => {
        if (chainId === mainnet.id) {
          this.logger.log(
            `Connected to Ethereum Mainnet (latest block ${blockNumber})`,
          );
        } else {
          this.logger.error(
            `ETH_RPC_URL points to chain ${chainId}, not Ethereum Mainnet (${mainnet.id}). Check backend/.env.`,
          );
        }
      },
      (error: Error) => {
        this.logger.error(
          `Could not reach Ethereum through ETH_RPC_URL. Check the URL in backend/.env and your internet connection. ${safeErrorMessage(error, this.rpcUrl)}`,
        );
      },
    );

    // Over HTTPS, viem polls: every interval it asks Alchemy for the Transfer events
    // emitted by the USDT contract since the previous check.
    this.stopWatching = client.watchContractEvent({
      address: USDT_ADDRESS,
      abi: erc20Abi,
      eventName: 'Transfer',
      strict: true,
      pollingInterval: POLLING_INTERVAL_MS,
      onLogs: (logs) => {
        const largeTransfers = logs
          .map(toLargeTransfer)
          .filter((transfer) => transfer !== null);
        this.logger.debug(
          `Received ${logs.length} USDT transfers, ${largeTransfers.length} of them >= 100,000 USDT`,
        );
        for (const transfer of largeTransfers) {
          this.handleLargeTransfer(transfer);
        }
      },
      onError: (error) => {
        this.logger.warn(
          `Checking for new transfers failed, will retry (if this repeats, check ETH_RPC_URL and your internet connection): ${safeErrorMessage(error, this.rpcUrl)}`,
        );
      },
    });

    this.logger.log(
      `Watching USDT Transfer events on Ethereum Mainnet (every ${POLLING_INTERVAL_MS / 1000} s)`,
    );
  }

  onApplicationShutdown(): void {
    this.stopWatching?.();
  }

  private handleLargeTransfer(transfer: LargeTransfer): void {
    this.logger.log(
      `${transfer.amount} USDT  ${transfer.from} -> ${transfer.to}  tx ${transfer.txHash}`,
    );
    // Sending runs in the background; sendLargeTransfer logs its own failures and never throws.
    void this.notifications.sendLargeTransfer(transfer);
  }
}

/**
 * Describes an error without the RPC URL. viem's full error messages include the URL,
 * and an Alchemy URL contains the secret API key.
 */
export function safeErrorMessage(error: Error, rpcUrl: string): string {
  const message =
    error instanceof BaseError ? error.shortMessage : error.message;
  return message.replaceAll(rpcUrl, '[ETH_RPC_URL]');
}
