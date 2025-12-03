import { Router } from 'express';
import * as ProfileController from './profile.controller';

const router = Router();

router.get('/profile/:id', ProfileController.getProfileData);

export default router;
