// api/pelatihan/[unit_kerja_id]/[id].ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: { unit_kerja_id: string; id: string };
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);

    const pelatihan = await prisma.pelatihan.findUnique({
      where: { id },
      include: {
        users_Pelatihan_pegawai_idTousers: true,
        users_Pelatihan_unit_kerja_idTousers: true,
      },
    });

    if (!pelatihan) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(pelatihan);
  } catch (error) {
    console.error("Error fetching pelatihan:", error);
    return NextResponse.json({ error: "Gagal mengambil data pelatihan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();

    const updated = await prisma.pelatihan.update({
      where: { id },
      data: {
        ...body,
        tanggal: body.tanggal ? new Date(body.tanggal) : undefined,
        jam: body.jam ? parseInt(body.jam) : undefined,
        pegawai_id: body.pegawai_id ? parseInt(body.pegawai_id) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating pelatihan:", error);
    return NextResponse.json({ error: "Gagal memperbarui data pelatihan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);

    await prisma.pelatihan.delete({ where: { id } });

    return NextResponse.json({ message: "Pelatihan berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting pelatihan:", error);
    return NextResponse.json({ error: "Gagal menghapus data pelatihan" }, { status: 500 });
  }
}
