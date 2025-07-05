// pages/api/bigger/[unit_kerja_id]/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;

  if (!unit_kerja_id || Array.isArray(unit_kerja_id)) {
    return res.status(400).json({ error: 'unit_kerja_id is required' });
  }

  const parsedUnitKerjaId = parseInt(unit_kerja_id);
  
  if (isNaN(parsedUnitKerjaId)) {
    return res.status(400).json({ error: 'unit_kerja_id must be a valid number' });
  }

  if (req.method === 'GET') {
    try {
      console.log('Fetching bigger_score data for unit_kerja_id:', parsedUnitKerjaId);
      
      const data = await prisma.bigger_score.findMany({
        where: {
          unit_kerja_id: parsedUnitKerjaId,
        },
        orderBy: {
          tahun: 'desc',
        },
      });

      // Convert BigInt values to strings to avoid serialization issues
      const serializedData = data.map(item => ({
        ...item,
        id: item.id ? item.id.toString() : null,
        unit_kerja_id: item.unit_kerja_id ? Number(item.unit_kerja_id) : null,
        // Convert any other potential BigInt fields
        dampak_luas: item.dampak_luas ? Number(item.dampak_luas) : null,
        kolaborasi: item.kolaborasi ? Number(item.kolaborasi) : null,
        penerima_manfaat: item.penerima_manfaat ? Number(item.penerima_manfaat) : null,
        jangkauan_wilayah: item.jangkauan_wilayah ? Number(item.jangkauan_wilayah) : null,
        total_skor: item.total_skor ? Number(item.total_skor) : null,
      }));

      console.log('Found data:', serializedData);
      return res.status(200).json(serializedData);
    } catch (err) {
      console.error('Database error:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch data', 
        detail: err instanceof Error ? err.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.stack : '') : undefined
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
