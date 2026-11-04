type EthereumRequest = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};

export interface EthereumProvider {
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
  request<T = unknown>(request: EthereumRequest): Promise<T>;
  on?(event: string, callback: (...args: any[]) => void): void;
  removeListener?(event: string, callback: (...args: any[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
