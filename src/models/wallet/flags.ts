
export type WalletFlags = {
  /** true si 0 < balance <= lowBalanceThreshold */
  needsLowAlert: boolean;
  /** true si balance <= 0 (estado crítico) */
  needsCriticalAlert: boolean;
  /** cuándo se actualizaron estos flags */
  updatedAt: Date | null;
  /** evita spam hasta esta fecha/hora */
  cooldownUntil: Date | null;
};

export type ComputeFlagsParams = {
  /** saldo antes de la operación */
  preBalance: number;
  /** saldo después de la operación */
  postBalance: number;
  /** umbral de saldo bajo (ej. 50) */
  lowBalanceThreshold: number;
  /** flags previos (si existen en BD) */
  prevFlags?: WalletFlags | null;
  /** para tests; por defecto new Date() */
  now?: Date;
  /** ventana de enfriamiento; por defecto 24h */
  cooldownMs?: number;
};

export type ComputeFlagsResult = {
  /** flags a persistir en la BD */
  nextFlags: WalletFlags;
  /** cambió algo relevante vs prevFlags */
  changed: boolean;
  /** estado derivado del postBalance */
  state: "ok" | "low" | "critical";
  /** hubo cruce de umbral en esta operación */
  crossed: boolean;
};

/**
 * Reglas:
 * - critical: post <= 0 -> needsCriticalAlert=true (low=false)
 * - low:      0 < post <= thr -> needsLowAlert=true (critical=false)
 * - ok:       post > thr -> ambos false (resetea cooldown)
 * De-dup: enciende si hubo cruce de umbral o si venció cooldown.
 */
export function computeWalletFlags(p: ComputeFlagsParams): ComputeFlagsResult {
  const now = p.now ?? new Date();
  const cooldownMs = p.cooldownMs ?? 24 * 60 * 60 * 1000;
  const prev = p.prevFlags ?? {
    needsLowAlert: false,
    needsCriticalAlert: false,
    updatedAt: null,
    cooldownUntil: null,
  };

  const pre = Number(p.preBalance || 0);
  const post = Number(p.postBalance || 0);
  const thr = Number(p.lowBalanceThreshold || 0);

  const state: "ok" | "low" | "critical" =
    post <= 0 ? "critical" : post <= thr ? "low" : "ok";

  const crossedToCritical = pre > 0 && post <= 0;
  const crossedToLow = pre > thr && post <= thr;
  const crossed = crossedToCritical || crossedToLow;

  const inCooldown = !!(prev.cooldownUntil && now < prev.cooldownUntil);

  let needsCriticalAlert = prev.needsCriticalAlert;
  let needsLowAlert = prev.needsLowAlert;
  let updatedAt = prev.updatedAt;
  let cooldownUntil = prev.cooldownUntil;

  if (state === "critical") {
    if (crossedToCritical || !inCooldown) {
      needsCriticalAlert = true;
      needsLowAlert = false;
      updatedAt = now;
      cooldownUntil = new Date(now.getTime() + cooldownMs);
    }
  } else if (state === "low") {
    if (crossedToLow || !inCooldown) {
      needsLowAlert = true;
      needsCriticalAlert = false;
      updatedAt = now;
      cooldownUntil = new Date(now.getTime() + cooldownMs);
    }
  } else {
    // ok: resetea flags y cooldown
    needsCriticalAlert = false;
    needsLowAlert = false;
    updatedAt = now;
    cooldownUntil = null;
  }

  const nextFlags: WalletFlags = {
    needsLowAlert,
    needsCriticalAlert,
    updatedAt,
    cooldownUntil,
  };

  const changed =
    nextFlags.needsLowAlert !== prev.needsLowAlert ||
    nextFlags.needsCriticalAlert !== prev.needsCriticalAlert ||
    String(nextFlags.cooldownUntil) !== String(prev.cooldownUntil);

  return { nextFlags, changed, state, crossed };
}
