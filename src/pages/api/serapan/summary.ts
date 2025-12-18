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

    // Daftar nama bulan dalam bahasa Indonesia untuk urutan
    const monthOrder = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Cari bulan terakhir dari data yang ada
    const availableMonths = [...new Set(allData.map(item => item.bulan))];
    const latestMonth = availableMonths
      .filter(month => monthOrder.includes(month))
      .sort((a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a))[0];

    if (!latestMonth) {
      return res.status(200).json({
        total_pagu: 0,
        total_realisasi: 0,
        total_sisa: 0,
        unit_kerja_penginput: []
      });
    }    // Filter data hanya untuk bulan terakhir (untuk total_pagu)
    const latestMonthData = allData.filter(item => item.bulan === latestMonth);

    // Hitung total_pagu dari bulan terakhir saja
    const totalPagu = latestMonthData.reduce((sum, item) => {
      const pagu = typeof item.pagu_anggaran === 'object' && 'toNumber' in item.pagu_anggaran
        ? item.pagu_anggaran.toNumber()
        : Number(item.pagu_anggaran);
      return sum + pagu;
    }, 0);

    // Hitung total_realisasi dari semua bulan
    const totalRealisasi = allData.reduce((sum, item) => {
      const realisasi = typeof item.realisasi_pengeluaran === 'object' && 'toNumber' in item.realisasi_pengeluaran
        ? item.realisasi_pengeluaran.toNumber()
        : Number(item.realisasi_pengeluaran);
      return sum + realisasi;
    }, 0);

    // Kumpulkan unit kerja penginput dari semua data
    const unitKerjaPenginput = [...new Set(allData.map(item => item.users?.alias || 'Tidak Diketahui'))];

    const total_sisa = totalPagu - totalRealisasi;

    return res.status(200).json({
      total_pagu: totalPagu,
      total_realisasi: totalRealisasi,
      total_sisa,
      unit_kerja_penginput: unitKerjaPenginput,
      bulan_terakhir: latestMonth // Menambahkan info bulan terakhir yang digunakan
    });
  } catch (error) {
    console.error("Error fetching serapan summary:", error);
    return res.status(500).json({ message: "Terjadi kesalahan saat mengambil data summary" });
  }
}

