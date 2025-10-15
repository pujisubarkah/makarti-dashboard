import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

type Competency = { id: number; name: string };
type Course = {
  id: number;
  title: string;
  description: string;
  instructor_name: string;
  thumbnail_url: string;
  competency_id: number;
  is_published: boolean;
};
type Recommendation = {
  competency_id: number;
  competency_name: string;
  courses: Course[];
};

export default function LearningPath() {
  const [competencyScores, setCompetencyScores] = useState<Record<number, number>>({});
  const [competencyNames, setCompetencyNames] = useState<Record<number, string>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil daftar kompetensi
  const compRes = await fetch("/api/competencies-proxy");
        const compData: Competency[] = await compRes.json();
        const compNameMap = Object.fromEntries(compData.map((c) => [c.id, c.name]));
        setCompetencyNames(compNameMap);

        // 2. Ambil hasil assessment (skor kompetensi)
  const res = await fetch("/api/learning-path-proxy");
        const data = await res.json();
        setCompetencyScores(data.answers || {});

        // 3. Ambil 2 kompetensi dengan skor terendah
        const lowestCompetencies = Object.entries(data.answers || {})
          .sort((a, b) => Number(a[1]) - Number(b[1]))
          .slice(0, 2)
          .map(([id]) => Number(id));

        // 4. Ambil semua kursus
  const courseRes = await fetch("/api/course-proxy");
        const courses: Course[] = await courseRes.json();

        // 5. Buat rekomendasi
        setRecommendations(
          lowestCompetencies.map((cid) => ({
            competency_id: cid,
            competency_name: compNameMap[cid] || `Kompetensi #${cid}`,
            courses: Array.isArray(courses)
              ? courses.filter((c) => c.competency_id === cid && c.is_published)
              : [],
          }))
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Gagal memuat learning path", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  // Prepare data for Recharts RadarChart
  const radarData = Object.entries(competencyScores).map(([cid, score]) => ({
    name: competencyNames[Number(cid)] || `Kompetensi #${cid}`,
    skor: score,
    full: 5,
  }));

  return (
    <div className="min-h-screen pt-24 px-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Learning Path Anda</h1>

      {/* Radar Chart */}
      <div className="w-full h-96 mb-12">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="80%">
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#1e40af', fontWeight: 700, fontSize: 13 }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6} tick={{ fill: '#64748b' }} />
            <Radar
              name="Skor Kompetensi"
              dataKey="skor"
              stroke="#1e40af"
              fill="#1e40af"
              fillOpacity={0.2}
              dot
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-2xl font-bold text-blue-700 mb-4">Rekomendasi Kursus</h2>

      {loading ? (
        <div className="text-center text-gray-500">Memuat...</div>
      ) : recommendations.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-white border border-blue-200 p-6 rounded-2xl shadow-md"
            >
              {rec.courses.length > 0 ? (
                <>
                  <h3 className="font-bold text-lg mb-3">
                    Kompetensi: {rec.competency_name}
                  </h3>
                  {rec.courses.map((course) => (
                    <div key={course.id} className="mb-6">
                      <img
                        src={course.thumbnail_url}
                        alt=""
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                      <h4 className="font-bold text-md mb-2">{course.title}</h4>
                      <p className="text-gray-600 mb-2">{course.description}</p>
                      <p className="text-sm text-gray-500">
                        Instruktur: {course.instructor_name}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <h3 className="font-bold text-lg mb-2">
                    Kompetensi: {rec.competency_name}
                  </h3>
                  <p className="text-blue-800 bg-blue-50 border border-blue-300 p-4 rounded-lg">
                    📌 Materi untuk kompetensi ini belum tersedia. Nantikan update berikutnya 🚀
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Tidak ada rekomendasi saat ini.
        </div>
      )}
    </div>
  );
}