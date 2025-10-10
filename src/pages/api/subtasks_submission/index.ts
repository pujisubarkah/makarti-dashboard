import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

interface WhereClause {
  subtasks?: {
    assigned_to?: number;
    task_id?: number;
  };
  is_revised?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Get all subtask submissions with optional filters
      const { 
        employee_id, 
        task_id, 
        is_revised, 
        limit = '50', 
        offset = '0'
      } = req.query;

      const whereClause: WhereClause = {};

      // Filter by employee (assigned_to)
      if (employee_id && !Array.isArray(employee_id)) {
        const empId = parseInt(employee_id, 10);
        if (!isNaN(empId)) {
          whereClause.subtasks = {
            ...whereClause.subtasks,
            assigned_to: empId
          };
        }
      }

      // Filter by task_id
      if (task_id && !Array.isArray(task_id)) {
        const tId = parseInt(task_id, 10);
        if (!isNaN(tId)) {
          whereClause.subtasks = {
            ...whereClause.subtasks,
            task_id: tId
          };
        }
      }

      // Filter by revision status
      if (is_revised && !Array.isArray(is_revised)) {
        whereClause.is_revised = is_revised === 'true';
      }

      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);

      const submissions = await prisma.subtask_submissions.findMany({
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
                  pilar: true,
                  progress: true
                }
              },
              subtask_reviews: {
                select: {
                  id: true,
                  rating: true,
                  reviewed_by: true,
                  reviewed_at: true
                }
              }
            }
          }
        },
        orderBy: {
          submitted_at: 'desc'
        },
        take: limitNum > 0 && limitNum <= 100 ? limitNum : 50,
        skip: offsetNum >= 0 ? offsetNum : 0
      });

      // Get total count for pagination
      const totalCount = await prisma.subtask_submissions.count({
        where: whereClause
      });

      return res.status(200).json({
        submissions,
        pagination: {
          total: totalCount,
          limit: limitNum,
          offset: offsetNum,
          has_more: totalCount > offsetNum + limitNum
        }
      });

    } else if (req.method === 'POST') {
      // Bulk create submissions (if needed)
      const { submissions } = req.body;

      if (!Array.isArray(submissions) || submissions.length === 0) {
        return res.status(400).json({ error: 'submissions array is required' });
      }

      // Validate each submission
      for (const submission of submissions) {
        if (!submission.subtask_id || !submission.file_upload) {
          return res.status(400).json({ 
            error: 'Each submission must have subtask_id and file_upload' 
          });
        }
      }

      // Create submissions
      const createdSubmissions = await prisma.$transaction(
        submissions.map((submission: { subtask_id: number; file_upload: string; komentar?: string }) => 
          prisma.subtask_submissions.create({
            data: {
              subtask_id: submission.subtask_id,
              file_upload: submission.file_upload,
              komentar: submission.komentar || null,
              submitted_at: new Date(),
              is_revised: false
            }
          })
        )
      );

      return res.status(201).json({
        created_count: createdSubmissions.length,
        submissions: createdSubmissions
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('Error in subtasks_submission index API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}