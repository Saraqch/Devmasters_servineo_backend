import { Router } from 'express';
import {
  getSearches,
  createSearch,
  updateSearch,
  deleteSearch,
  getLastWeekSearches,
  getLastMonthSearches,
  getLastYearSearches,
  getSearchesByDateRange,
} from '../controllers/search.controller';
const router = Router();

router.get('/searches', getSearches);
router.post('/searches', createSearch);
router.patch('/searches', updateSearch);
router.delete('/searches', deleteSearch);
router.get('/searches/semanal', getLastWeekSearches);
router.get('/searches/month', getLastMonthSearches);
router.get('/searches/year', getLastYearSearches);

export default router;
