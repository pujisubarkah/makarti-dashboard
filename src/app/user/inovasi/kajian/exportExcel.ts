import { utils, writeFile } from 'xlsx';

export interface KajianExportRow {
  judul: string;
  jenis: string;
  status: string;
}

export function exportKajianToExcel(data: KajianExportRow[]) {
  const rows = data.map((item, idx) => ({
    No: idx + 1,
    'Judul Kajian': item.judul,
    'Jenis Produk': item.jenis,
    Status: item.status,
  }));
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'KajianAnalisis');
  writeFile(wb, 'kajian-analisis.xlsx');
}
