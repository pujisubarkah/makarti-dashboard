import { utils, writeFile } from 'xlsx';

export interface InovasiExportRow {
  judul: string;
  tahap: string;
  tanggal: string;
  indikator: string;
  unit: string;
}

export function exportInovasiToExcel(data: InovasiExportRow[]) {
  const rows = data.map((item, idx) => ({
    No: idx + 1,
    Judul: item.judul,
    Tahap: item.tahap,
    Tanggal: item.tanggal,
    Indikator: item.indikator,
    Unit: item.unit,
  }));
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'InovasiKinerja');
  writeFile(wb, 'inovasi-kinerja.xlsx');
}
