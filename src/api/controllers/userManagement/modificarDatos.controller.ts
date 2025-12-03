import { Request, Response } from "express";
import { obtenerDatosUsuarioService, actualizarDatosUsuarioService } from "../../../services/userManagement/modificarDatos.service";

export const obtenerDatosUsuario = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No autorizado" });

  const token = authHeader.split(" ")[1];
  try {
    const data = await obtenerDatosUsuarioService(token);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const actualizarDatosUsuario = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No autorizado" });

  const token = authHeader.split(" ")[1];
  const nuevosDatos = req.body;

  try {
    const result = await actualizarDatosUsuarioService(token, nuevosDatos);
    res.json(result);
  } catch (error: any) {
    // erro del manejo especifico para telefono duplicado o ya registrado
    if ((error as any).code=="PHONE_TAKEN"){
      return res.status(409).json({
            success:false,
            error:"PHONE_TAKEN",
            message:"El numero de telefono ya esta registrado por otro usuario",          
      });
      //por lo tanto da error 409 cuando ya existe el numero
    }

    //sino por defecto el error 400
    res.status(400).json({ message: error.message });
    
  }
};