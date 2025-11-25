import { computeWalletFlags } from "./flags";
import type { WalletModelAdapter } from "./adapter";
import { logFlagChangeHuman } from './prettyLog';


/**
 * Resta `commission` del balance y ajusta flags según las reglas.
 * commission debe venir positiva (ej. 5.00)
 */
export async function applyCommissionToWallet(
  adapter: WalletModelAdapter,
  fixerId: string,
  commission: number
) {
  if (!fixerId) throw new Error("FIXER_ID_REQUIRED");
  const c = Math.max(0, Number(commission || 0));

  const current = await adapter.getWalletById(fixerId);
  if (!current) throw new Error("FIXER_NOT_FOUND");

  const pre = Number(current.balance ?? 0);
  const post = +(pre - c).toFixed(2);
  const thr = Number(current.lowBalanceThreshold ?? 0);

    const { nextFlags, state, changed, crossed } = computeWalletFlags({
    preBalance: pre,
    postBalance: post,
    lowBalanceThreshold: thr,
    prevFlags: current.flags ?? null,
  });

  // 🔊 Log solo si cambian los flags (incluye pasar a "ok")
 if (changed) {
  logFlagChangeHuman({
    fixerId,
    pre,
    post,
    thr,
    state,
    crossed,
    flags: nextFlags,
    currency: 'BOB', // o quítalo si no quieres mostrarlo
  });
}


  // marca auditoría básica si encendiste algo
  const patch: any = {
    balance: post,
    flags: nextFlags,
  };
  if (nextFlags.needsLowAlert || nextFlags.needsCriticalAlert) {
    patch.lastLowBalanceNotification = new Date();
  }

  await adapter.updateWalletById(fixerId, patch);

  return {
    preBalance: pre,
    postBalance: post,
    threshold: thr,
    state,            // "ok" | "low" | "critical"
    flags: nextFlags, // para inspección en tests
  };
}

/** Opcional: sumar recargas y recalcular flags con la misma lógica */
export async function applyTopUpToWallet(
  adapter: WalletModelAdapter,
  fixerId: string,
  amount: number
) {
  if (!fixerId) throw new Error("FIXER_ID_REQUIRED");
  const a = Math.max(0, Number(amount || 0));

  const current = await adapter.getWalletById(fixerId);
  if (!current) throw new Error("FIXER_NOT_FOUND");

  const pre = Number(current.balance ?? 0);
  const post = +(pre + a).toFixed(2);
  const thr = Number(current.lowBalanceThreshold ?? 0);

    const { nextFlags, state, changed, crossed } = computeWalletFlags({
    preBalance: pre,
    postBalance: post,
    lowBalanceThreshold: thr,
    prevFlags: current.flags ?? null,
  });

  if (changed) {
  logFlagChangeHuman({
    fixerId,
    pre,
    post,
    thr,
    state,
    crossed,
    flags: nextFlags,
    currency: 'BOB', // o quítalo si no quieres mostrarlo
  });
}


  await adapter.updateWalletById(fixerId, {
    balance: post,
    flags: nextFlags,
  });

  return { preBalance: pre, postBalance: post, threshold: thr, state, flags: nextFlags };
}
