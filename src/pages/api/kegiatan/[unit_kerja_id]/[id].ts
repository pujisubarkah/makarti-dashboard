// pages/api/kegiatan/[unit_kerja_id]/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id, id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ 
      success: false, 
      message: "ID tidak valid" 
    });
  }

  if (!unit_kerja_id || Array.isArray(unit_kerja_id)) {
    return res.status(400).json({ 
      success: false, 
      message: "Unit kerja ID tidak valid" 
    });
  }

  const kegiatanId = parseInt(id);
  const unitKerjaId = parseInt(unit_kerja_id);

  if (isNaN(kegiatanId) || isNaN(unitKerjaId)) {
    return res.status(400).json({ 
      success: false, 
      message: "ID harus berupa angka" 
    });
  }

  switch (req.method) {
    case "GET":
      try {
        const kegiatan = await prisma.event_schedule.findFirst({
          where: { 
            id: kegiatanId,
            unit_kerja_id: unitKerjaId 
          },
        });
        if (!kegiatan) {
          return res.status(404).json({ 
            success: false, 
            message: "Kegiatan tidak ditemukan" 
          });
        }
        return res.status(200).json({ 
          success: true, 
          data: kegiatan 
        });
      } catch (err) {
        console.error('Error fetching kegiatan:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Gagal mengambil data kegiatan" 
        });
      }

    case "PUT":
      try {
        // Cek apakah kegiatan exists dan milik unit kerja ini
        const existingKegiatan = await prisma.event_schedule.findFirst({
          where: { 
            id: kegiatanId,
            unit_kerja_id: unitKerjaId 
          },
        });
        
        if (!existingKegiatan) {
          return res.status(404).json({ 
            success: false, 
            message: "Kegiatan tidak ditemukan atau akses ditolak" 
          });
        }

        const updated = await prisma.event_schedule.update({
          where: { id: kegiatanId },
          data: {
            ...req.body,
            updated_at: new Date()
          },
        });
        return res.status(200).json({ 
          success: true, 
          message: "Kegiatan berhasil diperbarui",
          data: updated 
        });
      } catch (err) {
        console.error('Error updating kegiatan:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Gagal memperbarui kegiatan" 
        });
      }

    case "DELETE":
      try {
        // Cek apakah kegiatan exists dan milik unit kerja ini
        const existingKegiatan = await prisma.event_schedule.findFirst({
          where: { 
            id: kegiatanId,
            unit_kerja_id: unitKerjaId 
          },
        });
        
        if (!existingKegiatan) {
          return res.status(404).json({ 
            success: false, 
            message: "Kegiatan tidak ditemukan atau akses ditolak" 
          });
        }

        await prisma.event_schedule.delete({
          where: { id: kegiatanId },
        });
        return res.status(200).json({ 
          success: true, 
          message: "Kegiatan berhasil dihapus" 
        });
      } catch (err) {
        console.error('Error deleting kegiatan:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Gagal menghapus kegiatan" 
        });
      }

    default:
      return res.status(405).json({ 
        success: false, 
        message: "Metode tidak diizinkan" 
      });
  }
}
