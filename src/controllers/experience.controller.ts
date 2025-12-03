import { Request, Response } from 'express';
import { Experience } from '../models/experience.model';

export const createExperience = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const experienceData = {
      ...req.body,
      fixerId: user.id,
    };
    const experience = new Experience(experienceData);
    await experience.save();
    res.status(201).json(experience);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la experiencia', error });
  }
};

export const getExperienceByFixerId = async (req: Request, res: Response) => {
  try {
    const { fixerId } = req.params;
    const experiences = await Experience.find({ fixerId });
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching experiences', error });
  }
};

export const updateExperience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const experience = await Experience.findOneAndUpdate(
      { _id: id, fixerId: user.id },
      req.body,
      { new: true }
    );
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    res.status(200).json(experience);
  } catch (error) {
    res.status(400).json({ message: 'Error updating experience', error });
  }
};

export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const experience = await Experience.findOneAndDelete({ _id: id, fixerId: user.id });
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }
    res.status(200).json({ message: 'Experience deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting experience', error });
  }
};
