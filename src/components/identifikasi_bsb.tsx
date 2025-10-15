import React, { useEffect, useState } from "react";

type Competency = {
  question: string;
};

export default function IdentifikasiBSB() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
  const res = await fetch("/api/assessment-proxy");
        const data = await res.json();
        console.log('API assessment response:', data);
        if (data.assessment && Array.isArray(data.assessment) && data.assessment.length > 0) {
          setCompetencies(data.assessment);
          setAnswers(Array(data.assessment.length).fill(null));
        } else if (data.assessment && Array.isArray(data.assessment) && data.assessment.length === 0) {
          setError("Assessment kosong.");
        } else {
          setError("Format data assessment tidak sesuai. Cek console.");
        }
      } catch {
        setError("Gagal memuat assessment.");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, []);

  const handleChange = (index: number, value: number) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.length !== competencies.length || answers.includes(null)) {
      alert("Mohon isi semua jawaban terlebih dahulu!");
      return;
    }
    try {
      const user_id = 1; // Ganti dengan user_id yang sesuai
      const res = await fetch("https://makarti-corpu.vercel.app/api/assessment_answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, answers }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setShowResult(true);
      setTimeout(() => {
        window.location.href = "/learning-path";
      }, 1500);
    } catch {
      alert("Gagal mengirim jawaban assessment.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Memuat assessment...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen pt-24 px-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        Identifikasi Pengembangan Kapasitas BSB
      </h1>
      <p className="text-gray-600 mb-8">
        Jawablah pertanyaan berikut sesuai kondisi nyata Anda.
      </p>

      {!showResult ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {competencies.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md border border-blue-200 relative"
            >
              <div className="absolute -top-4 -left-4 bg-blue-100 rounded-full p-2 shadow-md flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#2563eb"/><text x="12" y="17" textAnchor="middle" fontSize="16" fill="white" fontFamily="Arial" fontWeight="bold">?</text></svg>
              </div>
              <p className="font-semibold mb-2 pl-8">
                {index + 1}. {item.question}
              </p>
              <div className="flex gap-4 pl-8">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`c${index}`}
                      value={n}
                      checked={answers[index] === n}
                      onChange={() => handleChange(index, n)}
                      className="text-blue-600 focus:ring-blue-400"
                    />
                    <span>{n}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-2 pl-8">
                1 = Sangat Tidak Setuju, 5 = Sangat Setuju
              </p>
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all"
          >
            Kirim Jawaban
          </button>
        </form>
      ) : (
        <div className="p-8 text-center text-green-700 font-bold text-xl">
          Jawaban assessment berhasil dikirim! Anda akan diarahkan ke learning path...
        </div>
      )}
    </div>
  );
}