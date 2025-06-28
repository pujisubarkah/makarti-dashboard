import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;

  if (!unit_kerja_id || Array.isArray(unit_kerja_id)) {
    return res.status(400).json({ error: "unit_kerja_id tidak valid" });
  }

  const unitId = parseInt(unit_kerja_id);

  switch (req.method) {
    case "GET":
      try {
        const pelatihan = await prisma.pelatihan.findMany({
          where: { unit_kerja_id: unitId },
          orderBy: { tanggal: "desc" },
          select: {
            id: true,
            nama: true,
            judul: true,
            jam: true,
            tanggal: true,
          },
        });

        return res.status(200).json(pelatihan);
      } catch {
        return res.status(500).json({ error: "Gagal mengambil data pelatihan" });
      }

    case "POST":
      try {
        const { nama, judul, jam, tanggal } = req.body;

        if (!nama || !judul || !jam || !tanggal) {
          return res.status(400).json({ error: "Data pelatihan tidak lengkap" });
        }

        const created = await prisma.pelatihan.create({
          data: {
            nama,
            judul,
            jam: parseInt(jam),
            tanggal: new Date(tanggal),
            unit_kerja_id: unitId,
          },
        });

        return res.status(201).json(created);
      } catch {
        return res.status(500).json({ error: "Gagal menambahkan data pelatihan" });
      }

    default:
      return res.setHeader("Allow", ["GET", "POST"]).status(405).end(`Method ${req.method} not allowed`);
  }
}
