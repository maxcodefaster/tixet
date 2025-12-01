/**
 * Utility functions for IOTA Explorer integration
 */

export type IotaNetwork = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

/**
 * Get the current network from environment or default to devnet
 */
export const getCurrentNetwork = (): IotaNetwork => {
  // You can extend this to read from your network config if needed
  return 'devnet';
};

/**
 * Generate IOTA Explorer URL for a transaction
 * @param digest - The transaction digest/hash
 * @param network - The IOTA network (defaults to current network)
 * @returns Full URL to the transaction on IOTA Explorer
 */
export const getExplorerTxUrl = (
  digest: string,
  network: IotaNetwork = getCurrentNetwork()
): string => {
  return `https://explorer.iota.org/txblock/${digest}?network=${network}`;
};

/**
 * Generate IOTA Explorer URL for an object
 * @param objectId - The object ID
 * @param network - The IOTA network (defaults to current network)
 * @returns Full URL to the object on IOTA Explorer
 */
export const getExplorerObjectUrl = (
  objectId: string,
  network: IotaNetwork = getCurrentNetwork()
): string => {
  return `https://explorer.iota.org/object/${objectId}?network=${network}`;
};

/**
 * Generate IOTA Explorer URL for an address
 * @param address - The wallet address
 * @param network - The IOTA network (defaults to current network)
 * @returns Full URL to the address on IOTA Explorer
 */
export const getExplorerAddressUrl = (
  address: string,
  network: IotaNetwork = getCurrentNetwork()
): string => {
  return `https://explorer.iota.org/address/${address}?network=${network}`;
};

/**
 * Show a success message with a link to view the transaction on IOTA Explorer
 * @param digest - The transaction digest
 * @param message - Optional custom success message
 */
export const showTransactionSuccess = (
  digest: string,
  message: string = 'Transaction successful!'
): void => {
  const explorerUrl = getExplorerTxUrl(digest);
  const fullMessage = `${message}\n\nView on IOTA Explorer:\n${explorerUrl}`;

  alert(fullMessage);

  // Log for easy clicking in console
  console.log('Transaction successful!');
  console.log('View on IOTA Explorer:', explorerUrl);
  console.log('Transaction Digest:', digest);
};
