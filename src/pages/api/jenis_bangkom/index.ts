import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // Sesuaikan path jika berbeda

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const data = await prisma.jenis_bangkom_non_pelatihan.findMany({
        select: {
          id: true,
          jenis_bangkom: true,
          created_at: true
        }
      });
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      return res.status(500).json({ message: "Gagal mengambil data" });
    }
  }

  if (req.method === "POST") {
    const { jenis_bangkom } = req.body;

    if (!jenis_bangkom || typeof jenis_bangkom !== "string") {
      return res.status(400).json({ message: "Field jenis_bangkom diperlukan dan harus berupa string" });
    }

    try {
      const newEntry = await prisma.jenis_bangkom_non_pelatihan.create({
        data: {
          jenis_bangkom,
        },
      });

      return res.status(201).json(newEntry);
    } catch (error) {
      console.error("Error creating data:", error);
      return res.status(500).json({ message: "Gagal menyimpan data" });
    }
  }

  return res.status(405).json({ message: "Method tidak diizinkan" });
}