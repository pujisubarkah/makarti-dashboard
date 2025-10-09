// api/pelatihan/[id].ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const pelatihanId = parseInt(id as string);

  if (isNaN(pelatihanId)) {
    return res.status(400).json({ error: "ID pelatihan tidak valid" });
  }

  if (req.method === "PUT") {
    try {
      const { judul, tanggal, jam, sertifikat, pegawai_id, unit_kerja_id } = req.body;

      // Validasi data yang dikirim
      if (!judul || !tanggal || !jam || !pegawai_id || !unit_kerja_id) {
        return res.status(400).json({ 
          error: "Data tidak lengkap. Judul, tanggal, jam, pegawai_id, dan unit_kerja_id harus diisi" 
        });
      }

      // Konversi jam ke integer jika masih string
      const jamInt = typeof jam === 'string' ? parseInt(jam) : jam;
      
      if (isNaN(jamInt) || jamInt <= 0) {
        return res.status(400).json({ 
          error: "Jam pelatihan harus berupa angka positif" 
        });
      }

      // Cek apakah pelatihan exist
      const existingPelatihan = await prisma.pelatihan.findUnique({
        where: { id: pelatihanId }
      });

      if (!existingPelatihan) {
        return res.status(404).json({ error: "Data pelatihan tidak ditemukan" });
      }

      // Update data pelatihan
      const updatedPelatihan = await prisma.pelatihan.update({
        where: { id: pelatihanId },
        data: {
          judul,
          tanggal: new Date(tanggal),
          jam: jamInt,
          sertifikat: sertifikat || null,
          pegawai_id: parseInt(pegawai_id),
          unit_kerja_id: parseInt(unit_kerja_id),
        },
      });

      return res.status(200).json(updatedPelatihan);
    } catch (error) {
      console.error("Error updating pelatihan:", error);
      return res.status(500).json({ 
        error: "Gagal mengupdate data pelatihan",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } else if (req.method === "DELETE") {
    try {
      // Cek apakah pelatihan exist
      const existingPelatihan = await prisma.pelatihan.findUnique({
        where: { id: pelatihanId }
      });

      if (!existingPelatihan) {
        return res.status(404).json({ error: "Data pelatihan tidak ditemukan" });
      }

      // Delete pelatihan
      await prisma.pelatihan.delete({
        where: { id: pelatihanId }
      });

      return res.status(200).json({ message: "Data pelatihan berhasil dihapus" });
    } catch (error) {
      console.error("Error deleting pelatihan:", error);
      return res.status(500).json({ 
        error: "Gagal menghapus data pelatihan",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } else if (req.method === "GET") {
    try {
      const pelatihan = await prisma.pelatihan.findUnique({
        where: { id: pelatihanId },
        include: {
          pegawai: {
            select: {
              nama: true,
            },
          },
          users: {
            select: {
              unit_kerja: true,
              alias: true,
            }
          }
        },
      });

      if (!pelatihan) {
        return res.status(404).json({ error: "Data pelatihan tidak ditemukan" });
      }

      return res.status(200).json(pelatihan);
    } catch (error) {
      console.error("Error fetching pelatihan:", error);
      return res.status(500).json({ 
        error: "Gagal mengambil data pelatihan" 
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}