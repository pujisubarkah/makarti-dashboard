import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { unit_kerja_id } = req.query;

  if (req.method === 'GET') {
    const networkings = await prisma.networking.findMany({
      where: {
        unit_kerja_id: parseInt(unit_kerja_id as string),
      },
      include: {
        users: {
          select: {
            unit_kerja: true,
          },
        },
      },
    });

    const simplified = networkings.map((item) => ({
      id: item.id,
      instansi: item.instansi,
      jenis: item.jenis,
      status: item.status,
      catatan: item.catatan || null,
      unit_kerja: item.users?.unit_kerja || null,
    }));

    return res.status(200).json(simplified);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}