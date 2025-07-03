import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id, id } = req.query;

  if (
    !unit_kerja_id || Array.isArray(unit_kerja_id) ||
    !id || Array.isArray(id)
  ) {
    return res.status(400).json({ message: "Parameter tidak valid" });
  }

  const unitId = parseInt(unit_kerja_id);
  const inovasiId = parseInt(id);

  if (req.method === "PUT") {
    const { judul, tahap, tanggal, indikator } = req.body;

    if (!judul || !tahap || !tanggal || !indikator) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const updated = await prisma.inovasi.update({
      where: { id: inovasiId },
      data: {
        judul,
        tahap,
        tanggal: new Date(tanggal),
        indikator,
        unit_kerja_id: unitId,
      }
    });

    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.inovasi.delete({
      where: { id: inovasiId }
    });

    return res.status(204).end();
  }

  return res.setHeader("Allow", ["PUT", "DELETE"]).status(405).end(`Method ${req.method} tidak diizinkan`);
}
