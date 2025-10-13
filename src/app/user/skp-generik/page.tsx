"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
// ChartContainer dihapus karena tidak digunakan
type SKPItem = {
  id?: number;
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
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  
  // Mapping data chart untuk rata-rata persentase per tanggal dengan capaian terakhir per indikator
  const averageChartData = React.useMemo(() => {
    if (skpList.length === 0) return [];

    // Get all unique dates and sort them
    const allDates = [...new Set(skpList.map(item => item.tanggal))].sort();
    
    // Get all unique indicators per pilar
    const indicatorsByPilar = {
      BIGGER: [...new Set(skpList.filter(item => item.pilar.toUpperCase() === 'BIGGER').map(item => item.indikator))],
      SMARTER: [...new Set(skpList.filter(item => item.pilar.toUpperCase() === 'SMARTER').map(item => item.indikator))],
      BETTER: [...new Set(skpList.filter(item => item.pilar.toUpperCase() === 'BETTER').map(item => item.indikator))]
    };

    // Function to get latest value for an indicator up to a specific date
    const getLatestValueUpToDate = (indicator: string, targetDate: string) => {
      const relevantRecords = skpList
        .filter(item => item.indikator === indicator && item.tanggal <= targetDate)
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      
      if (relevantRecords.length === 0) return null;
      
      const latestRecord = relevantRecords[0];
      return latestRecord.targetVolume > 0 ? (latestRecord.updateVolume / latestRecord.targetVolume) * 100 : 0;
    };

    // Calculate average for each date
    const chartData = allDates.map(date => {
      const biggerValues = indicatorsByPilar.BIGGER
        .map(indicator => getLatestValueUpToDate(indicator, date))
        .filter(value => value !== null) as number[];
      
      const smarterValues = indicatorsByPilar.SMARTER
        .map(indicator => getLatestValueUpToDate(indicator, date))
        .filter(value => value !== null) as number[];
      
      const betterValues = indicatorsByPilar.BETTER
        .map(indicator => getLatestValueUpToDate(indicator, date))
        .filter(value => value !== null) as number[];

      return {
        tanggal: date,
        bigger: biggerValues.length > 0 ? Math.round(biggerValues.reduce((sum, val) => sum + val, 0) / biggerValues.length) : 0,
        smarter: smarterValues.length > 0 ? Math.round(smarterValues.reduce((sum, val) => sum + val, 0) / smarterValues.length) : 0,
        better: betterValues.length > 0 ? Math.round(betterValues.reduce((sum, val) => sum + val, 0) / betterValues.length) : 0,
      };
    });

    return chartData;
  }, [skpList]);

  // Data untuk grafik indikator spesifik (tanpa forward-fill, menampilkan data aktual)
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
    const userId = localStorage.getItem("id");
    if (!userId) {
      console.log('SKP: userId not found in localStorage');
      return;
    }
    
    console.log('SKP: Fetching data for userId:', userId);
    // Try the new endpoint that handles user lookup
    fetch(`/api/skp_generik/by-user/${userId}`)
      .then(res => {
        console.log('SKP: API response status:', res.status);
        return res.json();
      })
      .then(response => {
        console.log('SKP: Raw API response:', response);
        const data = response.data || response; // Handle both response formats
        const mapped = Array.isArray(data)
          ? data.map((item: { [key: string]: unknown }) => ({
              id: typeof item.id === "number" ? item.id : Number(item.id) || undefined,
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
        
        console.log('SKP: Mapped data:', mapped);
        console.log('SKP: Data is array?', Array.isArray(data));
        console.log('SKP: Data length:', data?.length);
        
        setSkpList(mapped);
        // Set first indicator as default if not already selected
        if (mapped.length > 0 && !selectedIndicator) {
          const firstIndicator = mapped.find(item => item.indikator)?.indikator;
          if (firstIndicator) setSelectedIndicator(firstIndicator);
        }
      })
      .catch(error => {
        console.error('SKP: Error fetching data:', error);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newItem: Partial<SKPItem> = Object.fromEntries(formData.entries());
    
    console.log('SKP Add: Form data received:', newItem);
    
    // Validate required fields
    if (!newItem.tanggal || !newItem.pilar || !newItem.indikator || 
        !newItem.targetVolume || !newItem.targetSatuan || 
        !newItem.updateVolume || !newItem.updateSatuan) {
      alert("Semua field wajib diisi kecuali kendala.");
      return;
    }
    
    const userId = localStorage.getItem("id");
    if (!userId) {
      alert("User ID tidak ditemukan. Silakan login ulang.");
      return;
    }

    if (editIndex !== null) {
      // edit mode - TODO: Implement update API call
      const updatedList = [...skpList];
      updatedList[editIndex] = {
        ...updatedList[editIndex],
        ...newItem,
        targetVolume: Number(newItem.targetVolume),
        updateVolume: Number(newItem.updateVolume),
      } as SKPItem;
      setSkpList(updatedList);
      setEditIndex(null);
      form.reset();
      setShowModal(false);
      return;
    }

    // add mode - Save to database
    try {
      console.log('SKP Add: Starting save process...');
      
      // Get unit_kerja_id
      const userInfoResponse = await fetch(`/api/skp_generik/by-user/${userId}`);
      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user information');
      }
      
      const userInfo = await userInfoResponse.json();
      const unitKerjaId = userInfo.user_info?.unit_kerja_id || userId;
      
      console.log('SKP Add: Using unit_kerja_id:', unitKerjaId);

      const requestData = {
        tanggal: newItem.tanggal,
        pilar: newItem.pilar,
        indikator: newItem.indikator,
        target_volume: Number(newItem.targetVolume),
        target_satuan: newItem.targetSatuan,
        update_volume: Number(newItem.updateVolume),
        update_satuan: newItem.updateSatuan,
        kendala: newItem.kendala || null,
      };
      
      console.log('SKP Add: Sending data:', requestData);

      // Save to database
      const response = await fetch(`/api/skp_generik/${unitKerjaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('SKP Add: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('SKP Add: Error response:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('SKP Add: Success response:', responseData);

      // Add the new item to local state immediately for better UX
      const newSKPItem: SKPItem = {
        id: responseData.id,
        tanggal: typeof responseData.tanggal === "string" ? responseData.tanggal.split('T')[0] : newItem.tanggal as string,
        pilar: responseData.pilar || newItem.pilar as string,
        indikator: responseData.indikator || newItem.indikator as string,
        targetVolume: responseData.target_volume || Number(newItem.targetVolume),
        targetSatuan: responseData.target_satuan || newItem.targetSatuan as string,
        updateVolume: responseData.update_volume || Number(newItem.updateVolume),
        updateSatuan: responseData.update_satuan || newItem.updateSatuan as string,
        kendala: responseData.kendala || newItem.kendala as string || "",
      };
      
      // Update state immediately
      setSkpList(prevList => [...prevList, newSKPItem]);

      // Reset form and close modal since save was successful
      form.reset();
      setShowModal(false);

      console.log('SKP Add: Data saved and added to local state successfully');
      
    } catch (error) {
      console.error('SKP Add: Error:', error);
      
      if (error instanceof Error) {
        // Check if it's a network error
        if (error.message.includes('fetch') || error.message.includes('network')) {
          alert('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        } else {
          alert(`Terjadi kesalahan saat menyimpan data: ${error.message}`);
        }
      } else {
        alert('Terjadi kesalahan tidak diketahui saat menyimpan data. Silakan coba lagi.');
      }
    }
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    const itemToDelete = skpList[index];
    const userId = localStorage.getItem("id");
    if (!userId || !itemToDelete.id) {
      alert("Data tidak valid atau user ID tidak ditemukan.");
      return;
    }

    try {
      console.log('SKP Delete: Deleting item from database, ID:', itemToDelete.id);
      
      // First, get the correct unit_kerja_id
      const userInfoResponse = await fetch(`/api/skp_generik/by-user/${userId}`);
      const userInfo = await userInfoResponse.json();
      const unitKerjaId = userInfo.user_info?.unit_kerja_id || userId;
      
      console.log('SKP Delete: Using unit_kerja_id:', unitKerjaId);

      const response = await fetch(`/api/skp_generik/${unitKerjaId}/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('SKP Delete: Successfully deleted from database');
        
        // Refresh data from database
        const updatedResponse = await fetch(`/api/skp_generik/by-user/${userId}`);
        const updatedResponseData = await updatedResponse.json();
        const updatedData = updatedResponseData.data || updatedResponseData;
        const mapped = Array.isArray(updatedData)
          ? updatedData.map((item: { [key: string]: unknown }) => ({
              id: typeof item.id === "number" ? item.id : Number(item.id) || undefined,
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
        console.log('SKP Delete: Updated local state with fresh data');
      } else {
        const errorData = await response.json();
        console.error('SKP Delete: Failed to delete:', errorData);
        alert(`Gagal menghapus data: ${errorData.error || 'Error tidak diketahui'}`);
      }
      
    } catch (error) {
      console.error('SKP Delete: Error:', error);
      alert('Terjadi kesalahan saat menghapus data.');
    }
  };

  const handleUpdateCapaian = (item: SKPItem) => {
    setUpdateItemData(item);
    setShowUpdateModal(true);
  };

  const handleEditHistory = (item: SKPItem) => {
    const historyId = `${item.tanggal}-${item.indikator}`;
    setEditingHistoryId(historyId);
    setEditingValue(item.updateVolume.toString());
  };

  const handleSaveHistoryEdit = async (item: SKPItem) => {
    if (!editingValue || !updateItemData) return;

    const unitKerjaId = localStorage.getItem("id");
    if (!unitKerjaId) return;

    try {
      // Assuming we need to update the existing record
      // This would require an UPDATE API endpoint, but for now we'll update locally
      const updatedList = skpList.map(skpItem => 
        skpItem.tanggal === item.tanggal && skpItem.indikator === item.indikator
          ? { ...skpItem, updateVolume: Number(editingValue) }
          : skpItem
      );
      
      setSkpList(updatedList);
      setEditingHistoryId(null);
      setEditingValue("");
      
      // In a real app, you would also call an API to update the database
      // await fetch(`/api/skp_generik/${unitKerjaId}/${item.id}`, { method: 'PUT', ... })
      
    } catch (error) {
      console.error('Error updating history:', error);
    }
  };

  const handleCancelHistoryEdit = () => {
    setEditingHistoryId(null);
    setEditingValue("");
  };

  const handleDeleteHistory = async (item: SKPItem) => {
    if (!confirm(`Hapus data capaian tanggal ${item.tanggal}?`)) return;

    const unitKerjaId = localStorage.getItem("id");
    if (!unitKerjaId) return;

    try {
      // Update local state by removing the item
      const updatedList = skpList.filter(skpItem => 
        !(skpItem.tanggal === item.tanggal && skpItem.indikator === item.indikator && skpItem.pilar === item.pilar)
      );
      
      setSkpList(updatedList);
      
      // In a real app, you would also call an API to delete from database
      // await fetch(`/api/skp_generik/${unitKerjaId}/${item.id}`, { method: 'DELETE' })
      
    } catch (error) {
      console.error('Error deleting history:', error);
    }
  };

  const handleSubmitUpdateCapaian = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!updateItemData) return;

    const formData = new FormData(e.currentTarget);
    const newTanggal = formData.get("tanggal") as string;
    const newUpdateVolume = Number(formData.get("updateVolume"));

    const userId = localStorage.getItem("id");
    if (!userId) return;

    // First, get the correct unit_kerja_id
    const userInfoResponse = await fetch(`/api/skp_generik/by-user/${userId}`);
    const userInfo = await userInfoResponse.json();
    const unitKerjaId = userInfo.user_info?.unit_kerja_id || userId;
    
    console.log('SKP Update: Using unit_kerja_id:', unitKerjaId);

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
        // Refresh data using the by-user endpoint
        const updatedResponse = await fetch(`/api/skp_generik/by-user/${userId}`);
        const updatedResponseData = await updatedResponse.json();
        const updatedData = updatedResponseData.data || updatedResponseData;
        const mapped = Array.isArray(updatedData)
          ? updatedData.map((item: { [key: string]: unknown }) => ({
              id: typeof item.id === "number" ? item.id : Number(item.id) || undefined,
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
                  required
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
                  required
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
                  required
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
                    required
                    min="0"
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
                    required
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
                    required
                    min="0"
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
                    required
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
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-green-700">
              Update Capaian - {updateItemData.indikator}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Update Capaian */}
              <div>
                <form className="space-y-4" onSubmit={handleSubmitUpdateCapaian}>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Data Saat Ini:</h3>
                    <div className="grid grid-cols-1 gap-2 text-sm">
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
              </div>

              {/* Histori Update Capaian */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Histori Update Capaian</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Update Capaian
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {skpList
                        .filter(item => item.indikator === updateItemData.indikator)
                        .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
                        .map((item, index) => {
                          const historyId = `${item.tanggal}-${item.indikator}`;
                          const isEditing = editingHistoryId === historyId;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-100">
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                {item.tanggal}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
                                    />
                                    <span className="text-xs text-gray-500">{item.updateSatuan}</span>
                                  </div>
                                ) : (
                                  `${item.updateVolume}`
                                )}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleSaveHistoryEdit(item)}
                                      className="inline-flex items-center justify-center text-green-600 hover:bg-green-50 rounded p-1 transition"
                                      title="Simpan"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={handleCancelHistoryEdit}
                                      className="inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded p-1 transition"
                                      title="Batal"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleEditHistory(item)}
                                      className="inline-flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded p-1 transition"
                                      title="Edit"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteHistory(item)}
                                      className="inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded p-1 transition"
                                      title="Hapus"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      {skpList.filter(item => item.indikator === updateItemData.indikator).length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-4 text-center text-sm text-gray-500 italic">
                            Belum ada histori update
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
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
