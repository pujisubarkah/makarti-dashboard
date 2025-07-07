// pages/api/kegiatan/[unit_kerja_id]/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { unit_kerja_id } = req.query;

  if (!unit_kerja_id || Array.isArray(unit_kerja_id)) {
    return res.status(400).json({ message: "unit_kerja_id tidak valid" });
  }

  const unitId = parseInt(unit_kerja_id);

  if (req.method === "GET") {
    try {
      const events = await prisma.event_schedule.findMany({
        where: {
          unit_kerja_id: unitId,
        },
        orderBy: {
          date: "desc",
        },
      });

      return res.status(200).json(events);
    } catch (err) {
      console.error("Error fetching unit events:", err);
      return res.status(500).json({ message: "Gagal mengambil data kegiatan unit kerja" });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        date,
        title,
        location,
        time,
        type,
        priority,
        attendees,
        description,
      } = req.body;

      const newEvent = await prisma.event_schedule.create({
        data: {
          unit_kerja_id: unitId,
          date: new Date(date),
          title,
          location,
          time,
          type,
          priority,
          attendees,
          description,
        },
      });

      return res.status(201).json(newEvent);
    } catch (err) {
      console.error("Error creating event:", err);
      return res.status(500).json({ message: "Gagal menambahkan kegiatan" });
    }
  }

  return res.status(405).json({ message: "Metode tidak diizinkan" });
}
