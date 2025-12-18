import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Ambil semua event_roles
    try {
      const roles = await prisma.event_roles.findMany();
      return res.status(200).json(roles);
    } catch (error) {
      console.error("Error fetching event roles:", error);
      return res.status(500).json({ error: "Gagal mengambil daftar role" });
    }
  } else {
    // Jika method tidak didukung
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

