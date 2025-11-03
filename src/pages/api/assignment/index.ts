import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET /api/assignment (semua penugasan)
  if (req.method === 'GET') {
    try {
      const assignments = await prisma.event_assignments.findMany({
        include: {
          pegawai: true,
          event_schedule: true,
          event_roles: true,
        },
      });
      return res.status(200).json(assignments);
    } catch {
      await prisma.$disconnect();
      return res.status(500).json({ error: 'Gagal mengambil data penugasan' });
    }
  }

  // POST /api/assignment (tambah penugasan baru)
  if (req.method === 'POST') {
    const { event_id, employee_id, role_id, confirmed } = req.body;

    if (!event_id || !employee_id || !role_id) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    try {
      const newAssignment = await prisma.event_assignments.create({
        data: {
          event_id: parseInt(event_id),
          employee_id: parseInt(employee_id),
          role_id: parseInt(role_id),
          confirmed: confirmed ?? false,
        },
        include: {
          pegawai: true,
          event_schedule: true,
          event_roles: true,
        },
      });

      return res.status(201).json(newAssignment);
    } catch {
      await prisma.$disconnect();
      return res.status(500).json({ error: 'Gagal menambahkan penugasan' });
    }
  }

  // PUT /api/assignment (update banyak penugasan atau custom logic)
  if (req.method === 'PUT') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  // Jika method tidak didukung
  return res.status(405).json({ error: 'Method tidak diizinkan' });
}
