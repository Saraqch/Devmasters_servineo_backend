import { Request, Response } from 'express';
import { JobOffer } from '../models/job_offer.model';
import { bucket } from '../config/firebase.config';

export const createJobOffer = async (req: Request, res: Response) => {
  try {
    const files = (req as any).files as any[];
    const imageUrls: string[] = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const fileName = `job-offers/${Date.now()}-${Math.round(Math.random() * 1000)}-${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        return new Promise<string>((resolve, reject) => {
          blobStream.on('error', (error: any) => {
            reject(error);
          });

          blobStream.on('finish', async () => {
            // Make the file public
            await fileUpload.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            resolve(publicUrl);
          });

          blobStream.end(file.buffer);
        });
      });

      const urls = await Promise.all(uploadPromises);
      imageUrls.push(...urls);
    }

    const user = (req as any).user;
    if (!user || user.role !== 'fixer') {
      return res.status(403).json({ message: 'Access denied. Only fixers can create job offers.' });
    }

    const jobOfferData = {
      ...req.body,
      fixerId: user._id,
      fixerName: user.name,
      fixerWhatsapp: user.telefono, // Assuming telefono is the whatsapp number
      images: imageUrls,
    };

    const jobOffer = new JobOffer(jobOfferData);
    await jobOffer.save();
    res.status(201).json(jobOffer);
  } catch (error) {
    console.error('Error creating job offer:', error);
    res.status(400).json({ message: 'Error creating job offer', error });
  }
};

export const getAllJobOffers = async (req: Request, res: Response) => {
  try {
    const { category, city } = req.query;
    const filter: any = {};

    if (category) {
      filter.categories = category;
    }

    if (city) {
      filter.city = city;
    }

    const jobOffers = await JobOffer.find(filter);
    res.status(200).json(jobOffers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job offers', error });
  }
};

export const getJobOffersByFixerId = async (req: Request, res: Response) => {
  try {
    const { fixerId } = req.params;
    const jobOffers = await JobOffer.find({ fixerId });
    res.status(200).json(jobOffers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job offers', error });
  }
};

export const updateJobOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jobOffer = await JobOffer.findByIdAndUpdate(id, req.body, { new: true });
    if (!jobOffer) {
      return res.status(404).json({ message: 'Job offer not found' });
    }
    res.status(200).json(jobOffer);
  } catch (error) {
    res.status(400).json({ message: 'Error updating job offer', error });
  }
};

export const deleteJobOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const jobOffer = await JobOffer.findByIdAndDelete(id);
    if (!jobOffer) {
      return res.status(404).json({ message: 'Job offer not found' });
    }
    res.status(200).json({ message: 'Job offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job offer', error });
  }
};
