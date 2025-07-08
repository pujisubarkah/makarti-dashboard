import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: `Method ${req.method} tidak diizinkan` });
  }

  try {
    const allData = await prisma.serapan_anggaran.findMany({
      include: {
        users: {
          select: {
            alias: true
          }
        }
      }
    });

    if (!allData.length) {
      return res.status(200).json({
        total_pagu: 0,
        total_realisasi: 0,
        total_sisa: 0,
        unit_kerja_penginput: []
      });
    }

    const total = allData.reduce(
      (acc, item) => {
        const pagu = typeof item.pagu_anggaran === 'object' && 'toNumber' in item.pagu_anggaran
          ? item.pagu_anggaran.toNumber()
          : Number(item.pagu_anggaran);
        const realisasi = typeof item.realisasi_pengeluaran === 'object' && 'toNumber' in item.realisasi_pengeluaran
          ? item.realisasi_pengeluaran.toNumber()
          : Number(item.realisasi_pengeluaran);

        acc.total_pagu += pagu;
        acc.total_realisasi += realisasi;

        const alias = item.users?.alias || 'Tidak Diketahui';
        if (!acc.unit_kerja_penginput.includes(alias)) {
          acc.unit_kerja_penginput.push(alias);
        }

        return acc;
      },
      { total_pagu: 0, total_realisasi: 0, unit_kerja_penginput: [] as string[] }
    );

    const total_sisa = total.total_pagu - total.total_realisasi;

    return res.status(200).json({
      total_pagu: total.total_pagu,
      total_realisasi: total.total_realisasi,
      total_sisa,
      unit_kerja_penginput: total.unit_kerja_penginput
    });

  } catch (error) {
    console.error("Error fetching serapan summary:", error);
    return res.status(500).json({ message: "Terjadi kesalahan saat mengambil data summary" });
  }
}
