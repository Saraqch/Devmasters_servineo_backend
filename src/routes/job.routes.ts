import { Router } from 'express';
import {
  getAllJobs,
  getJobsByFixer,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/job.controller';

const router = Router();

router.get('/', getAllJobs); // Todas las ofertas
router.get('/fixer/:fixerId', getJobsByFixer); // Ofertas de un fixer
router.post('/', createJob); // Crear oferta (fixer)
router.patch('/:jobId', updateJob); // Editar oferta (fixer dueño)
router.delete('/:jobId', deleteJob); // Eliminar oferta (fixer dueño)

export default router;