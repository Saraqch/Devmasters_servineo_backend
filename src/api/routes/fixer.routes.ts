import { Router } from 'express';
import { enableFixer } from '../controllers/fixer.controller';
import { getMyOffers } from '../controllers/fixer.controller';

const router = Router();

router.post('/enable', enableFixer); // POST http://localhost:8000/api/fixers/enable
router.get('/offers/my', getMyOffers); // GET http://localhost:8000/api/fixers/offers/my?userId=fixer-001

export default router;