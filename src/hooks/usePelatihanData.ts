import { useState, useEffect } from 'react';
import { Pelatihan } from '@/types/shared';

export function usePelatihanData(id: string | undefined) {
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/employee/pelatihan/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setPelatihan(res);
        setLoading(false);
      })
      .catch(() => {
        setPelatihan([]);
        setLoading(false);
      });
  }, [id]);

  return { pelatihan, loading };
}