import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Interface untuk tipe data serapan anggaran
interface SerapanAnggaranItem {
  id: number;
  unit_kerja_id: number;
  bulan: string;
  pagu_anggaran: number;
  realisasi_pengeluaran: number;
  created_at?: Date;
  updated_at?: Date;
  users?: {
    alias: string;
  };
}

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

// Fungsi sort berdasarkan urutan bulan
const sortByBulanUrutan = (data: SerapanAnggaranItem[]): SerapanAnggaranItem[] =>
  [...data].sort((a, b) => getBulanUrutan(a.bulan) - getBulanUrutan(b.bulan));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ambil unit_kerja_id dari query atau body
  const unit_kerja_id =
    typeof req.query.unit_kerja_id === 'string' ? req.query.unit_kerja_id :
    typeof req.body.unit_kerja_id === 'string' ? req.body.unit_kerja_id :
    typeof req.body.unit_kerja_id === 'number' ? req.body.unit_kerja_id.toString() : null;

  console.log('API Serapan - Method:', req.method);
  console.log('API Serapan - Query:', req.query);
  console.log('API Serapan - Body:', req.body);
  console.log('API Serapan - unit_kerja_id:', unit_kerja_id);

  try {
    if (req.method === 'GET') {
      if (!unit_kerja_id) {
        // GET all: tanpa unit_kerja_id
        const allDataRaw = await prisma.serapan_anggaran.findMany({
          include: {
            users: {
              select: { alias: true }
            }
          }
        });
        if (!allDataRaw.length) {
          return res.status(200).json([]);
        }
        // Group by alias (nama alias), bukan unit_kerja_id
        const grouped: { [key: string]: SerapanAnggaranItem[] } = {};
        allDataRaw.forEach(item => {
          const alias = item.users?.alias || '-';
          if (!grouped[alias]) grouped[alias] = [];
          grouped[alias].push({
            ...item,
            id: Number(item.id),
            pagu_anggaran: typeof item.pagu_anggaran === 'object' && 'toNumber' in item.pagu_anggaran ? item.pagu_anggaran.toNumber() : Number(item.pagu_anggaran),
            realisasi_pengeluaran: typeof item.realisasi_pengeluaran === 'object' && 'toNumber' in item.realisasi_pengeluaran ? item.realisasi_pengeluaran.toNumber() : Number(item.realisasi_pengeluaran),
            created_at: item.created_at ?? undefined,
            updated_at: item.updated_at ?? undefined,
            users: {
              alias: item.users?.alias ?? ''
            }
          });
        });
        // Untuk setiap alias, hitung summary dan detail
        const result = Object.entries(grouped).map(([alias, items]) => {
          const serapanData = sortByBulanUrutan(items);
          const paguAnggaran = Number(serapanData[0]?.pagu_anggaran) || 0;
          const totalRealisasi = serapanData.reduce((sum, item) => sum + Number(item.realisasi_pengeluaran), 0);
          const sisaAnggaran = paguAnggaran - totalRealisasi;
          const capaianRealisasi = paguAnggaran > 0 
            ? parseFloat(((totalRealisasi / paguAnggaran) * 100).toFixed(2)) 
            : 0;
          let realisasiKumulatif = 0;
          const detailPerBulan = serapanData.map(item => {
            const realisasi = Number(item.realisasi_pengeluaran);
            realisasiKumulatif += realisasi;
            const capaianPerBulan = item.pagu_anggaran > 0
              ? parseFloat(((realisasi / Number(item.pagu_anggaran)) * 100).toFixed(2))
              : 0;
            const capaianKumulatif = paguAnggaran > 0
              ? parseFloat(((realisasiKumulatif / paguAnggaran) * 100).toFixed(2))
              : 0;
            return {
              id: item.id,
              unit_kerja_id: item.unit_kerja_id, // tambahkan unit_kerja_id di detail
              bulan: item.bulan,
              pagu_anggaran: Number(item.pagu_anggaran),
              realisasi_pengeluaran: realisasi,
              capaian_realisasi: capaianPerBulan,
              capaian_realisasi_kumulatif: capaianKumulatif
            };
          });
          // Ambil unit_kerja_id dari data bulan terakhir (paling akhir setelah sort)
          const lastUnitKerjaId = serapanData.length ? serapanData[serapanData.length - 1].unit_kerja_id : null;
          return {
            unit_kerja: alias,
            unit_kerja_id: lastUnitKerjaId, // tambahkan unit_kerja_id di summary
            pagu_anggaran: paguAnggaran,
            total_realisasi: totalRealisasi,
            sisa_anggaran: sisaAnggaran,
            capaian_realisasi: capaianRealisasi,
            detail_per_bulan: detailPerBulan
          };
        });
        return res.status(200).json(result);
      } else {
        // GET by unit_kerja_id
        const unitKerjaId = parseInt(unit_kerja_id, 10);
        if (isNaN(unitKerjaId)) {
          return res.status(400).json({ error: 'unit_kerja_id harus berupa angka' });
        }
        const serapanDataRaw = await prisma.serapan_anggaran.findMany({
          where: {
            unit_kerja_id: unitKerjaId,
          },
          include: {
            users: {
              select: { alias: true }
            }
          }
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

        const serapanData = sortByBulanUrutan(
          serapanDataRaw.map(item => ({
            ...item,
            pagu_anggaran: typeof item.pagu_anggaran === 'object' && 'toNumber' in item.pagu_anggaran ? item.pagu_anggaran.toNumber() : Number(item.pagu_anggaran),
            realisasi_pengeluaran: typeof item.realisasi_pengeluaran === 'object' && 'toNumber' in item.realisasi_pengeluaran ? item.realisasi_pengeluaran.toNumber() : Number(item.realisasi_pengeluaran),
            created_at: item.created_at ?? undefined,
            updated_at: item.updated_at ?? undefined,
            users: {
              alias: item.users?.alias ?? ''
            }
          }))
        );

        const paguAnggaran = Number(serapanData[0]?.pagu_anggaran) || 0;
        const totalRealisasi = serapanData.reduce((sum, item) => sum + Number(item.realisasi_pengeluaran), 0);
        const sisaAnggaran = paguAnggaran - totalRealisasi;
        const capaianRealisasi = paguAnggaran > 0 
          ? parseFloat(((totalRealisasi / paguAnggaran) * 100).toFixed(2)) 
          : 0;

        let realisasiKumulatif = 0;
        const detailPerBulan = serapanData.map(item => {
          const realisasi = Number(item.realisasi_pengeluaran);
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
    }

    // POST & DELETE tetap butuh unit_kerja_id
    if ((req.method === 'POST' || req.method === 'DELETE') && !unit_kerja_id) {
      return res.status(400).json({ error: 'unit_kerja_id diperlukan' });
    }    if (req.method === 'POST') {
      const { bulan, pagu_anggaran, realisasi_pengeluaran } = req.body;

      if (!bulan || pagu_anggaran === undefined || realisasi_pengeluaran === undefined) {
        return res.status(400).json({ message: "Semua field diperlukan" });
      }

      // Konversi unit_kerja_id ke integer
      const unitKerjaIdInt = parseInt(unit_kerja_id, 10);
      if (isNaN(unitKerjaIdInt)) {
        return res.status(400).json({ message: "unit_kerja_id harus berupa angka valid" });
      }

      const parsedPagu = parseFloat(pagu_anggaran);
      const parsedRealisasi = parseFloat(realisasi_pengeluaran);

      if (isNaN(parsedPagu) || isNaN(parsedRealisasi)) {
        return res.status(400).json({ message: "Pagu dan realisasi harus berupa angka" });
      }

      if (parsedRealisasi > parsedPagu) {
        return res.status(400).json({ message: "Realisasi tidak boleh melebihi pagu" });
      }

      const existingData = await prisma.serapan_anggaran.findFirst({
        where: {
          unit_kerja_id: unitKerjaIdInt,
          bulan
        },
        include: {
          users: {
            select: { alias: true }
          }
        }
      });

      if (existingData) {
        await prisma.serapan_anggaran.update({
          where: { id: existingData.id },
          data: {
            pagu_anggaran: parsedPagu,
            realisasi_pengeluaran: parsedRealisasi,
            updated_at: new Date()
          }
        });
      } else {
        await prisma.serapan_anggaran.create({
          data: {
            unit_kerja_id: unitKerjaIdInt,
            bulan,
            pagu_anggaran: parsedPagu,
            realisasi_pengeluaran: parsedRealisasi,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      return res.status(201).json({ message: "Data berhasil disimpan" });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ message: "ID tidak valid" });
      }

      const parsedId = parseInt(id, 10);
      const existingEntry = await prisma.serapan_anggaran.findFirst({
        where: { 
          id: parsedId, 
          unit_kerja_id: unit_kerja_id 
        },
        include: {
          users: {
            select: { alias: true }
          }
        }
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

