export interface WalletSlice {
  balance: number;
  lowBalanceThreshold: number;
  flags: any;
  lastLowBalanceNotification: Date | null;
}

export interface WalletModelAdapter {
  getWalletById(fixerId: string): Promise<WalletSlice | null>;
  updateWalletById(fixerId: string, patch: Partial<WalletSlice>): Promise<void>;
}