// api/pelatihan/index.ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
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

      // Buat data pelatihan baru
      const newPelatihan = await prisma.pelatihan.create({
        data: {
          judul,
          tanggal: new Date(tanggal),
          jam: jamInt,
          sertifikat: sertifikat || null,
          pegawai_id: parseInt(pegawai_id),
          unit_kerja_id: parseInt(unit_kerja_id),
        },
      });

      return res.status(201).json(newPelatihan);
    } catch (error) {
      console.error("Error creating pelatihan:", error);
      return res.status(500).json({ 
        error: "Gagal menyimpan data pelatihan",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  } else if (req.method === "GET") {
    try {
      const pelatihan = await prisma.pelatihan.findMany({
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
        orderBy: {
          tanggal: 'desc'
        }
      });

      return res.status(200).json(pelatihan);
    } catch (error) {
      console.error("Error fetching pelatihan:", error);
      return res.status(500).json({ 
        error: "Gagal mengambil data pelatihan" 
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}