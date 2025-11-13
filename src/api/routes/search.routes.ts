import { Router } from 'express';
import {
  getSearches,
  createSearch,
  updateSearch,
  deleteSearch,
} from '../controllers/search.controller';
const router = Router();

router.get('/searches', getSearches);
router.post('/searches', createSearch);
router.patch('/searches', updateSearch);
router.delete('/searches', deleteSearch);

export default router;
