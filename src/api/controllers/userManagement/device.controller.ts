
import { Request, Response } from "express";
import { Device } from "../../../models/divice.model";

export const registerDevice = async (req: Request, res: Response) => {
  try {
    const { userId, os } = req.body;

    if (!userId || !os) {
      return res.status(400).json({ message: "Faltan datos del dispositivo." });
    }

    const devices = await Device.find({ userId });

    // Limitar a 3 dispositivos
    if (devices.length >= 3) {
      return res.status(403).json({ message: "Máximo de 3 dispositivos alcanzado." });
    }

    // Buscar si ya existe un registro con el mismo OS
    const existingDevice = devices.find((d) => d.os === os);

    if (existingDevice) {
      existingDevice.lastLogin = new Date();
      await existingDevice.save();
      return res.json({ message: "Dispositivo actualizado." });
    }

    await Device.create({ userId, os, lastLogin: new Date() });
    res.json({ message: "Dispositivo registrado exitosamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno al registrar dispositivo." });
  }
};

export const getDevices = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const devices = await Device.find({ userId });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener dispositivos." });
  }
};