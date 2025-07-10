// api/pelatihan_pegawai/[unit_kerja_id]/[id].ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id, id } = req.query;

  if (!unit_kerja_id || !id || Array.isArray(unit_kerja_id) || Array.isArray(id)) {
    return res.status(400).json({ error: "Parameter tidak valid" });
  }

  const pelatihanId = parseInt(id);
  const unitKerjaId = parseInt(unit_kerja_id);

  if (isNaN(pelatihanId) || isNaN(unitKerjaId)) {
    return res.status(400).json({ error: "ID tidak valid" });
  }

  try {
    if (req.method === "GET") {
      const pelatihan = await prisma.pelatihan.findUnique({
        where: { id: pelatihanId },
        include: {
          pegawai: {
            select: { id: true, nama: true },
          },
        },
      });

      if (!pelatihan) {
        return res.status(404).json({ error: "Data tidak ditemukan" });
      }

      // Format respons sesuai frontend
      const formattedData = {
        id: pelatihan.id,
        pegawai_id: pelatihan.pegawai_id,
        unit_kerja_id: pelatihan.unit_kerja_id,
        judul: pelatihan.judul,
        jam: pelatihan.jam,
        tanggal: pelatihan.tanggal.toISOString().split("T")[0],
        sertifikat: pelatihan.sertifikat,
        pegawai: {
          id: pelatihan.pegawai.id,
          nama: pelatihan.pegawai.nama,
        },
      };

      return res.status(200).json(formattedData);
    } else if (req.method === "PUT") {
      const { pegawai_id, judul, jam, tanggal } = req.body;

      // Validasi data
      if (!judul || !tanggal || !pegawai_id || !jam) {
        return res.status(400).json({ error: "Data pelatihan tidak lengkap" });
      }

      const updated = await prisma.pelatihan.update({
        where: { id: pelatihanId },
        data: {
          judul,
          jam: parseInt(jam.toString()),
          tanggal: new Date(tanggal),
          sertifikat,
          pegawai_id: parseInt(pegawai_id.toString()),
          unit_kerja_id: unitKerjaId,
        },
        include: {
          pegawai: {
            select: { id: true, nama: true },
          },
        },
      });

      // Format respons sesuai frontend
      const formattedData = {
        id: updated.id,
        pegawai_id: updated.pegawai_id,
        unit_kerja_id: updated.unit_kerja_id,
        judul: updated.judul,
        jam: updated.jam,
        tanggal: updated.tanggal.toISOString().split("T")[0],
        sertifikat: updated.sertifikat,
        pegawai: {
          id: updated.pegawai.id,
          nama: updated.pegawai.nama,
        },
      };

      return res.status(200).json(formattedData);
    } else if (req.method === "DELETE") {
      // Cek apakah data exists
      const existingPelatihan = await prisma.pelatihan.findUnique({
        where: { id: pelatihanId },
      });

      if (!existingPelatihan) {
        return res.status(404).json({ error: "Data tidak ditemukan" });
      }

      await prisma.pelatihan.delete({ 
        where: { id: pelatihanId } 
      });

      return res.status(200).json({ 
        message: "Pelatihan berhasil dihapus",
        id: pelatihanId 
      });
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error(`Error handling ${req.method} request:`, error);
    
    if (req.method === "PUT") {
      return res.status(500).json({ error: "Gagal memperbarui data pelatihan" });
    } else if (req.method === "DELETE") {
      return res.status(500).json({ error: "Gagal menghapus data pelatihan" });
    } else {
      return res.status(500).json({ error: "Gagal mengambil data pelatihan" });
    }
  }
}
