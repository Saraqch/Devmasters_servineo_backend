import { Router } from 'express';
import * as userUpgradeController from '../controllers/user_upgrade.controller';
import { upload } from '../config/multer.config';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: UserUpgrade
 *   description: Gestión de actualización de usuarios (Requester -> Fixer)
 */

/**
 * @swagger
 * /users/upgrade/{userId}:
 *   put:
 *     summary: Actualizar usuario a rol Fixer
 *     tags: [UserUpgrade]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               ci:
 *                 type: string
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: string
 *               vehiculo:
 *                 type: object
 *                 properties:
 *                   hasVehiculo:
 *                     type: boolean
 *                   tipoVehiculo:
 *                     type: string
 *               metodoPago:
 *                 type: object
 *                 properties:
 *                   hasEfectivo:
 *                     type: boolean
 *                   qr:
 *                     type: boolean
 *                   tarjetaCredito:
 *                     type: boolean
 *               acceptTerms:
 *                 type: boolean
 *               fixerProfile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Usuario actualizado a Fixer
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/upgrade/:userId', upload.single('fixerProfile'), userUpgradeController.upgradeToFixer);

export default router;
