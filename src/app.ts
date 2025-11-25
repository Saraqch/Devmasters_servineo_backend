import express from 'express';
import cors from 'cors';
import HealthRoutes from './api/routes/health.routes';
import jobOfertRoutes from './api/routes/jobOfert.routes';
import newoffersRoutes from './api/routes/newOffers.routes';
import fixerRoutes from './api/routes/fixer.routes';
import activityRoutes from './api/routes/activities.routes';
import jobsRoutes from './api/routes/jobs.routes';
import searchRoutes from './api/routes/search.routes';
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

const app = express();


const allowedOrigins = [
  'https://devmasters-servineo-frontend-zk3q.vercel.app',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8000',
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por la política de CORS.'));
      }
    },
    credentials: true,
  }),
);
// --- FIN DE CORS ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', HealthRoutes);
app.use('/api/devmaster', jobOfertRoutes);
app.use('/api/newOffers', newoffersRoutes);
app.use('/api/fixers', fixerRoutes);
app.use('/api', activityRoutes);
app.use('/api', jobsRoutes);
app.use('/api', searchRoutes);

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