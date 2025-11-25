type Flags = {
  needsLowAlert: boolean;
  needsCriticalAlert: boolean;
  updatedAt: Date | null;
  cooldownUntil: Date | null;
};

export function logFlagChangeHuman(opts: {
  fixerId: string;
  pre: number;
  post: number;
  thr: number;
  state: "ok" | "low" | "critical";
  crossed: boolean;
  flags: Flags;
  currency?: string; // "BOB" por defecto
}) {
  const { fixerId, pre, post, thr, state, crossed, flags, currency = "BOB" } = opts;

  const tag =
    state === "critical" ? "🛑 CRÍTICO" :
    state === "low"      ? "⚠️ BAJO"    :
                           "✅ OK";

  const fmt = (n: number) =>
    n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cooldown = flags.cooldownUntil
    ? new Date(flags.cooldownUntil).toLocaleString("es-BO")
    : "—";

  // Una sola línea clara y corta:
  console.log(
    `${tag} | fixer:${fixerId} | ${currency} ${fmt(pre)} → ${fmt(post)} (umbral ${fmt(thr)}) | cruce:${crossed ? "sí" : "no"} | low:${flags.needsLowAlert} crit:${flags.needsCriticalAlert} | cooldown:${cooldown}`
  );
}
