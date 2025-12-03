import userProfileModel, { IUserProfile } from '../models/userProfile.model';
import { Request, Response } from 'express';
import { User } from '../models/user.model';

/**
 * Crea un nuevo UserProfile
 */
export const createUserProfile = async (
  req: Request<{}, {}, IUserProfile>,
  res: Response<IUserProfile | { error: string }>
) => {
  try {
    const userProfile = new userProfileModel(req.body);
    await userProfile.save();
    res.status(201).json(userProfile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Obtiene todos los UserProfiles
 */
export const getUserProfiles = async (
  _req: Request,
  res: Response<IUserProfile[] | { error: string }>
) => {
  try {
    const profiles = await userProfileModel.find();
    res.json(profiles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response<IUserProfile | { error: string }>
) => {
  try {
    const { id } = req.params;

    // Buscar por el id que se guarda en user.id durante el registro
    const userProfile = await userProfileModel.findOne({ 'user.id': id });

    if (!userProfile) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.status(200).json(userProfile);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateBio = async (
  req: Request<{ id: string }, {}, { bio: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;
    const updated = await userProfileModel.findOneAndUpdate(
      { 'user.id': id },
      { $set: { 'profile.additionalInfo.bio': bio } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUsersByRole = async (
  req: Request<{ role: string }>,
  res: Response
) => {
  try {
    const { role } = req.params;
    const users = await userProfileModel.find({ 'user.role': role });
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const convertToFixer = async (
  req: Request<{ id: string }, {}, { profile: any }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { profile } = req.body;

    console.log('convertToFixer called for ID:', id);
    console.log('Profile data:', JSON.stringify(profile, null, 2));

    // Map profile data to User model fields
    const updateData: any = {
      role: 'fixer',
      telefono: profile.telefono,
      ci: profile.ci,
      servicios: profile.services ? profile.services.map((s: any) => s.name) : [],
      vehiculo: profile.vehicle,
      metodoPago: profile.paymentMethods ? {
        hasEfectivo: profile.paymentMethods.some((p: any) => p.type === 'efectivo'),
        qr: profile.paymentMethods.some((p: any) => p.type === 'qr'),
        tarjetaCredito: profile.paymentMethods.some((p: any) => p.type === 'tarjeta'),
      } : undefined,
      workLocation: profile.location,
      acceptTerms: profile.terms?.accepted,
      fixerProfile: 'completed'
    };

    // Clean undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (error: any) {
    console.error('Error completo en convertToFixer:', error);

    let message = 'Error desconocido';
    if (error.name === 'CastError') {
      message = `ID inválido: ${error.value}`;
    } else if (error.name === 'ValidationError') {
      message = Object.values(error.errors).map((e: any) => e.message).join(', ');
    } else if (error.message) {
      message = error.message;
    }

    res.status(400).json({ error: message });
  }
};
