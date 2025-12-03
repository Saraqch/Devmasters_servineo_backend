import { Router } from 'express';
import { loginUsuario, loginGoogle } from "../../controllers/userManagement/login.controller";
import { forgotPassword, magicLogin } from "../../controllers/userManagement/forgot.controller";

const router = Router();

router.post('/login', loginUsuario);
router.post("/google", loginGoogle);

router.post("/forgot-password", forgotPassword);
router.get("/magic-login", magicLogin);

export default router;