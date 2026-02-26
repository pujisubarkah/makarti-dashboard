export function CareerInsight({ aiSuggestions, loading }: { aiSuggestions: { ai_suggestions: { goals: Array<{ kompetensi: string }>; activities: Array<{ judul: string }> } } | null; loading: boolean }) {
  if (loading) {
    return <div className="p-4">Memuat rekomendasi AI…</div>;
  }

  if (!aiSuggestions?.ai_suggestions) {
    return <div className="p-4 text-gray-400">Belum ada rekomendasi karier</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 border rounded-lg p-4">
        <h4 className="font-semibold text-emerald-700">
          🎯 Rekomendasi Tujuan Karier
        </h4>
        <ul className="mt-2 text-sm space-y-1">
          {aiSuggestions.ai_suggestions.goals.slice(0, 2).map((g, i) => (
            <li key={i}>• {g.kompetensi}</li>
          ))}
        </ul>
      </div>

      <div className="bg-teal-50 border rounded-lg p-4">
        <h4 className="font-semibold text-teal-700">
          📚 Aktivitas Pengembangan
        </h4>
        <ul className="mt-2 text-sm space-y-1">
          {aiSuggestions.ai_suggestions.activities.slice(0, 2).map((a, i) => (
            <li key={i}>• {a.judul}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}