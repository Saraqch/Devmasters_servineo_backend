import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/db.config';
import HealthRoutes from './api/routes/health.routes';
import jobOfertRoutes from './api/routes/jobOfert.routes';
import newoffersRoutes from './api/routes/newOffers.routes';
import fixerRoutes from './api/routes/fixer.routes';
import activityRoutes from './api/routes/activities.routes';
import jobsRoutes from './api/routes/jobs.routes';
import searchRoutes from './api/routes/search.routes';
import trackingRoutes from './api/routes/tracking-appointments.routes';
import experienceRoutes from './routes/experience.routes';
import userProfileRoutes from './routes/userProfile.routes';
import userRoutes from './routes/user.routes';
import registrarDatosRouter from '../src/api/routes/userManagement/registrarDatos.routes';
import fotoPerfilRouter from '../src/api/routes/userManagement/fotoPerfil.routes';
import googleRouter from '../src/api/routes/userManagement/google.routes';
import ubicacionRouter from '../src/api/routes/userManagement/ubicacion.routes';
import authRouter from '../src/api/routes/userManagement/login.routes';
import modificarDatosRouter from '../src/api/routes/userManagement/modificarDatos.routes';
import nominatimRouter from '../src/api/routes/userManagement/sugerencias.routes';
import deviceRouter from '../src/api/routes/userManagement/device.routes';
import cambiarContrasenaRouter from '../src/api/routes/userManagement/editarContraseña.routes';
import cerrarSesionesRouter from '../src/api/routes/userManagement/cerrarSesiones.routes';
import ultimoCambioRouter from '../src/api/routes/userManagement/ultimoCambio.routes';
import githubAuthRouter from '../src/api/routes/userManagement/github.routes';
import discordRoutes from '../src/api/routes/userManagement/discord.routes';
import clienteRouter from '../src/api/routes/userManagement/cliente.routes';
import obtenerContrasenaRouter from '../src/api/routes/userManagement/obtener.routes';
import portfolioRoutes from '../src/routes/portfolio.routes';
import routerUser from './api/routes/user.routes';
import Search from './models/search.model';
import CardsRoutes from "./api/routes/card.routes";
import UsersRoutes from "./api/routes/user.routes"; 
import PaymentRoutes from "./api/routes/payment.routes";
import CashPayRoutes from './api/routes/cashpay.routes';
import BankAccountRoutes from './api/routes/BankAccount.routes';
import paymentsRouter from "./api/routes/paymentsQR.routes";
import PaymentCenterRoutes from './api/routes/paymentCenter.routes'; 
import myJobsPaymentRoutes from './api/routes/jobsPayment.routes';
import invoiceDetailRouter from './api/routes/invoice.routes'; 
import bankTransferRoutes from './api/routes/bankTransfer.routes';
import rechargeWallet from './api/routes/wallet.routes';
import { FEATURE_DEV_WALLET, FEATURE_SIM_PAYMENTS } from './models/featureFlags.model'; 
import { devWalletRouter } from './api/routes/dev-wallet.routes';
import { simPaymentsRouter } from './api/routes/sim-payments.routes';
import SudoersRouter from './modules/sudoers.routes';

const app = express();

app.use(
  cors({
    origin: [
      'https://devmasters-servineo-frontend-zk3q.vercel.app',
      'http://localhost:8080',
      'http://localhost:8081',
      'http://localhost:3000',
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api', HealthRoutes);
app.use('/api', searchRoutes);
app.use('/api/devmaster', jobOfertRoutes);
app.use('/api/newOffers', newoffersRoutes);
app.use('/api/fixers', fixerRoutes);
app.use('/api', activityRoutes);
app.use('/api', jobsRoutes);
app.use('/api/admin', trackingRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/controlC/google', googleRouter);
app.use('/api/controlC/ubicacion', ubicacionRouter);
app.use('/api/controlC/auth', authRouter);
app.use('/api/controlC/registro', registrarDatosRouter);
app.use('/api/user-profiles', userProfileRoutes);
app.use('/api/user', userRoutes);
app.use('/api/controlC/modificar-datos', modificarDatosRouter);
app.use('/api/controlC/sugerencias', nominatimRouter);
app.use('/api/controlC/cambiar-contrasena', cambiarContrasenaRouter);
app.use('/api/controlC/cerrar-sesiones', cerrarSesionesRouter);
app.use('/api/controlC/ultimo-cambio', ultimoCambioRouter);
app.use('/api/controlC/foto-perfil', fotoPerfilRouter);
app.use('/api/controlC/obtener-password', obtenerContrasenaRouter);
app.use('/auth', githubAuthRouter);
app.use('/auth', discordRoutes);
app.use('/api/controlC/cliente', clienteRouter);
app.use('/api/user', routerUser);

export const registerRoutes = (app: any) => {
  app.use('/devices', deviceRouter);
};
// --- TUS RUTAS (Añadidas) ---
app.use('/api', CardsRoutes);
app.use('/api', UsersRoutes);
app.use('/api', PaymentRoutes);
app.use('/api', BankAccountRoutes); 
app.use('/api/lab', CashPayRoutes);
app.use("/api", rechargeWallet); 
app.use('/api', myJobsPaymentRoutes); 
app.use('/api/transferencia-bancaria', bankTransferRoutes);
app.use('/api/v1/invoices', invoiceDetailRouter); 
app.use('/api/fixer/payment-center', PaymentCenterRoutes); 
app.use("/payments", paymentsRouter); 
app.use('/', SudoersRouter);

console.log('FEATURE_DEV_WALLET =', FEATURE_DEV_WALLET);
if (FEATURE_DEV_WALLET) {
  console.log('MOUNT /api/dev ✅');
  app.use('/api/dev', devWalletRouter);
}
if (FEATURE_SIM_PAYMENTS) {
  app.use('/api/sim', simPaymentsRouter);
}

app.use((req, res) => {
  console.log('Not found:', req.method, req.originalUrl);
  res.status(404).send({
    message: 'route not found',
  });
});

export default app;
