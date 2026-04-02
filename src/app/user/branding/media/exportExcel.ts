import { utils, writeFile } from 'xlsx';

interface PublikasiExportRow {
  id: number;
  judul: string;
  tanggal: string;
  jenis: string;
  unit?: string;
  link?: string;
  likes?: number;
  views?: number;
}

export function exportPublikasiToExcel(data: PublikasiExportRow[]) {
  // Format data sesuai kebutuhan kolom Excel
  const rows = data.map((item, idx) => ({
    No: idx + 1,
    Judul: item.judul,
    Tanggal: item.tanggal,
    'Jenis Media': item.jenis,
    Likes: item.likes ?? '-',
    Views: item.views ?? '-',
    Engagement: item.likes && item.views ? ((item.likes / item.views) * 100).toFixed(1) + '%' : '-',
    Link: item.link,
    Unit: item.unit ?? '-',
  }));
  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'PublikasiMedia');
  writeFile(wb, 'publikasi-media.xlsx');
}
