import { NextResponse } from "next/server";
import { getBknToken } from "@/lib/bkn";

export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: { nip: string } }
) {
  try {
    const token = await getBknToken();

    const res = await fetch(
      `https://apimws.bkn.go.id:8243/pembinabknlan/1/pns/rw-kursus/${params.nip}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      }
    );

    const json = await res.json();

    // Kalau BKN balikin null / error → anggap kosong
    if (!json.data) return NextResponse.json([]);

    // 🔁 mapping ke struktur TAB Pelatihan kamu
    interface KursusBKN {
      namaKursus: string;
      jumlahJam: number;
      tahun: string;
      [key: string]: unknown;
    }
    return NextResponse.json(
      (json.data as KursusBKN[]).map((k, i: number) => ({
        id: i,
        judul: k.namaKursus,
        jam: k.jumlahJam,
        tanggal: k.tahun,
      }))
    );
  } catch {
    return NextResponse.json([]);
  }
}

export default GET;
