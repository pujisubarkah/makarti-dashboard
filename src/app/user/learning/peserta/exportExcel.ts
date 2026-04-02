import { utils, writeFile } from 'xlsx';

export interface PesertaExportRow {
  namaKegiatan: string;
  tanggal: string;
  jenisBangkom: string;
  jumlahPeserta: number;
  daftarHadir?: string;
}

export function exportPesertaToExcel(data: PesertaExportRow[]) {
  const rows = data.map((item, idx) => ({
    No: idx + 1,
    'Nama Kegiatan': item.namaKegiatan,
    Tanggal: item.tanggal,
    'Jenis Bangkom': item.jenisBangkom,
    'Jumlah Peserta': item.jumlahPeserta,
    'Daftar Hadir': item.daftarHadir || '-',
  }));
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'PesertaBangkom');
  writeFile(wb, 'peserta-bangkom.xlsx');
}
