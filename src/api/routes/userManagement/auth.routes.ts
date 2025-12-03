import { Router } from 'express';
//import { loginUsuario } from './auth.controller';
import { loginUsuario, loginGoogle } from "../../controllers/userManagement/auth.controller";

const router = Router();

// POST /api/auth/login
router.post('/login', loginUsuario);
router.post("/google", loginGoogle);

export default router;