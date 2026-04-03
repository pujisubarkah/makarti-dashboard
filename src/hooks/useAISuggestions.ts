import { useState, useEffect } from 'react';
import { AiSuggestions } from '@/types/shared';

export function useAISuggestions(id: string | undefined) {
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/idp/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((res) => {
        if (res && res.ai_suggestions) {
          setAiSuggestions(res);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching AI suggestions:', error);
        setLoading(false);
      });
  }, [id]);

  return { aiSuggestions, loading };
}