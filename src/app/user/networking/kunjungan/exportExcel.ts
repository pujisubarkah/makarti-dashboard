import { utils, writeFile } from 'xlsx';

export interface NetworkingExportRow {
  instansi: string;
  jenis: string;
  status: string;
  catatan: string;
}

export function exportNetworkingToExcel(data: NetworkingExportRow[]) {
  const rows = data.map((item, idx) => ({
    No: idx + 1,
    Instansi: item.instansi,
    Jenis: item.jenis,
    Status: item.status,
    Catatan: item.catatan,
  }));
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'NetworkingKunjungan');
  writeFile(wb, 'networking-kunjungan.xlsx');
}
