// pages/api/kegiatan/[unit_kerja_id]/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) return res.status(400).json({ message: "ID tidak valid" });

  const kegiatanId = parseInt(id);

  switch (req.method) {
    case "GET":
      try {
        const kegiatan = await prisma.event_schedule.findUnique({
          where: { id: kegiatanId },
        });
        if (!kegiatan) return res.status(404).json({ message: "Kegiatan tidak ditemukan" });
        return res.status(200).json(kegiatan);
      } catch (err) {
        return res.status(500).json({ message: "Gagal mengambil data kegiatan" });
      }

    case "PUT":
      try {
        const updated = await prisma.event_schedule.update({
          where: { id: kegiatanId },
          data: req.body,
        });
        return res.status(200).json(updated);
      } catch (err) {
        return res.status(500).json({ message: "Gagal memperbarui kegiatan" });
      }

    case "DELETE":
      try {
        await prisma.event_schedule.delete({
          where: { id: kegiatanId },
        });
        return res.status(200).json({ message: "Kegiatan berhasil dihapus" });
      } catch (err) {
        return res.status(500).json({ message: "Gagal menghapus kegiatan" });
      }

    default:
      return res.status(405).json({ message: "Metode tidak diizinkan" });
  }
}
