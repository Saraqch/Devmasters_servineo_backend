
import { User } from '../models/user.model';
import { Request, Response } from 'express';
import type { IUserProfile } from '../types/job-offer'; // ← Ruta correcta en backend


export const getUserProfileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role !== 'fixer') {
      return res.status(400).json({ message: 'El usuario no es un fixer' });
    }

    const response: IUserProfile = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        urlPhoto: user.fixerProfile?.photoUrl,
      },
      profile: {
        ci: user.fixerProfile?.ci || '',
        photoUrl: user.fixerProfile?.photoUrl,
        location: user.fixerProfile?.location
          ? {
              lat: user.fixerProfile.location.lat,
              lng: user.fixerProfile.location.lng,
              address: undefined,
            }
          : null,
        services: (user.fixerProfile?.services || []).map((svcId: string) => ({
          id: svcId,
          name: svcId
            .replace('svc-', '')
            .replace('-', ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase()),
        })),
        selectedServiceIds: user.fixerProfile?.services || [],
        paymentMethods: (user.fixerProfile?.payments || []).map((type: string) => ({
          type,
        })),
        experiences: (user.fixerProfile?.experiences || []).map((exp: any) => ({
          id: exp.id,
          title: exp.title,
          description: exp.description || '',
          years: exp.years,
          images: [],
        })),
        vehicle: {
          hasVehicle: user.fixerProfile?.hasVehicle || false,
          type: user.fixerProfile?.vehicleType,
          details: undefined,
        },
        terms: { accepted: true },
        additionalInfo: {
          bio: user.fixerProfile?.descripcion || 'Técnico con experiencia en reparaciones del hogar.',
        },
        status: 'approved',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error en getUserProfileById:', error);
    res.status(500).json({ error: error.message });
  }
};

// === GET /api/user-profiles/role/:role ===
export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role }).select('-password -__v');

    const response: IUserProfile[] = users.map(user => ({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        urlPhoto: user.fixerProfile?.photoUrl,
      },
      profile: {
        ci: user.fixerProfile?.ci || '',
        photoUrl: user.fixerProfile?.photoUrl,
        location: user.fixerProfile?.location
          ? {
              lat: user.fixerProfile.location.lat,
              lng: user.fixerProfile.location.lng,
            }
          : null,
        services: (user.fixerProfile?.services || []).map((svcId: string) => ({
          id: svcId,
          name: svcId
            .replace('svc-', '')
            .replace('-', ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase()),
        })),
        selectedServiceIds: user.fixerProfile?.services || [],
        paymentMethods: (user.fixerProfile?.payments || []).map((type: string) => ({ type })),
        experiences: [],
        vehicle: { hasVehicle: user.fixerProfile?.hasVehicle || false },
        terms: { accepted: true },
        additionalInfo: { bio: '' },
        status: 'approved',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }));

    res.json(response);
  } catch (error: any) {
    console.error('Error en getUsersByRole:', error);
    res.status(500).json({ error: error.message });
  }
};

// === PATCH /api/user-profiles/:id/bio ===
export const updateBio = async (
  req: Request<{ id: string }, {}, { bio: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: { 'fixerProfile.bio': bio } },
      { new: true }
    ).select('-password -__v');

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Bio actualizada',
      bio,
    });
  } catch (error: any) {
    console.error('Error en updateBio:', error);
    res.status(400).json({ error: error.message });
  }
};

// === PATCH /api/user-profiles/:id/convert-fixer ===
export const convertToFixer = async (
  req: Request<{ id: string }, {}, { profile: any }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { profile } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          role: 'fixer',
          fixerProfile: profile,
        },
      },
      { new: true }
    ).select('-password -__v');

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Error en convertToFixer:', error);
    res.status(400).json({ error: error.message });
  }
};

// === (Opcional) GET /api/user-profiles/ ===
export const getUserProfiles = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password -__v');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// === (Opcional) POST /api/user-profiles/ ===
export const createUserProfile = async (
  req: Request<{}, {}, any>,
  res: Response
) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};