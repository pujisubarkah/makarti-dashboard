import { utils, writeFile } from 'xlsx';

export interface ProdukInovasiExportRow {
  nama: string;
  jenis: string;
  status: string;
  tanggalRilis: string;
  keterangan: string;
}

export function exportProdukInovasiToExcel(data: ProdukInovasiExportRow[]) {
  const rows = data.map((item, idx) => ({
    No: idx + 1,
    'Nama Produk': item.nama,
    Jenis: item.jenis,
    Status: item.status,
    'Tanggal Rilis': item.tanggalRilis,
    Keterangan: item.keterangan,
  }));
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'ProdukInovasi');
  writeFile(wb, 'produk-inovasi.xlsx');
}
