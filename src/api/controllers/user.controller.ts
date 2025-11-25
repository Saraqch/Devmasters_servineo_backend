import type { Request, Response } from "express";
import { User } from "../../models/userPayment.model";


// Listar todos los usuarios
export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find(); // obtiene todos los usuarios
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
