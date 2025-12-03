import 'dotenv/config';
import { makeRawCollectionWalletAdapter } from './adapter';
import { makeWalletCollectionByUserIdAdapter } from './adapter.collection';

export function resolveWalletAdapter() {
  const mode = process.env.WALLET_STORAGE_MODE || 'embedded';
  if (mode === 'embedded') {
    const usersCol = process.env.FIXERS_COLLECTION || 'users';
    return makeRawCollectionWalletAdapter(usersCol);
  }
  if (mode === 'collection_by_userId') {
    const walletsCol = process.env.WALLETS_COLLECTION || 'wallets';
    const idField = process.env.WALLET_USER_ID_FIELD || 'users_id';
    return makeWalletCollectionByUserIdAdapter(walletsCol, idField);
  }
  throw new Error(`WALLET_STORAGE_MODE inválido: ${mode}`);
}

export const walletAdapterReal = resolveWalletAdapter();
