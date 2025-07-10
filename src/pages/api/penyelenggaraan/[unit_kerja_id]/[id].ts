import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id, id } = req.query;

  // Validasi bahwa query param adalah string
  if (typeof unit_kerja_id !== 'string' || typeof id !== 'string') {
    return res.status(400).json({ error: 'unit_kerja_id atau id tidak valid' });
  }

  const unitId = parseInt(unit_kerja_id, 10);
  const entryId = parseInt(id, 10);

  if (isNaN(unitId) || isNaN(entryId)) {
    return res.status(400).json({ error: 'unit_kerja_id atau id harus berupa angka' });
  }

  try {    if (req.method === 'GET') {
      const entry = await prisma.penyelenggaraan.findUnique({
        where: {
          id: entryId,
          unit_kerja_id: unitId,
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
      });

      if (!entry) {
        return res.status(404).json({ error: 'Data tidak ditemukan' });
      }

      return res.status(200).json(entry);
    }if (req.method === 'PUT') {
      const {
        namaKegiatan,
        tanggal,
        jenis_bangkom_id,
        jumlahPeserta,
        unit_kerja_id: bodyUnitKerjaId,
        daftar_hadir, // jika ada
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

      const updatedEntry = await prisma.penyelenggaraan.update({
        where: {
          id: entryId,
          unit_kerja_id: unitId,
        },
        data: {
          namaKegiatan,
          tanggal: parsedTanggal,
          jenis_bangkom_id: parsedJenisBangkomId,
          jumlahPeserta: parsedJumlahPeserta,
          unit_kerja_id: bodyUnitKerjaId ?? unitId,
          daftar_hadir: daftar_hadir ?? null, // jika ada
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
      });

      return res.status(200).json(updatedEntry);
    }

    if (req.method === 'DELETE') {
      await prisma.penyelenggaraan.delete({
        where: {
          id: entryId,
          unit_kerja_id: unitId,
        },
      });

      return res.status(204).end(); // No content
    }

    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error: unknown) {
    console.error("API Error:", error);

    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return res.status(500).json({
      message: "Server error",
      error: errorMessage,
    });
  }
}