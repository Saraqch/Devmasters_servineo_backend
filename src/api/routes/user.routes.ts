import { Router } from "express";
import {  listUsers , getUserById} from "../controllers/user.controller";
import { postDescriptionFixer } from "../../controllers/user.controller";
import router from "./health.routes";
const routerUser = Router();

routerUser.get("/users", listUsers);
routerUser.get("/:id", getUserById); 
routerUser.post('/:id/description', postDescriptionFixer);
export default routerUser;
