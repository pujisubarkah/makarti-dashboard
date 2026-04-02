import { utils, writeFile } from 'xlsx';

export interface PelatihanExportRow {
  nama: string;
  judul: string;
  jam: number;
  tanggal: string;
  sertifikat?: string;
}

export function exportPelatihanToExcel(data: PelatihanExportRow[]) {
  const rows = data.map((item, idx) => ({
    No: idx + 1,
    'Nama Pegawai': item.nama,
    'Judul Pelatihan': item.judul,
    Jam: item.jam,
    Tanggal: item.tanggal,
    Sertifikat: item.sertifikat || '-',
  }));
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Pelatihan');
  writeFile(wb, 'pelatihan.xlsx');
}
