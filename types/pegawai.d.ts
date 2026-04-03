export interface Pegawai {
  id?: number;
  nip?: string;
  nama?: string;
  jabatan?: string;
  golongan?: string;
  eselon?: string;
  users_pegawai_unit_kerja_idTousers?: {
    unit_kerja?: string;
  };
}

export interface PegawaiDetail {
  id?: number;
  pegawai_id: number;
  email?: string;
  unit_kerja?: string | null;
  status_kepegawaian?: string;
  alamat?: string;
  pendidikan?: string;
  telp?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  nm_goldar?: string;
  peg_cpns_tmt?: string;
  nip?: string;
  photo_url?: string;
  agama?: string;
  peg_npwp?: string;
  nik?: string;
  tingkat_pendidikan?: string;
  tempat_lahir?: string;
}
