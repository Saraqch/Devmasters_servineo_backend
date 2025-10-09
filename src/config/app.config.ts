// src/config/app.config.ts
//import dotenv from 'dotenv';
//dotenv.config();
// import {ENV} from "./env.config"; // Removed to avoid conflict
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
      ENV.MONGO_PASS!
    )}@${ENV.MONGO_HOST}/${ENV.MONGO_DB}?retryWrites=true&w=majority&appName=${ENV.MONGO_DB}`,
  // ... otras configuraciones
};

//export const appConfig = {
  //port: process.env.PORT || 8000,

//  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/servineo_db',

 // nodeEnv: process.env.NODE_ENV || 'development',

 // jwtSecret: process.env.JWT_SECRET || 'servineo-jwt-secret-super-seguro-2024',
  //jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  //corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  //frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  //backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',
//};

// Validaciones críticas
//if (!process.env.MONGO_URI && appConfig.nodeEnv === 'production') {
  //throw new Error('MONGO_URI es requerida en producción');
//}

//if (!process.env.JWT_SECRET && appConfig.nodeEnv === 'production') {
//  throw new Error('JWT_SECRET es requerida en producción');
//}

//if (appConfig.nodeEnv === 'production' && !process.env.CORS_ORIGIN) {
//  throw new Error('CORS_ORIGIN es requerida en producción');
//}

// Función helper
//export const getFrontendUrl = (path = ''): string => {
 // return `${appConfig.frontendUrl}${path}`;
//};

// Opciones de CORS
//export const corsOptions = {
  //origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    //if (!origin) return callback(null, true);
//
  //  const allowedOrigins = [
    //  appConfig.corsOrigin,
      //appConfig.frontendUrl,
      //'http://localhost:3000',
 //     'http://127.0.0.1:3000',
   // ];

    //if (allowedOrigins.includes(origin)) {
      //callback(null, true);
  //  } else {
      //callback(new Error('No permitido por CORS'), false);
    //}
  //},
 // credentials: true,
  //methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
 // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//};
