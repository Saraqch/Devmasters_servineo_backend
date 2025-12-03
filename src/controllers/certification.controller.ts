import { Request, Response } from 'express';
import { Certification } from '../models/certification.model';
import { bucket } from '../config/firebase.config';

export const createCertification = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== 'fixer') {
      return res.status(403).json({ message: 'Access denied. Only fixers can create certifications.' });
    }

    let credentialUrl = '';
    if ((req as any).file) {
      const file = (req as any).file;
      const fileName = `certifications/${Date.now()}-${Math.round(Math.random() * 1000)}-${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise<void>((resolve, reject) => {
        blobStream.on('error', (error: any) => reject(error));
        blobStream.on('finish', async () => {
          await fileUpload.makePublic();
          credentialUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve();
        });
        blobStream.end((req as any).file?.buffer);
      });
    }

    const certificationData = {
      ...req.body,
      fixerId: user._id,
      credentialUrl: credentialUrl || req.body.credentialUrl,
    };

    const certification = new Certification(certificationData);
    await certification.save();
    res.status(201).json(certification);
  } catch (error) {
    res.status(400).json({ message: 'Error creating certification', error });
  }
};

export const getCertificationsByFixerId = async (req: Request, res: Response) => {
  try {
    const { fixerId } = req.params;
    const certifications = await Certification.find({ fixerId });
    res.status(200).json(certifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certifications', error });
  }
};

export const updateCertification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const certification = await Certification.findByIdAndUpdate(id, req.body, { new: true });
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }
    res.status(200).json(certification);
  } catch (error) {
    res.status(400).json({ message: 'Error updating certification', error });
  }
};

export const deleteCertification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const certification = await Certification.findByIdAndDelete(id);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }
    res.status(200).json({ message: 'Certification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting certification', error });
  }
};
