// api/pelatihan/index.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.pelatihan.findMany({
      include: {
        users_Pelatihan_pegawai_idTousers: true,
        users_Pelatihan_unit_kerja_idTousers: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pelatihan data:", error);
    return NextResponse.json({ error: "Gagal mengambil data pelatihan" }, { status: 500 });
  }
}
