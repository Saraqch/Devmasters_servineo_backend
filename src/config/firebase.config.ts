// src/config/firebase.config.ts
import * as admin from 'firebase-admin';

// ──────────────────────────────────────────────────
// OPCIÓN 1 (Recomendada para producción): usar cuenta de servicio JSON
// ──────────────────────────────────────────────────
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'conexia-400921.appspot.com',
    });
  } catch (error) {
    // Si no existe el JSON, pasa a la opción 2 (para desarrollo local)
    console.warn('firebase-service-account.json no encontrado → usando firebaseConfig del .env');

    // ──────────────────────────────────────────────────
    // OPCIÓN 2 (Solo desarrollo/local): usar las credenciales públicas
    // ──────────────────────────────────────────────────
    const firebaseConfig = {
        
    };

    admin.initializeApp({
      credential: admin.credential.applicationDefault(), // usa ADC o variables de entorno
      ...firebaseConfig,
      storageBucket: 'conexia-400921.appspot.com',
    });
  }
}

// Exportamos siempre lo mismo
export const db = admin.firestore();
export const storage = admin.storage();
export const bucket = storage.bucket();

// Configuración global recomendada para Firestore (mejor rendimiento)
db.settings({
  timestampsInSnapshots: true, // deprecated pero por si acaso
  ignoreUndefinedProperties: true,
});