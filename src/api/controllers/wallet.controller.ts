import Stripe from 'stripe';
import { Wallet } from '../../models/wallet.model';
import type { Request, Response } from "express";
import { User } from '../../models/userPayment.model';
import { Recharge } from '../../models/walletRecharge.model';

import 'dotenv/config';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: Falta STRIPE_SECRET_KEY en el .env');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 💳 Procesar pago y actualizar wallet
export const rechargeWallet = async (req: Request, res: Response) => {
  try {
    console.log('🔹 Entrada a rechargeWallet');

    const { userId, amount } = req.body;
    console.log('📥 Datos recibidos:', { userId, amount });

    const amountNumber = parseFloat(amount);
    if (!userId || !amountNumber || amountNumber <= 0) {
      console.warn('⚠️ Datos inválidos recibidos');
      return res.status(400).json({ message: 'Datos inválidos' });
    }

    // 1️⃣ Buscar al usuario
    const user = await User.findById(userId);
    console.log('🔹 Usuario encontrado:', user);
    if (!user) {
      console.warn('⚠️ Usuario no encontrado');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2️⃣ Buscar el wallet por users_id
    let wallet = await Wallet.findOne({ users_id: user._id });
    if (!wallet) {
      console.log('⚠️ Wallet no encontrado, creando uno nuevo...');
      wallet = new Wallet({
        users_id: user._id,
        balance: 0,
        currency: 'BOB',
        status: 'active',
        minimumBalance: 0,
        lowBalanceThreshold: 50,
      });
      await wallet.save();
      console.log('✅ Nuevo wallet creado:', wallet);
    } else {
      console.log('🔹 Wallet encontrado:', wallet);
    }

    // 3️⃣ Crear PaymentIntent en Stripe
    console.log('🔹 Creando PaymentIntent en Stripe');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountNumber * 100),
      currency: 'bob',
      description: `Recarga de wallet para usuario ${user._id}`,
      metadata: { userId: user._id.toString() },
    });
    console.log('✅ PaymentIntent creado:', paymentIntent.id);

    // 4️⃣ Actualizar balance
    wallet.balance += amountNumber;
    await wallet.save();
    console.log(`💰 Wallet de ${user.name} actualizado. Nuevo saldo: ${wallet.balance}`);

    // 5️⃣ Intentar registrar la recarga

    console.log('WalletID', wallet._id);
    console.log('monto para recarga', amountNumber);
    try {
      console.log('🔹 Creando registro de recarga...');

      const newRecharge = new Recharge({
        walletId: wallet._id,
        amount: amountNumber,
      });
      await newRecharge.save();

      console.log('✅ Registro de recarga creado:', newRecharge);

      return res.status(200).json({
        message: 'Recarga completada exitosamente',
        clientSecret: paymentIntent.client_secret,
        wallet,
        recharge: newRecharge, // opcional, para devolver el registro
      });
    } catch (rechargeError: any) {
      console.error('❌ Error al guardar el registro de recarga:', rechargeError);
      // No revertimos el balance, pero notificamos el error
      return res.status(500).json({
        message: 'Recarga procesada pero fallo al registrar la transacción',
        error: rechargeError instanceof Error ? rechargeError.message : String(rechargeError),
        wallet,
      });
    }

    
  } catch (error: any) {
    console.error('❌ Error al recargar wallet:', error);
    res.status(500).json({ message: 'Error interno', error: error instanceof Error ? error.message : String(error) });
  }
};
