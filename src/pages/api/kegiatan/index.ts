// pages/api/kegiatan/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const data = await prisma.event_schedule.findMany({
        orderBy: {
          date: "desc",
        },
      });
      return res.status(200).json(data);
    } catch (err) {
      console.error("Error fetching all events:", err);
      return res.status(500).json({ message: "Gagal mengambil data kegiatan" });
    }
  }

  return res.status(405).json({ message: "Metode tidak diizinkan" });
}
