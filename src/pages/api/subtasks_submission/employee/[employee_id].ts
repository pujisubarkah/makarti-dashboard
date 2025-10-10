import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { employee_id } = req.query;

  if (!employee_id || Array.isArray(employee_id)) {
    return res.status(400).json({ error: 'Invalid employee_id parameter' });
  }

  const employeeId = parseInt(employee_id, 10);
  if (isNaN(employeeId)) {
    return res.status(400).json({ error: 'employee_id must be a valid number' });
  }

  try {
    if (req.method === 'GET') {
      // Get all subtask submissions for a specific employee (assigned_to)
      const submissions = await prisma.subtask_submissions.findMany({
        where: {
          subtasks: {
            assigned_to: employeeId
          }
        },
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
        }
      });

      // Also get subtasks assigned to this employee (with or without submissions)
      const allSubtasks = await prisma.subtasks.findMany({
        where: {
          assigned_to: employeeId
        },
        include: {
          subtask_submissions: true,
          subtask_reviews: {
            select: {
              id: true,
              rating: true,
              reviewed_by: true,
              reviewed_at: true
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
          pegawai: {
            select: {
              id: true,
              nama: true,
              nip: true,
              jabatan: true,
              golongan: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return res.status(200).json({
        employee_id: employeeId,
        submissions: submissions,
        all_subtasks: allSubtasks,
        summary: {
          total_subtasks: allSubtasks.length,
          submitted_count: submissions.length,
          pending_count: allSubtasks.length - submissions.length,
          reviewed_count: allSubtasks.filter(st => st.subtask_reviews).length,
          completed_count: allSubtasks.filter(st => st.is_done).length
        }
      });

    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

  } catch (error) {
    console.error('Error in employee subtasks_submission API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}