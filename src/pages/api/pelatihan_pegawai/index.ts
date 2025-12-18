// api/pelatihan/index.ts
import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const data = await prisma.pelatihan.findMany({
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

