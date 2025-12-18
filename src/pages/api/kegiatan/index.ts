import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const data = await prisma.event_schedule.findMany({
        orderBy: {
          date: "desc",
        },
        include: {
          users: {
            select: {
              unit_kerja: true,
            },
          },
        },
      });

      // Mapping supaya output lebih rapi
      const formattedData = data.map((item) => ({
        id: item.id,
        title: item.title,
        date: item.date,
        location: item.location,
        time: item.time,
        type: item.type,
        priority: item.priority,
        attendees: item.attendees,
        description: item.description,
        unit_kerja: item.users?.unit_kerja || null,
      }));

      return res.status(200).json(formattedData);
    } catch (err) {
      console.error("Error fetching all events:", err);
      return res.status(500).json({ message: "Gagal mengambil data kegiatan" });
    }
  }

  return res.status(405).json({ message: "Metode tidak diizinkan" });
}

