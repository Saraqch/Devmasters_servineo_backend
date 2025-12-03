import { Router } from 'express';
import * as controller from './appointments.controller';

const router = Router();

router.get('/fixer/:fixerId', controller.getAppointmentsByFixerId);

export default router;
