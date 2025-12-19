import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Ambil data users dengan role_id 1, 2, 3, atau 5 yang memiliki unit_kerja
      const users = await prisma.users.findMany({
        where: {
          role_id: {
            in: [1, 2, 3, 5]
          },
          unit_kerja: {
            not: null
          }
        },
        select: {
          id: true,
          unit_kerja: true
        },
        orderBy: {
          unit_kerja: 'asc'
        }
      });

      // Hilangkan duplikat unit_kerja (ambil yang pertama untuk setiap unit_kerja unik)
      const uniqueUnitKerja = Array.from(
        new Map(
          users
            .filter(u => u.unit_kerja)
            .map(u => [u.unit_kerja, { id: u.id, unit_kerja: u.unit_kerja }])
        ).values()
      );

      res.status(200).json(uniqueUnitKerja);
    } catch (error) {
      console.error('Error fetching unit_kerja:', error);
      res.status(500).json({ error: 'Gagal mengambil data unit kerja' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
