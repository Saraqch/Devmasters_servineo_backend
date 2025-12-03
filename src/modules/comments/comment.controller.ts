import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getCommentsByFixer as getCommentsByFixerService } from './comment.service';
export const getCommentsByFixer = async (req: Request, res: Response) => {
  const fixerId = req.params.fixerId;
  if (!fixerId) {
    return res.status(400).json({ error: 'Missing fixer ID' });
  }
  if (!(ObjectId.isValid(fixerId) && new ObjectId(fixerId).toHexString() === fixerId)) {
    return res.status(422).json({ error: 'Invalid fixer ID format' });
  }

  try {
    const comments = await getCommentsByFixerService(fixerId);
    if (comments.length === 0) {
      return res.status(404).json({ message: 'No comments found' });
    }
    // Put anomity if requesterId is not linked (DB IS TRASH)
    // I think we can remove this once the db is cleaned
    comments.map((comment) => {
      if (!comment.requesterName) {
        comment.requesterName = 'Anónimo';
      }
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};
export const getPositiveCommentsByFixer = async (req: Request, res: Response) => {
  const fixerId = req.params.fixerId;
  if (!fixerId) {
    return res.status(400).json({ error: 'Missing fixer ID' });
  }
  if (!(ObjectId.isValid(fixerId) && new ObjectId(fixerId).toHexString() === fixerId)) {
    return res.status(422).json({ error: 'Invalid fixer ID format' });
  }

  try {
    const comments = await getCommentsByFixerService(fixerId);
    if (comments.length === 0) {
      return res.status(404).json({ message: 'No comments found' });
    }
    // Put anomity if requesterId is not linked (DB IS TRASH)
    // I think we can remove this once the db is cleaned
    comments.map((comment) => {
      if (!comment.requesterName) {
        comment.requesterName = 'Anónimo';
      }
    });

    const threeStarComments = comments.filter((comment) => comment.rating === 3);
    const twoStarComments = comments.filter((comment) => comment.rating === 2);

    const positiveComments = [...threeStarComments, ...twoStarComments];

    res.status(200).json(positiveComments);
  } catch (error) {
    console.error('Error fetching positive comments:', error);
    res.status(500).json({ message: 'Error fetching positive comments' });
  }
};
export const getNegativeCommentsByFixer = async (req: Request, res: Response) => {
  const fixerId = req.params.fixerId;
  if (!fixerId) {
    return res.status(400).json({ error: 'Missing fixer ID' });
  }
  if (!(ObjectId.isValid(fixerId) && new ObjectId(fixerId).toHexString() === fixerId)) {
    return res.status(422).json({ error: 'Invalid fixer ID format' });
  }

  try {
    const comments = await getCommentsByFixerService(fixerId);
    if (comments.length === 0) {
      return res.status(404).json({ message: 'No comments found' });
    }
    // Put anomity if requesterId is not linked (DB IS TRASH)
    // I think we can remove this once the db is cleaned
    comments.map((comment) => {
      if (!comment.requesterName) {
        comment.requesterName = 'Anónimo';
      }
    });
    const oneStarComments = comments.filter((comment) => comment.rating === 1);
    const zeroStarComments = comments.filter((comment) => comment.rating === 0);

    const negativeComments = [...oneStarComments, ...zeroStarComments];

    res.status(200).json(negativeComments);
  } catch (error) {
    console.error('Error fetching negative comments:', error);
    res.status(500).json({ message: 'Error fetching negative comments' });
  }
};
