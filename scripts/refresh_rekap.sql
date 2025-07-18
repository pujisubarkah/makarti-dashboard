TRUNCATE TABLE makarti.rekap_skor_unit_kerja;

INSERT INTO makarti.rekap_skor_unit_kerja (
  unit_kerja_id,
  learning_pelatihan_score,
  learning_penyelenggaraan_score,
  total_learning_score,
  branding_engagement_rate,
  branding_engagement_score,
  branding_publikasi_total,
  branding_publikasi_score,
  branding_score,
  networking_kerjasama_score,
  networking_koordinasi_score,
  networking_score,
  inovasi_kinerja_score,
  inovasi_kajian_score,
  inovasi_score,
  bigger_score,
  smarter_score,
  better_score
)
SELECT unit_kerja_id,
    learning_pelatihan_score,
    learning_penyelenggaraan_score,
    round((learning_pelatihan_score + learning_penyelenggaraan_score) / 2::numeric, 2) AS total_learning_score,
    branding_engagement_rate,
    branding_engagement_score,
    branding_publikasi_total,
    branding_publikasi_score,
    round((branding_engagement_score + branding_publikasi_score) / 2::numeric, 2) AS branding_score,
    networking_kerjasama_score,
    networking_koordinasi_score,
    round(0.8 * networking_kerjasama_score + 0.2 * networking_koordinasi_score, 2) AS networking_score,
    inovasi_kinerja_score,
    inovasi_kajian_score,
    round((inovasi_kinerja_score + inovasi_kajian_score) / 2::numeric, 2) AS inovasi_score,
    round(((branding_engagement_score + branding_publikasi_score) / 2::numeric + (0.8 * networking_kerjasama_score + 0.2 * networking_koordinasi_score)) / 2::numeric, 2) AS bigger_score,
    round(((learning_pelatihan_score + learning_penyelenggaraan_score) / 2::numeric + (inovasi_kinerja_score + inovasi_kajian_score) / 2::numeric) / 2::numeric, 2) AS smarter_score,
    round(((branding_engagement_score + branding_publikasi_score) / 2::numeric + (0.8 * networking_kerjasama_score + 0.2 * networking_koordinasi_score) + (learning_pelatihan_score + learning_penyelenggaraan_score) / 2::numeric + (inovasi_kinerja_score + inovasi_kajian_score) / 2::numeric) / 4::numeric, 2) AS better_score
FROM (
  SELECT p.unit_kerja_id,
    round(100.0 * count(DISTINCT CASE WHEN tp.total_jam >= 20 THEN p.id ELSE NULL END)::numeric / count(p.id)::numeric, 2) AS learning_pelatihan_score,
    LEAST(round(COALESCE(pen.total_peserta, 0)::numeric / 5000.0 * 100, 2), 100) AS learning_penyelenggaraan_score,
    eng.avg_engagement AS branding_engagement_rate,
    LEAST(round(COALESCE(eng.avg_engagement, 0)::numeric / 0.06 * 100, 2), 100) AS branding_engagement_score,
    COALESCE(pub.total_publikasi, 0) AS branding_publikasi_total,
    LEAST(round(COALESCE(pub.total_publikasi, 0)::numeric / 60.0 * 100, 2), 100) AS branding_publikasi_score,
    COALESCE(net.kerjasama_score, 0) AS networking_kerjasama_score,
    COALESCE(kor.koordinasi_score, 0) AS networking_koordinasi_score,
    COALESCE(inv.kinerja_score, 0) AS inovasi_kinerja_score,
    COALESCE(kaj.kajian_score, 0) AS inovasi_kajian_score
  FROM makarti.pegawai p
  LEFT JOIN (
    SELECT pel.pegawai_id, sum(pel.jam) AS total_jam
    FROM makarti.pelatihan pel
    GROUP BY pel.pegawai_id
  ) tp ON p.id = tp.pegawai_id
  LEFT JOIN (
    SELECT penyelenggaraan.unit_kerja_id, sum(penyelenggaraan."jumlahPeserta") AS total_peserta
    FROM makarti.penyelenggaraan
    GROUP BY penyelenggaraan.unit_kerja_id
  ) pen ON p.unit_kerja_id = pen.unit_kerja_id
  LEFT JOIN (
    SELECT publikasi.unit_kerja_id,
      avg(publikasi.likes::double precision / publikasi.views::double precision * 100) AS avg_engagement
    FROM makarti.publikasi
    WHERE publikasi.jenis IN ('Instagram', 'Youtube', 'Tiktok')
      AND publikasi.likes IS NOT NULL AND publikasi.views IS NOT NULL AND publikasi.views > 0
    GROUP BY publikasi.unit_kerja_id
  ) eng ON p.unit_kerja_id = eng.unit_kerja_id
  LEFT JOIN (
    SELECT publikasi.unit_kerja_id, count(*) AS total_publikasi
    FROM makarti.publikasi
    GROUP BY publikasi.unit_kerja_id
  ) pub ON p.unit_kerja_id = pub.unit_kerja_id
  LEFT JOIN (
    SELECT networking.unit_kerja_id,
      round(100.0 * count(CASE WHEN networking.status IN ('MoU Ditandatangani', 'Selesai') THEN 1 ELSE NULL END)::numeric / NULLIF(count(*), 0), 2) AS kerjasama_score
    FROM makarti.networking
    GROUP BY networking.unit_kerja_id
  ) net ON p.unit_kerja_id = net.unit_kerja_id
  LEFT JOIN (
    SELECT koordinasi.unit_kerja_id,
      round(100.0 * count(CASE WHEN koordinasi."Status" = 'Selesai' THEN 1 ELSE NULL END)::numeric / NULLIF(count(*), 0), 2) AS koordinasi_score
    FROM makarti.koordinasi
    GROUP BY koordinasi.unit_kerja_id
  ) kor ON p.unit_kerja_id = kor.unit_kerja_id
  LEFT JOIN (
    SELECT inovasi.unit_kerja_id,
      round(avg(CASE
        WHEN inovasi.tahap = 'Implementasi' THEN 100
        WHEN inovasi.tahap = 'Uji Coba' THEN 80
        WHEN inovasi.tahap = 'Perencanaan' THEN 60
        WHEN inovasi.tahap = 'Ide' THEN 40
        ELSE 0 END), 2) AS kinerja_score
    FROM makarti.inovasi
    GROUP BY inovasi.unit_kerja_id
  ) inv ON p.unit_kerja_id = inv.unit_kerja_id
  LEFT JOIN (
    SELECT kajian.unit_kerja_id,
      round(avg(CASE
        WHEN kajian.status = 'Selesai' THEN 100
        WHEN kajian.status = 'Review' THEN 80
        WHEN kajian.status = 'Revisi' THEN 60
        WHEN kajian.status = 'Draft' THEN 40
        WHEN kajian.status = 'Ditunda' THEN 20
        ELSE 0 END), 2) AS kajian_score
    FROM makarti.kajian
    GROUP BY kajian.unit_kerja_id
  ) kaj ON p.unit_kerja_id = kaj.unit_kerja_id
  GROUP BY p.unit_kerja_id, pen.total_peserta, eng.avg_engagement, pub.total_publikasi,
           net.kerjasama_score, kor.koordinasi_score, inv.kinerja_score, kaj.kajian_score
) hasil
ORDER BY unit_kerja_id;
