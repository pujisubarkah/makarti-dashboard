import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;

  if (!unit_kerja_id || Array.isArray(unit_kerja_id)) {
    return res.status(400).json({ message: "unit_kerja_id tidak valid" });
  }

  const unitId = parseInt(unit_kerja_id);

  if (isNaN(unitId)) {
    return res.status(400).json({ message: "unit_kerja_id harus berupa angka" });
  }

  try {
    if (req.method === "GET") {
      const data = await prisma.inovasi.findMany({
        where: { unit_kerja_id: unitId },
        orderBy: { tanggal: "desc" }
      });

      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const { judul, tahap, tanggal, indikator } = req.body;

      if (!judul || !tahap || !tanggal || !indikator) {
        return res.status(400).json({ message: "Semua field wajib diisi" });
      }

      const created = await prisma.inovasi.create({
        data: {
          judul,
          tahap,
          tanggal: new Date(tanggal),
          indikator,
          unit_kerja_id: unitId,
        },
      });

      return res.status(201).json(created);
    }

    return res.status(405).json({ message: `Method ${req.method} tidak diizinkan` });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
}
