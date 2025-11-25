// src/Innosys/routes/invoice.routes.ts
import { Router } from 'express';
import { getInvoices, getInvoiceDetail } from '../controllers/invoice.controller';

const router = Router();

// /api/invoices
router.get('/', getInvoices);

// /api/invoices/:invoiceId
router.get('/:invoiceId', getInvoiceDetail);

export default router;
