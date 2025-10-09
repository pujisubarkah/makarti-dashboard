export interface Subtask {
  id: number;
  title: string;
  is_done: boolean;
  assigned_to?: number; // ID pegawai
  created_at?: string;
  pegawai?: {
    id: number;
    nama: string;
    jabatan?: string;
  };
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  pilar?: string;
  status: 'rencana' | 'proses' | 'selesai' | 'terhambat';
  label?: string;
  progress?: number;
  tags?: string;
  pj_kegiatan?: string;
  created_at?: string;
  subtasks: Subtask[];
  owner?: number;
  users?: { name?: string };
  rating?: number; // Rating from supervisor (1-5 stars)
}
