import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // pastikan path benar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;

  // Validasi bahwa unit_kerja_id adalah string
  if (typeof unit_kerja_id !== 'string') {
    return res.status(400).json({ error: 'unit_kerja_id tidak valid' });
  }

  const unitKerjaId = parseInt(unit_kerja_id, 10); // Gunakan nama yang konsisten
  if (isNaN(unitKerjaId)) {
    return res.status(400).json({ error: 'unit_kerja_id harus berupa angka' });
  }

  try {
    if (req.method === 'GET') {      // Ambil semua penyelenggaraan berdasarkan unit_kerja_id
      const data = await prisma.penyelenggaraan.findMany({
        where: {
          unit_kerja_id: unitKerjaId, // Gunakan unitKerjaId bukan id
        },
        include: {
          jenis_bangkom_non_pelatihan: {
            select: {
              id: true,
              jenis_bangkom: true,
            },
          },
          users: {
            select: {
              id: true,
              unit_kerja: true,
            },
          },
        },
        orderBy: {
          tanggal: 'desc', // Tambahkan ordering berdasarkan tanggal terbaru
        },
      });

      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const {
        namaKegiatan,
        tanggal,
        jenis_bangkom_id,
        jumlahPeserta,
      } = req.body;

      // Validasi data
      if (!namaKegiatan || !tanggal || !jenis_bangkom_id || !jumlahPeserta) {
        return res.status(400).json({ 
          message: "Semua field diperlukan: namaKegiatan, tanggal, jenis_bangkom_id, jumlahPeserta" 
        });
      }

      // Validasi tipe data
      const parsedJenisBangkomId = parseInt(jenis_bangkom_id);
      const parsedJumlahPeserta = parseInt(jumlahPeserta);

      if (isNaN(parsedJenisBangkomId) || isNaN(parsedJumlahPeserta)) {
        return res.status(400).json({ 
          message: "jenis_bangkom_id dan jumlahPeserta harus berupa angka" 
        });
      }

      if (parsedJumlahPeserta < 1) {
        return res.status(400).json({ 
          message: "jumlahPeserta harus lebih dari 0" 
        });
      }

      // Validasi tanggal
      const parsedTanggal = new Date(tanggal);
      if (isNaN(parsedTanggal.getTime())) {
        return res.status(400).json({ 
          message: "Format tanggal tidak valid" 
        });
      }

      const created = await prisma.penyelenggaraan.create({
        data: {
          namaKegiatan,
          tanggal: parsedTanggal,
          jenis_bangkom_id: parsedJenisBangkomId,
          jumlahPeserta: parsedJumlahPeserta,
          unit_kerja_id: unitKerjaId,
        },
        include: {
          jenis_bangkom_non_pelatihan: {
            select: {
              id: true,
              jenis_bangkom: true,
            },
          },
          users: {
            select: {
              id: true,
              unit_kerja: true,
            },
          },
        }
      });

      return res.status(201).json(created);
    }

    // Method tidak didukung
    return res.status(405).json({
      message: `Method ${req.method} tidak didukung`
    });

  } catch (error) {
    console.error('Error in penyelenggaraan API:', error);

    // Type guard for Prisma error
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const prismaError = error as { code?: string; message?: string };

      if (prismaError.code === 'P2002') {
        return res.status(400).json({
          message: "Data dengan kombinasi ini sudah ada"
        });
      }

      if (prismaError.code === 'P2003') {
        return res.status(400).json({
          message: "Foreign key constraint failed. Pastikan jenis_bangkom_id dan unit_kerja_id valid"
        });
      }

      return res.status(500).json({
        message: "Terjadi kesalahan server",
        error: process.env.NODE_ENV === 'development' ? prismaError.message : 'Internal server error'
      });
    }

    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
    });
  }
}