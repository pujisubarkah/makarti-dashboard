// pages/api/bigger/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('Fetching all bigger_score data...');
      
      const data = await prisma.bigger_score.findMany({
        orderBy: {
          tahun: 'desc',
        },
      });

      console.log('Found data:', data);

      const serializedData = data.map(item => ({
        ...item,
        id: item.id?.toString() ?? null,
        unit_kerja_id: item.unit_kerja_id ?? null,
        dampak_luas: item.dampak_luas ?? 0,
        kolaborasi: item.kolaborasi ?? 0,
        penerima_manfaat: item.penerima_manfaat ?? 0,
        jangkauan_wilayah: item.jangkauan_wilayah ?? 0,
        total_skor: item.total_skor ?? 0,
      }));

      // Hitung rata-rata
      const total = serializedData.length;
      const avg = {
        dampak_luas: 0,
        kolaborasi: 0,
        penerima_manfaat: 0,
        jangkauan_wilayah: 0,
        total_skor: 0,
      };

      if (total > 0) {
        serializedData.forEach(item => {
          avg.dampak_luas += item.dampak_luas;
          avg.kolaborasi += item.kolaborasi;
          avg.penerima_manfaat += item.penerima_manfaat;
          avg.jangkauan_wilayah += item.jangkauan_wilayah;
          avg.total_skor += item.total_skor;
        });

        // Rata-rata
        (['dampak_luas', 'kolaborasi', 'penerima_manfaat', 'jangkauan_wilayah', 'total_skor'] as const).forEach(key => {
          avg[key] = parseFloat((avg[key] / total).toFixed(2));
        });
      }

      res.status(200).json({
        data: serializedData,
        average: avg,
        total_items: total,
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch bigger_score data',
        detail: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
      });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
