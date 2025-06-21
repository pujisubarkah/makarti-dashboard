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

  try {
    if (req.method === 'GET') {
      const entry = await prisma.penyelenggaraan.findUnique({
        where: {
          id: entryId,
          unit_kerja_id: unitId,
        },
        select: {
          id: true,
          namaKegiatan: true,
          tanggal: true,
          jumlahPeserta: true,
          jenis_bangkom_non_pelatihan: {
            select: {
              jenis_bangkom: true,
            },
          },
          users: {
            select: {
              unit_kerja: true,
            },
          },
        },
      });

      if (!entry) {
        return res.status(404).json({ error: 'Data tidak ditemukan' });
      }

      return res.status(200).json(entry);
    }

    if (req.method === 'PUT') {
      const {
        namaKegiatan,
        tanggal,
        jenis_bangkom_id,
        jumlahPeserta,
        unit_kerja_id: bodyUnitKerjaId,
      } = req.body;

      const updatedEntry = await prisma.penyelenggaraan.update({
        where: {
          id: entryId,
          unit_kerja_id: unitId,
        },
        data: {
          namaKegiatan,
          tanggal: new Date(tanggal),
          jenis_bangkom_id,
          jumlahPeserta,
          unit_kerja_id: bodyUnitKerjaId ?? unitId,
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