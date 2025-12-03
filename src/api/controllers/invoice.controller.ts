// src/Innosys/controllers/invoice.controller.ts
// src/Innosys/controllers/invoice.controller.ts
import { Request, Response, NextFunction } from 'express';
import mongoose, { Document, Types } from 'mongoose';
import InvoiceModel from '../../models/Invoice.model';

// =================================================================
// INTERFAZ DEL DOCUMENTO DE FACTURA
// =================================================================
interface IDetailItem {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface InvoiceDocument extends Document {
  _id: Types.ObjectId;
  transactionId: string;
  requesterId: string;
  requesterName: string;
  date: Date;
  total: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'MXN';
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  items: IDetailItem[];
  notes: string;
}

// =================================================================
// OBTENER FACTURAS FILTRADAS POR requesterId Y STATUS = 'PAID'
// =================================================================
export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //si quieres que busque por el requesterId que quieres tienes que cambiar esta parte, Diego por ahora esta con ese
    //Id porque lo cree manualmente el base de datos con el formato que mande en el grupo, por cierto si quieres cambiarlo cambialo
    //a uno que no tenga la estructura anterior.
    const TEMPORARY_REQUESTER_ID = '60a12345b6c7d8e9f0a12345';

    const filter = {
      requesterId: TEMPORARY_REQUESTER_ID,
      status: 'PAID', // <-- Solo facturas pagadas
    };

    const invoices = (await InvoiceModel.find(filter)
      .select('transactionId requesterName date total currency status requesterId')
      .sort({ date: -1 })) as InvoiceDocument[];

    const formattedInvoices = invoices.map(invoice => ({
      id: invoice._id.toString(),
      transactionId: invoice.transactionId,
      requesterName: invoice.requesterName,
      date: invoice.date.toISOString().split('T')[0],
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      requesterId: invoice.requesterId,
    }));

    return res.status(200).json({ success: true, data: formattedInvoices });
  } catch (error) {
    next(error);
  }
};

// =================================================================
// OBTENER DETALLE COMPLETO DE UNA FACTURA POR ID
// =================================================================
export const getInvoiceDetail = async (req: Request, res: Response, next: NextFunction) => {
  const { invoiceId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
    return res.status(400).json({ success: false, message: 'ID de factura inválido.' });
  }

  try {
    const invoice = (await InvoiceModel.findById(invoiceId)) as InvoiceDocument | null;

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Factura no encontrada.' });
    }

    const formattedInvoice = {
      id: invoice._id.toString(),
      transactionId: invoice.transactionId,
      requesterId: invoice.requesterId,
      requesterName: invoice.requesterName,
      date: invoice.date.toISOString().split('T')[0],
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      items: invoice.items,
      notes: invoice.notes,
    };

    return res.status(200).json({ success: true, data: formattedInvoice });
  } catch (error) {
    next(error);
  }
};
