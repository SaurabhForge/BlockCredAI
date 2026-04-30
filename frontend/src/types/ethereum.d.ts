type EthereumRequest = {
  method: string;
  params?: unknown[];
};

interface EthereumProvider {
  request<T = unknown>(request: EthereumRequest): Promise<T>;
}

interface Window {
  ethereum?: EthereumProvider;
}
