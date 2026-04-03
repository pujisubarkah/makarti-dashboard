import { useState, useEffect } from 'react';
import { PegawaiDetail } from '@/types/shared';

export function useEmployeeData(id: string | undefined) {
  const [data, setData] = useState<PegawaiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/employee/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading employee data:', error);
        setError("Gagal memuat data pegawai");
        setLoading(false);
      });
  }, [id]);

  return { data, loading, error };
}