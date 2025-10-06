"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
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
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateItemData, setUpdateItemData] = useState<SKPItem | null>(null);
  
  // Mapping data chart untuk rata-rata persentase per tanggal
  const averageChartData = React.useMemo(() => {
    const dataByDate: { [date: string]: { tanggal: string; bigger: number; smarter: number; better: number; count: { bigger: number; smarter: number; better: number } } } = {};
    
    skpList.forEach(item => {
      const tgl = item.tanggal;
      const pilar = item.pilar.toUpperCase();
      const percent = item.targetVolume > 0 ? (item.updateVolume / item.targetVolume) * 100 : 0;
      
      if (!dataByDate[tgl]) {
        dataByDate[tgl] = { tanggal: tgl, bigger: 0, smarter: 0, better: 0, count: { bigger: 0, smarter: 0, better: 0 } };
      }
      
      if (pilar === "BIGGER") {
        dataByDate[tgl].bigger += percent;
        dataByDate[tgl].count.bigger++;
      } else if (pilar === "SMARTER") {
        dataByDate[tgl].smarter += percent;
        dataByDate[tgl].count.smarter++;
      } else if (pilar === "BETTER") {
        dataByDate[tgl].better += percent;
        dataByDate[tgl].count.better++;
      }
    });
    
    // Calculate averages
    return Object.values(dataByDate).map(item => ({
      tanggal: item.tanggal,
      bigger: item.count.bigger > 0 ? Math.round(item.bigger / item.count.bigger) : 0,
      smarter: item.count.smarter > 0 ? Math.round(item.smarter / item.count.smarter) : 0,
      better: item.count.better > 0 ? Math.round(item.better / item.count.better) : 0,
    })).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [skpList]);

  // Data untuk grafik indikator spesifik
  const indicatorChartData = React.useMemo(() => {
    if (!selectedIndicator) return [];
    
    return skpList
      .filter(item => item.indikator === selectedIndicator)
      .map(item => ({
        tanggal: item.tanggal,
        target: item.targetVolume,
        update: item.updateVolume,
        percent: item.targetVolume > 0 ? Math.round((item.updateVolume / item.targetVolume) * 100) : 0,
        pilar: item.pilar,
      }))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }, [skpList, selectedIndicator]);

  // Get unique indicators for filter
  const uniqueIndicators = React.useMemo(() => {
    return [...new Set(skpList.map(item => item.indikator))].filter(Boolean);
  }, [skpList]);

  // Get latest record for each indicator for table display
  const latestRecordsPerIndicator = React.useMemo(() => {
    const indicatorMap = new Map();
    
    skpList.forEach((item, index) => {
      const key = item.indikator;
      if (!indicatorMap.has(key) || item.tanggal > indicatorMap.get(key).tanggal) {
        indicatorMap.set(key, { ...item, originalIndex: index });
      }
    });
    
    return Array.from(indicatorMap.values()).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [skpList]);

  useEffect(() => {
    const unitKerjaId = localStorage.getItem("id");
    if (!unitKerjaId) return;
    fetch(`/api/skp_generik/${unitKerjaId}`)
      .then(res => res.json())
      .then(data => {
        const mapped = Array.isArray(data)
          ? data.map((item: { [key: string]: unknown }) => ({
              tanggal: typeof item.tanggal === "string" ? item.tanggal.split('T')[0] : "",
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
        // Set first indicator as default if not already selected
        if (mapped.length > 0 && !selectedIndicator) {
          const firstIndicator = mapped.find(item => item.indikator)?.indikator;
          if (firstIndicator) setSelectedIndicator(firstIndicator);
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleUpdateCapaian = (item: SKPItem) => {
    setUpdateItemData(item);
    setShowUpdateModal(true);
  };

  const handleSubmitUpdateCapaian = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!updateItemData) return;

    const formData = new FormData(e.currentTarget);
    const newTanggal = formData.get("tanggal") as string;
    const newUpdateVolume = Number(formData.get("updateVolume"));

    const unitKerjaId = localStorage.getItem("id");
    if (!unitKerjaId) return;

    try {
      const response = await fetch(`/api/skp_generik/${unitKerjaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tanggal: newTanggal,
          pilar: updateItemData.pilar,
          indikator: updateItemData.indikator,
          target_volume: updateItemData.targetVolume,
          target_satuan: updateItemData.targetSatuan,
          update_volume: newUpdateVolume,
          update_satuan: updateItemData.updateSatuan,
          kendala: updateItemData.kendala || null,
        }),
      });

      if (response.ok) {
        // Refresh data
        const updatedResponse = await fetch(`/api/skp_generik/${unitKerjaId}`);
        const updatedData = await updatedResponse.json();
        const mapped = Array.isArray(updatedData)
          ? updatedData.map((item: { [key: string]: unknown }) => ({
              tanggal: typeof item.tanggal === "string" ? item.tanggal.split('T')[0] : "",
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
        setShowUpdateModal(false);
        setUpdateItemData(null);
      }
    } catch (error) {
      console.error('Error updating capaian:', error);
    }
  };

  const calcProgress = (target: number, update: number) => {
    if (!target || target === 0) return 0;
    return Math.min((update / target) * 100, 100);
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen relative">
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

      {/* Chart Line Rata-rata Persentase per Pilar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Chart BIGGER */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-2 text-blue-700">BIGGER - Rata-rata Persentase</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={averageChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, "Rata-rata BIGGER"]} />
              <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: 13 }} />
              <Line type="monotone" dataKey="bigger" name="% Capaian" stroke="#1d4ed8" strokeWidth={3} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Chart SMARTER */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-2 text-green-700">SMARTER - Rata-rata Persentase</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={averageChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, "Rata-rata SMARTER"]} />
              <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: 13 }} />
              <Line type="monotone" dataKey="smarter" name="% Capaian" stroke="#059669" strokeWidth={3} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Chart BETTER */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-2 text-yellow-700">BETTER - Rata-rata Persentase</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={averageChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, "Rata-rata BETTER"]} />
              <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: 13 }} />
              <Line type="monotone" dataKey="better" name="% Capaian" stroke="#b45309" strokeWidth={3} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter dan Chart Progress Indikator */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-bold text-gray-800">Progress Indikator Spesifik</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="indicator-filter" className="text-sm font-medium text-gray-700">Filter Indikator:</label>
            <select
              id="indicator-filter"
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[200px]"
            >
              <option value="">Pilih Indikator</option>
              {uniqueIndicators.map((indicator) => (
                <option key={indicator} value={indicator}>{indicator}</option>
              ))}
            </select>
          </div>
        </div>
        {selectedIndicator && indicatorChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={indicatorChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: 13 }} />
              <Line type="monotone" dataKey="target" name="Target" stroke="#6b7280" strokeWidth={2} connectNulls strokeDasharray="5 5" />
              <Line type="monotone" dataKey="update" name="Realisasi" stroke="#3b82f6" strokeWidth={3} connectNulls />
              <Line type="monotone" dataKey="percent" name="% Capaian" stroke="#f43f5e" strokeWidth={2} connectNulls yAxisId="right" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[0, 100]} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {selectedIndicator ? "Tidak ada data untuk indikator yang dipilih" : "Silakan pilih indikator untuk melihat progress"}
          </div>
        )}
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
                <p className="text-sm text-blue-100">Menampilkan {latestRecordsPerIndicator.length} indikator (data terakhir)</p>
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
              {latestRecordsPerIndicator.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-gray-500 italic">Belum ada data</td>
                </tr>
              ) : (
                latestRecordsPerIndicator.map((item, index) => {
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
                      <td className="px-4 py-2 border">
                        <div className="flex items-center gap-2">
                          <span>{update}</span>
                          <button
                            onClick={() => handleUpdateCapaian(item)}
                            className="inline-flex items-center justify-center text-green-600 hover:bg-green-50 rounded-lg p-1 transition"
                            title="Update Capaian"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
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
                            onClick={() => handleEdit(item.originalIndex)}
                            className="inline-flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition"
                            title="Ubah"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.originalIndex)}
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

      {/* Modal Update Capaian */}
      {showUpdateModal && updateItemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
            <h2 className="text-xl font-bold mb-6 text-green-700">
              Update Capaian - {updateItemData.indikator}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmitUpdateCapaian}>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Data Saat Ini:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Tanggal:</span> {updateItemData.tanggal}</div>
                  <div><span className="font-medium">Pilar:</span> {updateItemData.pilar}</div>
                  <div><span className="font-medium">Target:</span> {updateItemData.targetVolume} {updateItemData.targetSatuan}</div>
                  <div><span className="font-medium">Capaian:</span> {updateItemData.updateVolume} {updateItemData.updateSatuan}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label
                  htmlFor="tanggal-update"
                  className="w-32 text-sm font-medium text-gray-700"
                >
                  Tanggal Update
                </label>
                <input
                  type="date"
                  id="tanggal-update"
                  name="tanggal"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div className="flex items-center gap-4">
                <label
                  htmlFor="updateVolume-new"
                  className="w-32 text-sm font-medium text-gray-700"
                >
                  Update Capaian
                </label>
                <input
                  type="number"
                  id="updateVolume-new"
                  name="updateVolume"
                  required
                  step="0.01"
                  defaultValue={updateItemData.updateVolume}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder={`Satuan: ${updateItemData.updateSatuan}`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setUpdateItemData(null);
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Update Capaian
                </button>
              </div>
            </form>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => {
                setShowUpdateModal(false);
                setUpdateItemData(null);
              }}
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
