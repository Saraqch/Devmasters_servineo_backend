import { Request, Response } from 'express';
import { changeJobStatus, completeJobWithValidation } from '../services/jobs.service';

export const changeToPendingPaymentController = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    await changeJobStatus(jobId, 'pending payment');

    res.status(200).json({ message: 'Job status updated to pending payment' });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Job not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const completeJobController = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { location } = req.body;

    await completeJobWithValidation(jobId, location);

    res.status(200).json({ message: 'Job completed successfully' });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
