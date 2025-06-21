import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Helper function untuk urutan bulan
const getBulanUrutan = (bulan: string): number => {
  const urutanBulan = {
    'Januari': 1,
    'Februari': 2,
    'Maret': 3,
    'April': 4,
    'Mei': 5,
    'Juni': 6,
    'Juli': 7,
    'Agustus': 8,
    'September': 9,
    'Oktober': 10,
    'November': 11,
    'Desember': 12
  };
  return urutanBulan[bulan as keyof typeof urutanBulan] || 0;
};

// Fungsi sort berdasarkan urutan bulan kalender
const sortByBulanUrutan = (data: any[]) =>
  [...data].sort((a, b) => getBulanUrutan(a.bulan) - getBulanUrutan(b.bulan));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { unit_kerja_id } = req.query;

  if (typeof unit_kerja_id !== 'string') {
    return res.status(400).json({ error: 'unit_kerja_id tidak valid' });
  }

  const unitKerjaId = parseInt(unit_kerja_id, 10);
  if (isNaN(unitKerjaId)) {
    return res.status(400).json({ error: 'unit_kerja_id harus berupa angka' });
  }

  try {
    if (req.method === 'GET') {
      const serapanDataRaw = await prisma.serapan_anggaran.findMany({
        where: {
          unit_kerja_id: unitKerjaId,
        },
      });

      if (!serapanDataRaw.length) {
        return res.status(200).json({
          pagu_anggaran: 0,
          total_realisasi: 0,
          sisa_anggaran: 0,
          capaian_realisasi: 0,
          detail_per_bulan: []
        });
      }

      const serapanData = sortByBulanUrutan(serapanDataRaw);

      // Ambil paguAnggaran sebagai Number
      const paguAnggaran = Number(serapanData[0]?.pagu_anggaran) || 0;

      // Hitung total realisasi dengan benar sebagai Number
      const totalRealisasi = serapanData.reduce((sum, item) => {
        const realisasi = Number(item.realisasi_pengeluaran || 0);
        return sum + realisasi;
      }, 0);

      const sisaAnggaran = paguAnggaran - totalRealisasi;

      const capaianRealisasi = paguAnggaran > 0 
        ? parseFloat(((totalRealisasi / paguAnggaran) * 100).toFixed(2)) 
        : 0;

      let realisasiKumulatif = 0;

      const detailPerBulan = serapanData.map(item => {
        const realisasi = Number(item.realisasi_pengeluaran || 0);
        realisasiKumulatif += realisasi;

        const capaianPerBulan = item.pagu_anggaran > 0
          ? parseFloat(((realisasi / Number(item.pagu_anggaran)) * 100).toFixed(2))
          : 0;

        const capaianKumulatif = paguAnggaran > 0
          ? parseFloat(((realisasiKumulatif / paguAnggaran) * 100).toFixed(2))
          : 0;

        return {
          id: item.id,
          bulan: item.bulan,
          pagu_anggaran: Number(item.pagu_anggaran),
          realisasi_pengeluaran: realisasi,
          capaian_realisasi: capaianPerBulan,
          capaian_realisasi_kumulatif: capaianKumulatif
        };
      });

      return res.status(200).json({
        pagu_anggaran: paguAnggaran,
        total_realisasi: totalRealisasi,
        sisa_anggaran: sisaAnggaran,
        capaian_realisasi: capaianRealisasi,
        detail_per_bulan: detailPerBulan
      });
    }

    if (req.method === 'POST') {
      const { bulan, pagu_anggaran, realisasi_pengeluaran } = req.body;

      if (!bulan || pagu_anggaran === undefined || realisasi_pengeluaran === undefined) {
        return res.status(400).json({ message: "Semua field diperlukan" });
      }

      const parsedPagu = parseFloat(pagu_anggaran);
      const parsedRealisasi = parseFloat(realisasi_pengeluaran);

      if (isNaN(parsedPagu) || isNaN(parsedRealisasi)) {
        return res.status(400).json({ message: "Pagu dan realisasi harus berupa angka" });
      }

      if (parsedRealisasi > parsedPagu) {
        return res.status(400).json({ message: "Realisasi tidak boleh melebihi pagu" });
      }

      // Cek apakah sudah ada entri bulan ini
      const existingData = await prisma.serapan_anggaran.findFirst({
        where: {
          unit_kerja_id: unitKerjaId,
          bulan
        }
      });

      let updatedData;

      if (existingData) {
        updatedData = await prisma.serapan_anggaran.update({
          where: { id: existingData.id },
          data: {
            pagu_anggaran: parsedPagu,
            realisasi_pengeluaran: parsedRealisasi,
            updated_at: new Date()
          }
        });
      } else {
        updatedData = await prisma.serapan_anggaran.create({
          data: {
            unit_kerja_id: unitKerjaId,
            bulan,
            pagu_anggaran: parsedPagu,
            realisasi_pengeluaran: parsedRealisasi,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      // Fetch ulang data agar konsisten
      const allDataRaw = await prisma.serapan_anggaran.findMany({
        where: { unit_kerja_id: unitKerjaId }
      });

      const allData = sortByBulanUrutan(allDataRaw);

      const paguAnggaran = Number(allData[0]?.pagu_anggaran) || 0;

      const totalRealisasi = allData.reduce((sum, item) => {
        return sum + Number(item.realisasi_pengeluaran || 0);
      }, 0);

      const sisaAnggaran = paguAnggaran - totalRealisasi;

      const capaianRealisasi = paguAnggaran > 0
        ? parseFloat(((totalRealisasi / paguAnggaran) * 100).toFixed(2))
        : 0;

      let realisasiKumulatif = 0;

      const detail_per_bulan = allData.map(item => {
        const realisasi = Number(item.realisasi_pengeluaran || 0);
        realisasiKumulatif += realisasi;

        return {
          id: item.id,
          bulan: item.bulan,
          pagu_anggaran: Number(item.pagu_anggaran),
          realisasi_pengeluaran: realisasi,
          capaian_realisasi: item.pagu_anggaran > 0
            ? parseFloat(((realisasi / Number(item.pagu_anggaran)) * 100).toFixed(2))
            : 0,
          capaian_realisasi_kumulatif: paguAnggaran > 0
            ? parseFloat(((realisasiKumulatif / paguAnggaran) * 100).toFixed(2))
            : 0
        };
      });

      return res.status(201).json({
        pagu_anggaran: paguAnggaran,
        total_realisasi: totalRealisasi,
        sisa_anggaran: sisaAnggaran,
        capaian_realisasi: capaianRealisasi,
        detail_per_bulan
      });
    }

    if (req.method === 'PUT') {
      const { id, bulan, pagu_anggaran, realisasi_pengeluaran } = req.body;

      if (!id || !bulan || pagu_anggaran === undefined || realisasi_pengeluaran === undefined) {
        return res.status(400).json({ message: "ID, bulan, pagu, dan realisasi diperlukan" });
      }

      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        return res.status(400).json({ message: "ID harus berupa angka" });
      }

      const existingEntry = await prisma.serapan_anggaran.findUnique({
        where: { id: parsedId, unit_kerja_id: unitKerjaId }
      });

      if (!existingEntry) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      const parsedPagu = parseFloat(pagu_anggaran);
      const parsedRealisasi = parseFloat(realisasi_pengeluaran);

      if (isNaN(parsedPagu) || isNaN(parsedRealisasi)) {
        return res.status(400).json({ message: "Pagu dan realisasi harus berupa angka" });
      }

      if (parsedRealisasi > parsedPagu) {
        return res.status(400).json({ message: "Realisasi tidak boleh melebihi pagu" });
      }

      await prisma.serapan_anggaran.update({
        where: { id: parsedId },
        data: {
          bulan,
          pagu_anggaran: parsedPagu,
          realisasi_pengeluaran: parsedRealisasi,
          updated_at: new Date()
        }
      });

      const allDataRaw = await prisma.serapan_anggaran.findMany({
        where: { unit_kerja_id: unitKerjaId }
      });

      const allData = sortByBulanUrutan(allDataRaw);

      const paguAnggaran = Number(allData[0]?.pagu_anggaran || 0);
      const totalRealisasi = allData.reduce((sum, item) => sum + Number(item.realisasi_pengeluaran || 0), 0);
      const sisaAnggaran = paguAnggaran - totalRealisasi;
      const capaianRealisasi = paguAnggaran > 0
        ? parseFloat(((totalRealisasi / paguAnggaran) * 100).toFixed(2))
        : 0;

      let realisasiKumulatif = 0;

      const detail_per_bulan = allData.map(item => {
        const realisasi = Number(item.realisasi_pengeluaran || 0);
        realisasiKumulatif += realisasi;

        return {
          id: item.id,
          bulan: item.bulan,
          pagu_anggaran: Number(item.pagu_anggaran),
          realisasi_pengeluaran: realisasi,
          capaian_realisasi: item.pagu_anggaran > 0
            ? parseFloat(((realisasi / Number(item.pagu_anggaran)) * 100).toFixed(2))
            : 0,
          capaian_realisasi_kumulatif: paguAnggaran > 0
            ? parseFloat(((realisasiKumulatif / paguAnggaran) * 100).toFixed(2))
            : 0
        };
      });

      return res.status(200).json({
        pagu_anggaran: paguAnggaran,
        total_realisasi: totalRealisasi,
        sisa_anggaran: sisaAnggaran,
        capaian_realisasi: capaianRealisasi,
        detail_per_bulan
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ message: "ID tidak valid" });
      }

      const parsedId = parseInt(id, 10);

      const existingEntry = await prisma.serapan_anggaran.findUnique({
        where: { id: parsedId, unit_kerja_id: unitKerjaId }
      });

      if (!existingEntry) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      await prisma.serapan_anggaran.delete({
        where: { id: parsedId }
      });

      return res.status(204).end(); // No content
    }

    return res.status(405).json({ message: `Method ${req.method} tidak diizinkan` });
  } catch (error) {
    console.error('Error in serapan API:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan server',
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
    });
  }
}