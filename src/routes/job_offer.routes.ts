import { Router } from 'express';
import * as jobOfferController from '../controllers/job_offer.controller';
import { upload } from '../config/multer.config';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: JobOffers
 *   description: Gestión de ofertas de trabajo de fixers
 */

/**
 * @swagger
 * /job-offers:
 *   post:
 *     summary: Crear una nueva oferta de trabajo
 *     tags: [JobOffers]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fixerId:
 *                 type: string
 *               fixerName:
 *                 type: string
 *               fixerWhatsapp:
 *                 type: string
 *               description:
 *                 type: string
 *               city:
 *                 type: string
 *               price:
 *                 type: number
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Oferta creada exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', upload.array('images', 5), jobOfferController.createJobOffer);

/**
 * @swagger
 * /job-offers:
 *   get:
 *     summary: Obtener todas las ofertas de trabajo
 *     tags: [JobOffers]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *     responses:
 *       200:
 *         description: Lista de todas las ofertas
 */
router.get('/', jobOfferController.getAllJobOffers);

/**
 * @swagger
 * /job-offers/fixer/{fixerId}:
 *   get:
 *     summary: Obtener ofertas de un fixer
 *     tags: [JobOffers]
 *     parameters:
 *       - in: path
 *         name: fixerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de ofertas
 */
router.get('/fixer/:fixerId', jobOfferController.getJobOffersByFixerId);

/**
 * @swagger
 * /job-offers/{id}:
 *   put:
 *     summary: Actualizar una oferta
 *     tags: [JobOffers]
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
 *         description: Oferta actualizada
 */
router.put('/:id', jobOfferController.updateJobOffer);

/**
 * @swagger
 * /job-offers/{id}:
 *   delete:
 *     summary: Eliminar una oferta
 *     tags: [JobOffers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Oferta eliminada
 */
router.delete('/:id', jobOfferController.deleteJobOffer);

export default router;
