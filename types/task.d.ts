export interface Subtask {
  id: number;
  title: string;
  is_done: boolean;
  assigned_to?: string;
  created_at?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  pilar?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'rencana' | 'proses' | 'selesai' | 'terhambat';
  label?: string;
  progress?: number;
  tags?: string;
  pj_kegiatan?: string;
  created_at?: string;
  subtasks: Subtask[];
  owner?: number;
  users?: { name?: string };
}
