import { Router } from 'express';
import { createBankAccount, deleteBankAccount } from '../controllers/bankAccount.controller';

const router = Router();

// POST /api/bank-accounts
// Ruta para registrar una nueva cuenta bancaria
router.post('/bank-accounts', createBankAccount);

router.delete('/bank-accounts/:fixerId', deleteBankAccount);

export default router;
