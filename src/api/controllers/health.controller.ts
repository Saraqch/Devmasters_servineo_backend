import { Request, Response } from 'express';

export function getHealthStatusController(_req: Request, res: Response) {
  return res.status(200).json({
    healt: "i'm alive",
    status: 200,
    message: 'ok',
  });
}
