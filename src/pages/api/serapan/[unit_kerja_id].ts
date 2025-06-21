import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { unit_kerja_id } = req.query;
  const unitId = parseInt(Array.isArray(unit_kerja_id) ? unit_kerja_id[0] : unit_kerja_id || '', 10);

  if (isNaN(unitId)) {
    return res.status(400).json({ error: 'unit_kerja_id tidak valid' });
  }

  if (req.method === 'GET') {
    try {
      // Ambil semua data serapan anggaran untuk unit_kerja_id tertentu
      const serapan = await prisma.serapan_anggaran.findMany({
        where: { unit_kerja_id: unitId },
        orderBy: { created_at: 'asc' }, // Penting: urutkan dari Januari ke Desember
      });

      if (!serapan.length) {
        return res.status(404).json({ error: 'Tidak ada data ditemukan' });
      }

      // Ambil nilai pagu_anggaran dari salah satu entri (asumsi sama untuk semua bulan)
      const paguAnggaran = Number(serapan[0].pagu_anggaran);

      // Hitung total realisasi
      const totalRealisasi = serapan.reduce((sum, item) => sum + Number(item.realisasi_pengeluaran), 0);

      // Hitung sisa anggaran
      const sisaAnggaran = paguAnggaran - totalRealisasi;

      // Hitung capaian realisasi (%)
      const capaianRealisasi = paguAnggaran > 0
        ? parseFloat(((totalRealisasi / paguAnggaran) * 100).toFixed(2))
        : 0;

      // Hitung capaian_realisasi_kumulatif per bulan
      let kumulatif = 0;

      const detailPerBulanDenganKumulatif = serapan.map(item => {
        const realisasiPengeluaran = Number(item.realisasi_pengeluaran);
        kumulatif += realisasiPengeluaran;

        return {
          id: item.id,
          bulan: item.bulan,
          realisasi_pengeluaran: realisasiPengeluaran,
          capaian_realisasi: parseFloat(((realisasiPengeluaran / paguAnggaran) * 100).toFixed(2)),
          capaian_realisasi_kumulatif: parseFloat(((kumulatif / paguAnggaran) * 100).toFixed(2)),
        };
      });

      // Kirim respons
      res.status(200).json({
        pagu_anggaran: paguAnggaran,
        total_realisasi: totalRealisasi,
        sisa_anggaran: sisaAnggaran,
        capaian_realisasi: capaianRealisasi,
        detail_per_bulan: detailPerBulanDenganKumulatif,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Gagal mengambil data serapan anggaran' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        bulan,
        pagu_anggaran,
        realisasi_pengeluaran,
      } = req.body;

      const newEntry = await prisma.serapan_anggaran.create({
        data: {
          bulan,
          pagu_anggaran,
          realisasi_pengeluaran,
          unit_kerja_id: unitId,
        },
      });

      res.status(201).json(newEntry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Gagal menambahkan data serapan anggaran' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Metode ${req.method} tidak diizinkan` });
  }
}