import { Router } from 'express';
import * as portfolioController from '../controllers/portfolio.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Portfolio
 *   description: Gestión de portafolio visual
 */

/**
 * @swagger
 * /portfolio:
 *   post:
 *     summary: Agregar item al portafolio
 *     tags: [Portfolio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fixerId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [image, youtube]
 *               url:
 *                 type: string
 *               youtubeUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item creado
 */
router.post('/', portfolioController.createPortfolioItem);

/**
 * @swagger
 * /portfolio/fixer/{fixerId}:
 *   get:
 *     summary: Obtener portafolio de un fixer
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: fixerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de items del portafolio
 */
router.get('/fixer/:fixerId', portfolioController.getPortfolioByFixerId);

/**
 * @swagger
 * /portfolio/{id}:
 *   put:
 *     summary: Actualizar item de portafolio
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Item actualizado
 */
router.put('/:id', portfolioController.updatePortfolioItem);

/**
 * @swagger
 * /portfolio/{id}:
 *   delete:
 *     summary: Eliminar item del portafolio
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item eliminado
 */
router.delete('/:id', portfolioController.deletePortfolioItem);

export default router;
