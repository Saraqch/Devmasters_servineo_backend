export const FEATURE_DEV_WALLET =
  process.env.FEATURE_DEV_WALLET === 'true' || process.env.ENABLE_DEV_WALLET === 'true';

export const FEATURE_SIM_PAYMENTS = process.env.FEATURE_SIM_PAYMENTS === 'true';
export const FEATURE_NOTIFICATIONS = process.env.FEATURE_NOTIFICATIONS === 'true'; // si ya la tienes, conserva
