import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id, id } = req.query;

  if (
    !unit_kerja_id || Array.isArray(unit_kerja_id) ||
    !id || Array.isArray(id)
  ) {
    return res.status(400).json({ error: "Parameter tidak valid" });
  }

  const unitId = parseInt(unit_kerja_id);
  const pelatihanId = parseInt(id);

  switch (req.method) {
    case "GET":
      try {
        const data = await prisma.pelatihan.findFirst({
          where: {
            id: pelatihanId,
            unit_kerja_id: unitId,
          },
          select: {
            id: true,
            nama: true,
            judul: true,
            jam: true,
            tanggal: true,
            unit_kerja_id: true,
          },
        });

        if (!data) return res.status(404).json({ error: "Pelatihan tidak ditemukan" });

        return res.status(200).json(data);
      } catch {
        return res.status(500).json({ error: "Gagal mengambil data pelatihan" });
      }

    case "PUT":
      try {
        const { nama, judul, jam, tanggal } = req.body;

        const updated = await prisma.pelatihan.update({
          where: { id: pelatihanId },
          data: {
            nama,
            judul,
            jam: parseInt(jam),
            tanggal: new Date(tanggal),
          },
        });

        return res.status(200).json(updated);
      } catch {
        return res.status(500).json({ error: "Gagal mengupdate data pelatihan" });
      }

    case "DELETE":
      try {
        await prisma.pelatihan.delete({
          where: { id: pelatihanId },
        });

        return res.status(200).json({ message: "Pelatihan berhasil dihapus" });
      } catch {
        return res.status(500).json({ error: "Gagal menghapus pelatihan" });
      }

    default:
      return res.setHeader("Allow", ["GET", "PUT", "DELETE"]).status(405).end(`Method ${req.method} not allowed`);
  }
}
