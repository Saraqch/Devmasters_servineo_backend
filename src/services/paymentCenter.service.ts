import mongoose from 'mongoose';
// --- CAMBIO: Importa el modelo 'Payment' ---
import { Payment } from '../models/payment.model'; 
import { Wallet } from '../models/wallet.model';
// Ya no necesitamos 'Job' o 'Jobspay' aquí

/**
 * Obtiene las estadísticas de trabajos "Pagado" para un Fixer
 * LEYENDO DESDE LA COLECCIÓN 'payments'
 */
export const getPaymentCenterData = async (fixerId: string) => {
  const fixerObjectId = new mongoose.Types.ObjectId(fixerId);

  try {
    // --- CAMBIO: Usa 'Payment.aggregate' ---
    const stats = await Payment.aggregate([
      {
        // 1. Busca todos los pagos "paid" de este fixer
        $match: {
          fixerId: fixerObjectId,
          status: "paid" 
        }
      },
      {
        // 2. Agrupa los resultados
        $group: {
          _id: null, 
          // Suma el 'subTotal' (el monto antes de comisiones/IVA)
          totalGanado: { $sum: "$amount.subTotal" }, 
          // Cuenta el número de documentos (trabajos pagados)
          trabajosCompletados: { $sum: 1 } 
        }
      }
    ]);

    if (stats.length > 0) {
      // Devuelve: { _id: null, totalGanado: 1160, trabajosCompletados: 13 }
      return stats[0]; 
    } else {
      // Si no encuentra ninguno, devuelve 0
      return {
        _id: null,
        totalGanado: 0,
        trabajosCompletados: 0
      };
    }
  } catch (error) {
    console.error("Error al calcular estadísticas de 'payments':", error);
    throw new Error("Error al consultar los datos de pago.");
  }
};


/**
 * Busca una wallet por ID de usuario, o la crea si no existe.
 */
export const findOrCreateWalletByUserId = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    // 1. Intenta encontrar la wallet
    const wallet = await Wallet.findOne({ users_id: userObjectId });

    // 2. Si la wallet existe, devuélvela
    if (wallet) {
      console.log(`Wallet encontrada para el usuario: ${userId}`);
      return wallet;
    }

    // 3. Si no existe, créala con valores por defecto
    console.log(`No se encontró wallet para ${userId}, creando una nueva...`);
    const newWallet = new Wallet({
      users_id: userObjectId,
      balance: 0, 
      currency: 'BOB',
      status: 'active',
      minimumBalance: 0,
      lowBalanceThreshold: 50
    });

    // 4. Guarda la nueva wallet en la DB
    await newWallet.save();
    console.log(`Nueva wallet creada con ID: ${newWallet._id}`);
    
    return newWallet;

  } catch (error) {
    console.error("Error al buscar o crear la wallet:", error);
    throw new Error("Error al procesar la wallet del usuario.");
  }
};