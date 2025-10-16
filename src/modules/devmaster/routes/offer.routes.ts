import { Router } from 'express';
import { 
  getOffers, 
  getOffer, 
  filterOffersByFixerNameRange,
  filterOffersByCity,
  filterOffersByCategory,
  filterOffers 
} from '../controller/offer.controller';

const router = Router();

// Rutas de filtrado
router.get('/filter', filterOffers);                              // GET /offers/filter?range=A-C&city=La Paz&category=Fontanero
router.get('/filterByFixerNameRange', filterOffersByFixerNameRange); // GET /offers/filterByFixerNameRange?range=A-C
router.get('/filterByCity', filterOffersByCity);                  // GET /offers/filterByCity?city=La Paz
router.get('/filterByCategory', filterOffersByCategory);          // GET /offers/filterByCategory?category=Fontanero

// Rutas generales
router.get('/', getOffers);                                       // GET /offers
router.get('/:id', getOffer);                                     // GET /offers/:id

export default router;