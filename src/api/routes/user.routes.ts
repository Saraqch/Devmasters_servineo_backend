import { Router } from "express";
import {  listUsers } from "../controllers/user.controller";

const router = Router();

router.get("/users", listUsers);

export default router;
