import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // pastikan path benar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const data = await prisma.penyelenggaraan.findMany({
        select: {
          id: true,
          namaKegiatan: true,
          tanggal: true,
          jumlahPeserta: true,
          unit_kerja_id: true,
          jenis_bangkom_non_pelatihan: {
            select: {
              jenis_bangkom: true, // hanya ambil string "jenis_bangkom"
            },
          },
          users: {
            select: {
              id: true,
              unit_kerja: true, // atau select unit_kerja nama aja
            },
          },
        },
      });
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const {
        namaKegiatan,
        tanggal,
        jenis_bangkom_id,
        jumlahPeserta,
        unit_kerja_id,
      } = req.body;

      const created = await prisma.penyelenggaraan.create({
        data: {
          namaKegiatan,
          tanggal: new Date(tanggal),
          jenis_bangkom_id,
          jumlahPeserta,
          unit_kerja_id: unit_kerja_id ?? null,
        },
      });

      return res.status(201).json(created);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: unknown) {
    console.error("API Error:", error);

    // Type guard untuk error handling yang lebih aman
    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return res.status(500).json({
      message: "Server error",
      error: errorMessage,
    });
  }
}
