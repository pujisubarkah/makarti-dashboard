import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

interface WhereClause {
  reviewed_by?: string;
  rating?: {
    gte?: number;
    lte?: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all reviews with optional filters
      const { 
        reviewed_by, 
        rating_min, 
        rating_max,
        limit = '50', 
        offset = '0' 
      } = req.query;

      const whereClause: WhereClause = {};

      // Filter by reviewer
      if (reviewed_by && !Array.isArray(reviewed_by)) {
        whereClause.reviewed_by = reviewed_by;
      }

      // Filter by rating range
      if (rating_min && !Array.isArray(rating_min)) {
        const minRating = parseInt(rating_min, 10);
        if (!isNaN(minRating)) {
          whereClause.rating = { ...whereClause.rating, gte: minRating };
        }
      }

      if (rating_max && !Array.isArray(rating_max)) {
        const maxRating = parseInt(rating_max, 10);
        if (!isNaN(maxRating)) {
          whereClause.rating = { ...whereClause.rating, lte: maxRating };
        }
      }

      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);

      const reviews = await prisma.subtask_reviews.findMany({
        where: whereClause,
        include: {
          subtasks: {
            include: {
              pegawai: {
                select: {
                  id: true,
                  nama: true,
                  nip: true,
                  jabatan: true,
                  golongan: true
                }
              },
              tasks: {
                select: {
                  id: true,
                  title: true,
                  owner: true,
                  status: true,
                  pilar: true
                }
              }
            }
          }
        },
        orderBy: {
          reviewed_at: 'desc'
        },
        take: limitNum > 0 && limitNum <= 100 ? limitNum : 50,
        skip: offsetNum >= 0 ? offsetNum : 0
      });

      // Get total count for pagination
      const totalCount = await prisma.subtask_reviews.count({
        where: whereClause
      });

      // Calculate rating statistics
      const ratingStats = await prisma.subtask_reviews.aggregate({
        where: whereClause,
        _avg: { rating: true },
        _count: { rating: true },
        _min: { rating: true },
        _max: { rating: true }
      });

      return res.status(200).json({
        reviews,
        pagination: {
          total: totalCount,
          limit: limitNum,
          offset: offsetNum,
          has_more: totalCount > offsetNum + limitNum
        },
        statistics: {
          average_rating: ratingStats._avg.rating,
          total_reviews: ratingStats._count.rating,
          min_rating: ratingStats._min.rating,
          max_rating: ratingStats._max.rating
        }
      });

    } else if (req.method === 'POST') {
      // Bulk create reviews (if needed)
      const { reviews } = req.body;

      if (!Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({ error: 'reviews array is required' });
      }

      // Validate each review
      for (const review of reviews) {
        if (!review.subtask_id || !review.rating || !review.reviewed_by) {
          return res.status(400).json({ 
            error: 'Each review must have subtask_id, rating, and reviewed_by' 
          });
        }
        if (typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5) {
          return res.status(400).json({ 
            error: 'Each rating must be a number between 1 and 5' 
          });
        }
      }

      // Create reviews
      const createdReviews = await prisma.$transaction(
        reviews.map((review: { subtask_id: number; rating: number; reviewed_by: string }) => 
          prisma.subtask_reviews.create({
            data: {
              subtask_id: review.subtask_id,
              rating: review.rating,
              reviewed_by: review.reviewed_by,
              reviewed_at: new Date()
            }
          })
        )
      );

      return res.status(201).json({
        created_count: createdReviews.length,
        reviews: createdReviews
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('Error in subtask_reviews index API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}