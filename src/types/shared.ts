export type PegawaiDetailItem = {
  id?: number;
  pegawai_id?: number;
  nip?: string;
  email?: string;
  unit_kerja?: string | null;
  status_kepegawaian?: string;
  alamat?: string;
  pendidikan?: string;
  tingkat_pendidikan?: string;
  telp?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  nm_goldar?: string;
  peg_cpns_tmt?: string;
  photo_url?: string;
  agama?: string;
  peg_npwp?: string;
  nik?: string;
  tempat_lahir?: string;
};

export type PegawaiDetail = {
  id: number;
  created_at?: string;
  nip: string;
  nama: string;
  unit_kerja_id?: number;
  jabatan?: string;
  golongan?: string;
  eselon?: string;
  users_pegawai_unit_kerja_idTousers?: { unit_kerja?: string };
  pegawai_detail: PegawaiDetailItem[];
  photo_url?: string;
};

export type Pelatihan = {
  id: number;
  judul: string;
  jam?: number;
  tanggal?: string;
};

export interface AiGoal {
  kompetensi: string;
  target: string;
  alasan: string;
  indikator: string;
}

export interface AiActivity {
  judul: string;
  jenis: string;
  penyelenggara: string;
}

export interface AiSuggestions {
  ai_suggestions: {
    goals: AiGoal[];
    activities: AiActivity[];
  };
}