import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { subtask_id } = req.query;

  if (!subtask_id || Array.isArray(subtask_id)) {
    return res.status(400).json({ error: 'Invalid subtask_id parameter' });
  }

  const subtaskId = parseInt(subtask_id, 10);
  if (isNaN(subtaskId)) {
    return res.status(400).json({ error: 'subtask_id must be a valid number' });
  }

  try {
    if (req.method === 'GET') {
      // Get review by subtask_id
      const review = await prisma.subtask_reviews.findUnique({
        where: { subtask_id: subtaskId },
        include: {
          subtasks: {
            include: {
              pegawai: {
                select: {
                  id: true,
                  nama: true,
                  nip: true,
                  jabatan: true
                }
              },
              tasks: {
                select: {
                  id: true,
                  title: true,
                  owner: true
                }
              }
            }
          }
        }
      });

      if (!review) {
        await prisma.$disconnect();
        return res.status(404).json({ error: 'Review not found' });
      }

      await prisma.$disconnect();
      return res.status(200).json(review);

    } else if (req.method === 'POST') {
      // Create new review
      const { rating, reviewed_by } = req.body;

      if (!rating || !reviewed_by) {
        await prisma.$disconnect();
        return res.status(400).json({ error: 'rating and reviewed_by are required' });
      }

      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        await prisma.$disconnect();
        return res.status(400).json({ error: 'rating must be a number between 1 and 5' });
      }

      if (typeof reviewed_by !== 'string' || reviewed_by.length > 18) {
        await prisma.$disconnect();
        return res.status(400).json({ error: 'reviewed_by must be a string with max 18 characters' });
      }

      // Check if subtask exists
      const subtask = await prisma.subtasks.findUnique({
        where: { id: subtaskId }
      });

      if (!subtask) {
        await prisma.$disconnect();
        return res.status(404).json({ error: 'Subtask not found' });
      }

      // Check if review already exists
      const existingReview = await prisma.subtask_reviews.findUnique({
        where: { subtask_id: subtaskId }
      });

      if (existingReview) {
        await prisma.$disconnect();
        return res.status(409).json({ error: 'Review already exists for this subtask' });
      }

      // Create new review
      const newReview = await prisma.subtask_reviews.create({
        data: {
          subtask_id: subtaskId,
          rating: rating,
          reviewed_by: reviewed_by,
          reviewed_at: new Date()
        },
        include: {
          subtasks: {
            include: {
              pegawai: {
                select: {
                  id: true,
                  nama: true,
                  nip: true,
                  jabatan: true
                }
              },
              tasks: {
                select: {
                  id: true,
                  title: true,
                  owner: true
                }
              }
            }
          }
        }
      });

      await prisma.$disconnect();
      return res.status(201).json(newReview);

    } else if (req.method === 'PUT') {
      // Update existing review
      const { rating, reviewed_by } = req.body;

      if (rating && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
        await prisma.$disconnect();
        return res.status(400).json({ error: 'rating must be a number between 1 and 5' });
      }

      if (reviewed_by && (typeof reviewed_by !== 'string' || reviewed_by.length > 18)) {
        await prisma.$disconnect();
        return res.status(400).json({ error: 'reviewed_by must be a string with max 18 characters' });
      }

      // Check if review exists
      const existingReview = await prisma.subtask_reviews.findUnique({
        where: { subtask_id: subtaskId }
      });

      if (!existingReview) {
        await prisma.$disconnect();
        return res.status(404).json({ error: 'Review not found' });
      }

      // Update review
      const updatedReview = await prisma.subtask_reviews.update({
        where: { subtask_id: subtaskId },
        data: {
          ...(rating && { rating }),
          ...(reviewed_by && { reviewed_by }),
          reviewed_at: new Date() // Update timestamp
        },
        include: {
          subtasks: {
            include: {
              pegawai: {
                select: {
                  id: true,
                  nama: true,
                  nip: true,
                  jabatan: true
                }
              },
              tasks: {
                select: {
                  id: true,
                  title: true,
                  owner: true
                }
              }
            }
          }
        }
      });

      await prisma.$disconnect();
      return res.status(200).json(updatedReview);

    } else if (req.method === 'DELETE') {
      // Delete review
      const existingReview = await prisma.subtask_reviews.findUnique({
        where: { subtask_id: subtaskId }
      });

      if (!existingReview) {
        await prisma.$disconnect();
        return res.status(404).json({ error: 'Review not found' });
      }

      await prisma.subtask_reviews.delete({
        where: { subtask_id: subtaskId }
      });

      await prisma.$disconnect();
      return res.status(204).end();

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      await prisma.$disconnect();
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('Error in subtask_reviews API:', error);
    await prisma.$disconnect();
    return res.status(500).json({ error: 'Internal server error' });
  }
}