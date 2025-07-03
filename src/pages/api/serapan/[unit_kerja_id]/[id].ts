import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id, id } = req.query;

  // Validasi parameter
  if (
    !unit_kerja_id || Array.isArray(unit_kerja_id) ||
    !id || Array.isArray(id)
  ) {
    return res.status(400).json({ message: "Parameter tidak valid" });
  }

  const unitKerjaId = parseInt(unit_kerja_id);
  const recordId = parseInt(id);

  if (isNaN(unitKerjaId) || isNaN(recordId)) {
    return res.status(400).json({ message: "ID harus berupa angka" });
  }

  try {
    switch (req.method) {
      case "PUT": {
        const { bulan, pagu_anggaran, realisasi_pengeluaran } = req.body;

        const parsedPagu = parseFloat(pagu_anggaran);
        const parsedRealisasi = parseFloat(realisasi_pengeluaran);

        if (!bulan || isNaN(parsedPagu) || isNaN(parsedRealisasi)) {
          return res.status(400).json({ message: "Field tidak lengkap atau salah format" });
        }

        if (parsedRealisasi > parsedPagu) {
          return res.status(400).json({ message: "Realisasi tidak boleh melebihi pagu" });
        }

        const existing = await prisma.serapan_anggaran.findFirst({
          where: { id: recordId, unit_kerja_id: unitKerjaId },
        });

        if (!existing) {
          return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        const updated = await prisma.serapan_anggaran.update({
          where: { id: recordId },
          data: {
            bulan,
            pagu_anggaran: parsedPagu,
            realisasi_pengeluaran: parsedRealisasi,
            updated_at: new Date(),
          },
        });

        return res.status(200).json(updated);
      }

      case "DELETE": {
        const existing = await prisma.serapan_anggaran.findFirst({
          where: { id: recordId, unit_kerja_id: unitKerjaId },
        });

        if (!existing) {
          return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        await prisma.serapan_anggaran.delete({
          where: { id: recordId },
        });

        return res.status(204).end(); // No Content
      }

      default:
        return res.setHeader("Allow", ["PUT", "DELETE"]).status(405).end(`Method ${req.method} tidak diizinkan`);
    }
  } catch (error) {
    console.error("Error Serapan PUT/DELETE:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "Internal server error"
    });
  }
}
