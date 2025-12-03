import mongoose from 'mongoose';
import { JobOffer } from '../models/job_offer.model';
import { Experience } from '../models/experience.model';
import { Certification } from '../models/certification.model';
import { Portfolio } from '../models/portfolio.model';
import dotenv from 'dotenv';

dotenv.config();

const verifyModels = async () => {
  try {
    console.log('Verifying models...');

    // We don't need to connect to DB to check schema validation, 
    // but we do need to check if models load without error.
    
    // Create dummy instances to check validation
    const jobOffer = new JobOffer({
      fixerId: new mongoose.Types.ObjectId(),
      fixerName: 'Test Fixer',
      fixerWhatsapp: '123456789',
      description: 'Test Description',
      city: 'Test City',
      price: 100,
      categories: ['Test'],
      images: ['http://example.com/image1.jpg'],
    });
    await jobOffer.validate();
    console.log('✅ JobOffer model valid');

    const experience = new Experience({
      fixerId: new mongoose.Types.ObjectId(),
      jobTitle: 'Test Job',
      jobType: 'Full-time',
      startDate: new Date(),
    });
    await experience.validate();
    console.log('✅ Experience model valid');

    const certification = new Certification({
      fixerId: new mongoose.Types.ObjectId(),
      name: 'Test Cert',
      institution: 'Test Inst',
      issueDate: new Date(),
    });
    await certification.validate();
    console.log('✅ Certification model valid');

    const portfolio = new Portfolio({
      fixerId: new mongoose.Types.ObjectId(),
      type: 'image',
      url: 'http://example.com/image.jpg',
    });
    await portfolio.validate();
    console.log('✅ Portfolio model valid');

    console.log('🎉 All models verified successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Model verification failed:', error);
    process.exit(1);
  }
};

verifyModels();
