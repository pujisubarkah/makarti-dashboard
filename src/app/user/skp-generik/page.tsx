"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
// ChartContainer dihapus karena tidak digunakan
type SKPItem = {
  tanggal: string;
  pilar: string;
  indikator: string;
  targetVolume: number;
  targetSatuan: string;
  updateVolume: number;
  updateSatuan: string;
  kendala: string;
};
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SKPGenerikPage() {

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [skpList, setSkpList] = useState<SKPItem[]>([]);
  // Mapping data chart agar X adalah tanggal dan tiap pilar jadi line
  const chartData = React.useMemo(() => {
    // Group by tanggal dan pilar, untuk 3 chart terpisah
    const bigger: { tanggal: string; target: number; update: number; percent: number }[] = [];
    const smarter: { tanggal: string; target: number; update: number; percent: number }[] = [];
    const better: { tanggal: string; target: number; update: number; percent: number }[] = [];
    const byPilar: Record<string, { [tgl: string]: { tanggal: string; target: number; update: number; percent: number } }> = {
      BIGGER: {}, SMARTER: {}, BETTER: {}
    };
    skpList.forEach(item => {
      const tgl = item.tanggal.slice(0, 10);
      const pilar = item.pilar.toUpperCase();
      if (pilar === "BIGGER" || pilar === "SMARTER" || pilar === "BETTER") {
        if (!byPilar[pilar][tgl]) byPilar[pilar][tgl] = { tanggal: tgl, target: 0, update: 0, percent: 0 };
        byPilar[pilar][tgl].target = item.targetVolume;
        byPilar[pilar][tgl].update = item.updateVolume;
        byPilar[pilar][tgl].percent = item.targetVolume > 0 ? Math.round((item.updateVolume / item.targetVolume) * 100) : 0;
      }
    });
    bigger.push(...Object.values(byPilar.BIGGER).sort((a, b) => a.tanggal.localeCompare(b.tanggal)));
    smarter.push(...Object.values(byPilar.SMARTER).sort((a, b) => a.tanggal.localeCompare(b.tanggal)));
    better.push(...Object.values(byPilar.BETTER).sort((a, b) => a.tanggal.localeCompare(b.tanggal)));
    return { bigger, smarter, better };
  }, [skpList]);

  useEffect(() => {
    const unitKerjaId = localStorage.getItem("id");
    if (!unitKerjaId) return;
    fetch(`/api/skp_generik/${unitKerjaId}`)
      .then(res => res.json())
      .then(data => {
        const mapped = Array.isArray(data)
          ? data.map((item: { [key: string]: unknown }) => ({
              tanggal: typeof item.tanggal === "string" ? item.tanggal : "",
              pilar: typeof item.pilar === "string" ? item.pilar : "",
              indikator: typeof item.indikator === "string" ? item.indikator : "",
              targetVolume: typeof item.target_volume === "number" ? item.target_volume : Number(item.target_volume) || 0,
              targetSatuan: typeof item.target_satuan === "string" ? item.target_satuan : "",
              updateVolume: typeof item.update_volume === "number" ? item.update_volume : Number(item.update_volume) || 0,
              updateSatuan: typeof item.update_satuan === "string" ? item.update_satuan : "",
              kendala: typeof item.kendala === "string" ? item.kendala : "",
            }))
          : [];
        setSkpList(mapped);
      });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: Partial<SKPItem> = Object.fromEntries(formData.entries());
    if (editIndex !== null) {
      // edit mode
      const updatedList = [...skpList];
      updatedList[editIndex] = {
        ...updatedList[editIndex],
        ...newItem,
        targetVolume: Number(newItem.targetVolume),
        updateVolume: Number(newItem.updateVolume),
      } as SKPItem;
      setSkpList(updatedList);
      setEditIndex(null);
    } else {
      // add mode
      setSkpList([
        ...skpList,
        {
          ...newItem,
          targetVolume: Number(newItem.targetVolume),
          updateVolume: Number(newItem.updateVolume),
        } as SKPItem,
      ]);
    }
    setShowModal(false);
    e.currentTarget.reset();
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = (index: number) => {
    setSkpList(skpList.filter((_, i) => i !== index));
  };

  const calcProgress = (target: number, update: number) => {
    if (!target || target === 0) return 0;
    return Math.min((update / target) * 100, 100);
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen relative">
      {/* Watermark Data Dummy */}
      <div className="pointer-events-none select-none absolute top-10 right-10 opacity-30 text-5xl font-extrabold text-blue-400 z-10" style={{transform: 'rotate(-20deg)'}}>DATA DUMMY</div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard SKP Generik</h1>
          <p className="text-blue-600">Kelola dan monitor capaian SKP generik Anda</p>
        </div>
        <button
          onClick={() => {
            setEditIndex(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold"
        >
          Tambah SKP
        </button>
      </div>

      {/* Chart Line Perbandingan Target dan Realisasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Chart BIGGER */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-2 text-blue-700">BIGGER</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.bigger} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: 13 }} />
              <Line type="monotone" dataKey="target" name="Target" stroke="#1d4ed8" strokeWidth={2} connectNulls strokeDasharray="6 3" />
              <Line type="monotone" dataKey="update" name="Update" stroke="#3b82f6" strokeWidth={3} connectNulls />
              <Line type="monotone" dataKey="percent" name="% Capaian" stroke="#f43f5e" strokeWidth={2} connectNulls yAxisId="right" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 100]} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Chart SMARTER */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-2 text-green-700">SMARTER</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.smarter} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: 13 }} />
              <Line type="monotone" dataKey="target" name="Target" stroke="#059669" strokeWidth={2} connectNulls strokeDasharray="6 3" />
              <Line type="monotone" dataKey="update" name="Update" stroke="#22c55e" strokeWidth={3} connectNulls />
              <Line type="monotone" dataKey="percent" name="% Capaian" stroke="#f43f5e" strokeWidth={2} connectNulls yAxisId="right" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 100]} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Chart BETTER */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-2 text-yellow-700">BETTER</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.better} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: 13 }} />
              <Line type="monotone" dataKey="target" name="Target" stroke="#b45309" strokeWidth={2} connectNulls strokeDasharray="6 3" />
              <Line type="monotone" dataKey="update" name="Update" stroke="#f59e42" strokeWidth={3} connectNulls />
              <Line type="monotone" dataKey="percent" name="% Capaian" stroke="#f43f5e" strokeWidth={2} connectNulls yAxisId="right" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 100]} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Detail SKP Generik</h2>
              <p className="text-blue-100 text-sm">Daftar capaian dan target SKP generik</p>
            </div>
            {skpList.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-blue-100">Menampilkan {skpList.length} data</p>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border">Tanggal</th>
                <th className="px-4 py-2 border">Pilar</th>
                <th className="px-4 py-2 border">Indikator</th>
                <th className="px-4 py-2 border">Target Volume</th>
                <th className="px-4 py-2 border">Target Satuan</th>
                <th className="px-4 py-2 border">Update Volume</th>
                <th className="px-4 py-2 border">Update Satuan</th>
                <th className="px-4 py-2 border">Kendala</th>
                <th className="px-4 py-2 border">Progress</th>
                <th className="px-4 py-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {skpList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-gray-500 italic">Belum ada data</td>
                </tr>
              ) : (
                skpList.map((item, index) => {
                  const target = Number(item.targetVolume) || 0;
                  const update = Number(item.updateVolume) || 0;
                  const progress = calcProgress(target, update);
                  return (
                    <tr key={index} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-2 border">{item.tanggal}</td>
                      <td className="px-4 py-2 border">{item.pilar}</td>
                      <td className="px-4 py-2 border">{item.indikator}</td>
                      <td className="px-4 py-2 border">{target}</td>
                      <td className="px-4 py-2 border">{item.targetSatuan}</td>
                      <td className="px-4 py-2 border">{update}</td>
                      <td className="px-4 py-2 border">{item.updateSatuan}</td>
                      <td className="px-4 py-2 border">{item.kendala || '-'}</td>
                      <td className="px-4 py-2 border">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${progress >= 100 ? "bg-green-600" : progress >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{progress.toFixed(0)}%</span>
                      </td>
                      <td className="px-4 py-2 border">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEdit(index)}
                            className="inline-flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition"
                            title="Ubah"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg p-2 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
            <h2 className="text-xl font-bold mb-6 text-blue-700">
              {editIndex !== null ? "Edit SKP Generik" : "Form SKP Generik"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="tanggal"
                  className="w-48 text-sm font-medium text-gray-700"
                >
                  Tanggal Pelaporan
                </label>
                <input
                  type="date"
                  id="tanggal"
                  name="tanggal"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  defaultValue={
                    editIndex !== null && skpList[editIndex] ? skpList[editIndex].tanggal : ""
                  }
                />
              </div>

              <div className="flex items-center gap-4">
                <label
                  htmlFor="pilar"
                  className="w-48 text-sm font-medium text-gray-700"
                >
                  Pilar
                </label>
                <select
                  id="pilar"
                  name="pilar"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  defaultValue={
                    editIndex !== null && skpList[editIndex] ? skpList[editIndex].pilar : "BIGGER"
                  }
                >
                  <option value="BIGGER">BIGGER</option>
                  <option value="SMARTER">SMARTER</option>
                  <option value="BETTER">BETTER</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label
                  htmlFor="indikator"
                  className="w-48 text-sm font-medium text-gray-700"
                >
                  Indikator Kinerja
                </label>
                <textarea
                  id="indikator"
                  name="indikator"
                  rows={2}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Masukkan indikator kinerja..."
                  defaultValue={
                    editIndex !== null && skpList[editIndex] ? skpList[editIndex].indikator : ""
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <label
                  htmlFor="kendala"
                  className="w-48 text-sm font-medium text-gray-700"
                >
                  Kendala
                </label>
                <textarea
                  id="kendala"
                  name="kendala"
                  rows={2}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Masukkan kendala (jika ada)..."
                  defaultValue={
                    editIndex !== null && skpList[editIndex] ? skpList[editIndex].kendala : ""
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="targetVolume"
                    className="text-sm font-medium text-gray-700 min-w-max"
                  >
                    Target Volume
                  </label>
                  <input
                    type="number"
                    id="targetVolume"
                    name="targetVolume"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    defaultValue={
                      editIndex !== null && skpList[editIndex] ? skpList[editIndex].targetVolume : ""
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="targetSatuan"
                    className="text-sm font-medium text-gray-700 min-w-max"
                  >
                    Target Satuan
                  </label>
                  <input
                    type="text"
                    id="targetSatuan"
                    name="targetSatuan"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    defaultValue={
                      editIndex !== null && skpList[editIndex] ? skpList[editIndex].targetSatuan : ""
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="updateVolume"
                    className="text-sm font-medium text-gray-700 min-w-max"
                  >
                    Update Volume
                  </label>
                  <input
                    type="number"
                    id="updateVolume"
                    name="updateVolume"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    defaultValue={
                      editIndex !== null && skpList[editIndex] ? skpList[editIndex].updateVolume : ""
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="updateSatuan"
                    className="text-sm font-medium text-gray-700 min-w-max"
                  >
                    Update Satuan
                  </label>
                  <input
                    type="text"
                    id="updateSatuan"
                    name="updateSatuan"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    defaultValue={
                      editIndex !== null && skpList[editIndex] ? skpList[editIndex].updateSatuan : ""
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                  onClick={() => {
                    setShowModal(false);
                    setEditIndex(null);
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Simpan
                </button>
              </div>
            </form>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
