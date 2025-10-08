// api/pelatihan/index.ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { id } = req.query;
      let pegawaiId: number;

      // Check if id is a valid integer ID (small number) or NIP (long string)
      const numericId = Number(id);
      if (!isNaN(numericId) && numericId > 0 && numericId < 1000000 && Number.isInteger(numericId)) {
        // Use directly as pegawai_id
        pegawaiId = numericId;
      } else {
        // Search pegawai by NIP to get pegawai_id
        const pegawai = await prisma.pegawai.findFirst({
          where: { nip: String(id) },
          select: { id: true }
        });
        
        if (!pegawai) {
          return res.status(404).json({ error: "Pegawai tidak ditemukan" });
        }
        
        pegawaiId = pegawai.id;
      }

      const data = await prisma.pelatihan.findMany({
        where: {
          pegawai_id: pegawaiId,
        },
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

      return res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching pelatihan data:", error);
      return res.status(500).json({ error: "Gagal mengambil data pelatihan" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}
