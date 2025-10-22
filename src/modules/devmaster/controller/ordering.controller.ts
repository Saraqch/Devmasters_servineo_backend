// src/modules/devmaster/controller/ordering.controller.ts
import { Request, Response } from 'express';
import { ORDER_OPTIONS } from '../types/ordering.types';

export function getOrderingOptions(_req: Request, res: Response) {
  const options = [
    {
      value: 'createdAt_desc',
      label: 'Más recientes',
      field: 'createdAt',
      direction: 'desc',
      icon: '🆕',
      group: 'Fecha',
      default: true,
    },
    {
      value: 'createdAt_asc',
      label: 'Más antiguos',
      field: 'createdAt',
      direction: 'asc',
      icon: '📅',
      group: 'Fecha',
    },
    {
      value: 'updatedAt_desc',
      label: 'Recién actualizados',
      field: 'updatedAt',
      direction: 'desc',
      icon: '🔄',
      group: 'Fecha',
    },
    {
      value: 'updatedAt_asc',
      label: 'Menos actualizados',
      field: 'updatedAt',
      direction: 'asc',
      icon: '⏱️',
      group: 'Fecha',
    },
    {
      value: 'whatsappNumber_asc',
      label: 'WhatsApp: menor a mayor',
      field: 'whatsappNumber',
      direction: 'asc',
      icon: '📱',
      group: 'Contacto',
    },
    {
      value: 'whatsappNumber_desc',
      label: 'WhatsApp: mayor a menor',
      field: 'whatsappNumber',
      direction: 'desc',
      icon: '📱',
      group: 'Contacto',
    },
    {
      value: 'title_asc',
      label: 'Título A-Z',
      field: 'title',
      direction: 'asc',
      icon: '🔤',
      group: 'Alfabético',
    },
    {
      value: 'title_desc',
      label: 'Título Z-A',
      field: 'title',
      direction: 'desc',
      icon: '🔤',
      group: 'Alfabético',
    },
    {
      value: 'price_asc',
      label: 'Precio: menor a mayor',
      field: 'price',
      direction: 'asc',
      icon: '💰',
      group: 'Precio',
    },
    {
      value: 'price_desc',
      label: 'Precio: mayor a menor',
      field: 'price',
      direction: 'desc',
      icon: '💰',
      group: 'Precio',
    },
  ];

  return res.json({
    success: true,
    options,
    default: ORDER_OPTIONS.MOST_RECENT,
  });
}