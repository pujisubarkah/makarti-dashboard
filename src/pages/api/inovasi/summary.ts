import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

type MonthSummary = {
  month: string;
  count: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MonthSummary[] | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      // Ambil semua data inovasi dengan field 'tanggal'
      const inovasiList = await prisma.inovasi.findMany({
        select: {
          tanggal: true,
        },
      });

      // Objek untuk menyimpan jumlah inovasi per bulan
      const monthlySummary: Record<string, number> = {};

      // Proses pengelompokan per bulan
      inovasiList.forEach((item) => {
        // Pastikan tanggal tidak null
        if (!item.tanggal) return;

        const date = new Date(item.tanggal);
        const monthName = date.toLocaleString('default', { month: 'long' }); // e.g. "January"

        if (!monthlySummary[monthName]) {
          monthlySummary[monthName] = 0;
        }

        monthlySummary[monthName]++;
      });

      // Ubah ke format array agar mudah dibaca frontend
      const result: MonthSummary[] = Object.keys(monthlySummary).map((month) => ({
        month,
        count: monthlySummary[month],
      }));

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error fetching inovasi summary:', error);
      return res.status(500).json({ error: 'Gagal mengambil ringkasan inovasi per bulan.' });
    }
  }

  // Jika method tidak didukung
  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: `Method ${req.method} tidak diizinkan.` });
}

