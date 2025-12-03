import { Router } from 'express';
import * as experienceController from '../controllers/experience.controller';
import { verifyJWT } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Experience
 *   description: Gestión de experiencia laboral
 */

/**
 * @swagger
 * /experiences:
 *   post:
 *     summary: Agregar experiencia laboral
 *     tags: [Experience]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fixerId:
 *                 type: string
 *               jobTitle:
 *                 type: string
 *               jobType:
 *                 type: string
 *               organization:
 *                 type: string
 *               isCurrent:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Experiencia creada
 */
router.post('/', verifyJWT, experienceController.createExperience);

/**
 * @swagger
 * /experiences/fixer/{fixerId}:
 *   get:
 *     summary: Obtener experiencia de un fixer
 *     tags: [Experience]
 *     parameters:
 *       - in: path
 *         name: fixerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de experiencias
 */
router.get('/fixer/:fixerId', experienceController.getExperienceByFixerId);

/**
 * @swagger
 * /experiences/{id}:
 *   put:
 *     summary: Actualizar experiencia
 *     tags: [Experience]
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
 *         description: Experiencia actualizada
 */
router.put('/:id', verifyJWT, experienceController.updateExperience);

/**
 * @swagger
 * /experiences/{id}:
 *   delete:
 *     summary: Eliminar experiencia
 *     tags: [Experience]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experiencia eliminada
 */
router.delete('/:id', verifyJWT, experienceController.deleteExperience);

export default router;
