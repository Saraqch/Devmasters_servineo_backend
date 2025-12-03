export const ENV = {
  MONGO_USER: process.env.MONGO_USER,
  MONGO_PASS: process.env.MONGO_PASS,
  MONGO_HOST: process.env.MONGO_HOST,
  MONGO_DB: process.env.MONGO_DB,
  MONGO_URI: process.env.MONGO_URI,
};

export const appConfig = {
  mongoUri:
    ENV.MONGO_URI ||
    `mongodb+srv://${encodeURIComponent(ENV.MONGO_USER!)}:${encodeURIComponent(
      ENV.MONGO_PASS!,
    )}@${ENV.MONGO_HOST}/${ENV.MONGO_DB}?retryWrites=true&w=majority&appName=${ENV.MONGO_DB}`,
  // ... otras configuraciones
};
