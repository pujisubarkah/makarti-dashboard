import { utils, writeFile } from 'xlsx';

export interface KoordinasiExportRow {
  tanggal: string;
  instansi: string;
  jenisInstansi: string;
  topik: string;
  status: string;
  catatan: string;
}

export function exportKoordinasiToExcel(data: KoordinasiExportRow[]) {
  const rows = data.map((item, idx) => ({
    No: idx + 1,
    Tanggal: item.tanggal,
    Instansi: item.instansi,
    'Jenis Instansi': item.jenisInstansi,
    Topik: item.topik,
    Status: item.status,
    Catatan: item.catatan,
  }));
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Koordinasi');
  writeFile(wb, 'koordinasi.xlsx');
}
