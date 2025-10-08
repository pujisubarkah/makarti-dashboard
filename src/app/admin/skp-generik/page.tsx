"use client";
import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

type SKPItem = {
  tanggal: string;
  pilar: string;
  indikator: string;
  targetVolume: number;
  targetSatuan: string;
  updateVolume: number;
  updateSatuan: string;
  kendala: string;
  unit_kerja_id: number;
  unit_kerja?: string;
};

type UnitKerja = {
  id: number;
  unit_kerja: string;
};

export default function SKPGenerikAdminPage() {
  const [skpList, setSkpList] = useState<SKPItem[]>([]);
  const [unitList, setUnitList] = useState<UnitKerja[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    fetchSKPData();
    fetchUnitList();
  }, []);

  const fetchSKPData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/skp_generik');
      const data = await response.json();
      
      if (Array.isArray(data)) {
		const mapped = data.map((item: {
		  tanggal: string;
		  pilar: string;
		  indikator: string;
		  target_volume: number | string;
		  target_satuan: string;
		  update_volume: number | string;
		  update_satuan: string;
		  kendala: string;
		  unit_kerja_id: number;
		}) => ({
		  tanggal: typeof item.tanggal === "string" ? item.tanggal.split('T')[0] : "",
		  pilar: typeof item.pilar === "string" ? item.pilar : "",
		  indikator: typeof item.indikator === "string" ? item.indikator : "",
		  targetVolume: typeof item.target_volume === "number" ? item.target_volume : Number(item.target_volume) || 0,
		  targetSatuan: typeof item.target_satuan === "string" ? item.target_satuan : "",
		  updateVolume: typeof item.update_volume === "number" ? item.update_volume : Number(item.update_volume) || 0,
		  updateSatuan: typeof item.update_satuan === "string" ? item.update_satuan : "",
		  kendala: typeof item.kendala === "string" ? item.kendala : "",
		  unit_kerja_id: item.unit_kerja_id || 0,
		}));
        setSkpList(mapped);
      }
    } catch (error) {
      console.error('Error fetching SKP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitList = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
	  if (data.users && Array.isArray(data.users)) {
		// Define a type for user
		type User = { id: number; unit_kerja: string };
		// Extract unique unit_kerja values
		const uniqueUnits = data.users
		  .filter((user: User) => user.unit_kerja)
		  .reduce((acc: UnitKerja[], user: User) => {
			if (!acc.find(u => u.unit_kerja === user.unit_kerja)) {
			  acc.push({
				id: user.id,
				unit_kerja: user.unit_kerja
			  });
			}
			return acc;
		  }, [])
		  .sort((a: UnitKerja, b: UnitKerja) => a.unit_kerja.localeCompare(b.unit_kerja));
		
		setUnitList(uniqueUnits);
	  }
    } catch (error) {
      console.error('Error fetching unit list:', error);
    }
  };

  // Filter data based on selected unit and search query
  const filteredSKPData = React.useMemo(() => {
    let filtered = skpList;

    // Filter by unit
    if (selectedUnit) {
      // Find unit_kerja_id based on selected unit name
      const selectedUnitObj = unitList.find(unit => unit.unit_kerja === selectedUnit);
      if (selectedUnitObj) {
        filtered = filtered.filter(item => item.unit_kerja_id === selectedUnitObj.id);
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.pilar.toLowerCase().includes(query) ||
        item.indikator.toLowerCase().includes(query) ||
        item.kendala.toLowerCase().includes(query) ||
        item.tanggal.includes(query)
      );
    }

    return filtered;
  }, [skpList, selectedUnit, searchQuery, unitList]);

  // Mapping data chart untuk rata-rata persentase per tanggal dengan capaian terakhir per indikator
  const averageChartData = React.useMemo(() => {
    if (filteredSKPData.length === 0) return [];

    const allDates = [...new Set(filteredSKPData.map(item => item.tanggal))].sort();
    
    const indicatorsByPilar = {
      BIGGER: [...new Set(filteredSKPData.filter(item => item.pilar.toUpperCase() === 'BIGGER').map(item => item.indikator))],
      SMARTER: [...new Set(filteredSKPData.filter(item => item.pilar.toUpperCase() === 'SMARTER').map(item => item.indikator))],
      BETTER: [...new Set(filteredSKPData.filter(item => item.pilar.toUpperCase() === 'BETTER').map(item => item.indikator))]
    };

    const getLatestValueUpToDate = (indicator: string, targetDate: string) => {
      const relevantRecords = filteredSKPData
        .filter(item => item.indikator === indicator && item.tanggal <= targetDate)
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      
      if (relevantRecords.length === 0) return null;
      
      const latestRecord = relevantRecords[0];
      return latestRecord.targetVolume > 0 ? (latestRecord.updateVolume / latestRecord.targetVolume) * 100 : 0;
    };

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
  }, [filteredSKPData]);

  // Get latest record for each indicator for table display
  const latestRecordsPerIndicator = React.useMemo(() => {
    const indicatorMap = new Map();
    
    filteredSKPData.forEach((item, index) => {
      const key = `${item.indikator}-${item.unit_kerja_id}`;
      if (!indicatorMap.has(key) || item.tanggal > indicatorMap.get(key).tanggal) {
        // Add unit_kerja name to item
        const unitName = unitList.find(unit => unit.id === item.unit_kerja_id)?.unit_kerja || 'Unknown Unit';
        indicatorMap.set(key, { ...item, unit_kerja: unitName, originalIndex: index });
      }
    });
    
    return Array.from(indicatorMap.values()).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [filteredSKPData, unitList]);

  const calcProgress = (target: number, update: number) => {
    if (!target || target === 0) return 0;
    return Math.min((update / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

	return (
		<div className="p-6 space-y-8 bg-gray-50 min-h-screen relative">
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard SKP Generik - Admin</h1>
					<p className="text-blue-600">Monitor dan lihat capaian SKP generik dari seluruh unit kerja</p>
				</div>
				<div className="text-right">
					<p className="text-sm text-gray-600">Total Data: {filteredSKPData.length}</p>
					<p className="text-sm text-gray-600">Unit Aktif: {unitList.length}</p>
				</div>
			</div>

			{/* Filter Controls */}
			<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
				<h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
					<Filter className="w-5 h-5 mr-2" />
					Filter & Pencarian Data
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Unit Filter */}
					<div>
						<label htmlFor="unit-filter" className="block text-sm font-medium text-gray-700 mb-2">
							Filter Unit Kerja
						</label>
						<select
							id="unit-filter"
							value={selectedUnit}
							onChange={(e) => setSelectedUnit(e.target.value)}
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
						>
							<option value="">Semua Unit Kerja</option>
							{unitList.map((unit) => (
								<option key={unit.id} value={unit.unit_kerja}>
									{unit.unit_kerja}
								</option>
							))}
						</select>
					</div>

					{/* Search Bar */}
					<div>
						<label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
							Pencarian
						</label>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<input
								id="search"
								type="text"
								placeholder="Cari berdasarkan pilar, indikator, kendala, atau tanggal..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
							/>
						</div>
					</div>
				</div>

				{/* Active Filters Display */}
				{(selectedUnit || searchQuery) && (
					<div className="mt-4 flex flex-wrap gap-2">
						{selectedUnit && (
							<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
								Unit: {selectedUnit}
								<button
									onClick={() => setSelectedUnit("")}
									className="ml-2 text-blue-600 hover:text-blue-800"
								>
									×
								</button>
							</span>
						)}
						{searchQuery && (
							<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
								Pencarian: {searchQuery}
								<button
									onClick={() => setSearchQuery("")}
									className="ml-2 text-green-600 hover:text-green-800"
								>
									×
								</button>
							</span>
						)}
					</div>
				)}
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

			{/* Table */}
			<div className="bg-white rounded-xl shadow-lg overflow-hidden">
				<div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
					<div className="flex justify-between items-center">
						<div>
							<h2 className="text-xl font-bold">Detail SKP Generik - Seluruh Unit</h2>
							<p className="text-blue-100 text-sm">Daftar capaian dan target SKP generik dari semua unit kerja</p>
						</div>
						{latestRecordsPerIndicator.length > 0 && (
							<div className="text-right">
								<p className="text-sm text-blue-100">Menampilkan {latestRecordsPerIndicator.length} indikator (data terakhir)</p>
								{selectedUnit && (
									<p className="text-xs text-blue-200">Unit: {selectedUnit}</p>
								)}
							</div>
						)}
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full border-collapse table-fixed">
						<colgroup>
							<col className="w-32" />
							<col className="w-24" />
							<col className="w-20" />
							<col className="w-80" />
							<col className="w-20" />
							<col className="w-24" />
							<col className="w-20" />
							<col className="w-24" />
							<col className="w-64" />
							<col className="w-24" />
						</colgroup>
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 border text-left">Unit Kerja</th>
								<th className="px-4 py-2 border text-left">Tanggal</th>
								<th className="px-4 py-2 border text-left">Pilar</th>
								<th className="px-4 py-2 border text-left">Indikator</th>
								<th className="px-4 py-2 border text-center">Target Volume</th>
								<th className="px-4 py-2 border text-left">Target Satuan</th>
								<th className="px-4 py-2 border text-center">Update Volume</th>
								<th className="px-4 py-2 border text-left">Update Satuan</th>
								<th className="px-4 py-2 border text-left">Kendala</th>
								<th className="px-4 py-2 border text-center">Progress</th>
							</tr>
						</thead>
						<tbody>
							{latestRecordsPerIndicator.length === 0 ? (
								<tr>
									<td colSpan={10} className="text-center py-8 text-gray-500 italic">
										{selectedUnit || searchQuery ? 
											"Tidak ada data yang sesuai dengan filter yang dipilih" : 
											"Belum ada data SKP Generik"
										}
									</td>
								</tr>
							) : (
								latestRecordsPerIndicator.map((item, index) => {
									const target = Number(item.targetVolume) || 0;
									const update = Number(item.updateVolume) || 0;
									const progress = calcProgress(target, update);
									return (
										<tr key={index} className="hover:bg-blue-50 transition-colors align-top">
											<td className="px-4 py-3 border">
												<div className="font-medium text-sm text-blue-700">
													{item.unit_kerja}
												</div>
											</td>
											<td className="px-4 py-3 border">{item.tanggal}</td>
											<td className="px-4 py-3 border">
												<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													item.pilar === 'BIGGER' ? 'bg-blue-100 text-blue-800' :
													item.pilar === 'SMARTER' ? 'bg-green-100 text-green-800' :
													'bg-yellow-100 text-yellow-800'
												}`}>
													{item.pilar}
												</span>
											</td>
											<td className="px-4 py-3 border">
												<div>
													<p className="text-sm text-gray-900 whitespace-normal break-words leading-relaxed">
														{item.indikator}
													</p>
												</div>
											</td>
											<td className="px-4 py-3 border text-center">{target}</td>
											<td className="px-4 py-3 border">{item.targetSatuan}</td>
											<td className="px-4 py-3 border text-center font-semibold text-blue-600">{update}</td>
											<td className="px-4 py-3 border">{item.updateSatuan}</td>
											<td className="px-4 py-3 border">
												<div>
													<p className="text-sm text-gray-600 whitespace-normal break-words leading-relaxed">
														{item.kendala || '-'}
													</p>
												</div>
											</td>
											<td className="px-4 py-3 border">
												<div className="flex flex-col items-center">
													<div className="w-full bg-gray-200 rounded-full h-2 mb-1">
														<div 
															className={`h-2 rounded-full transition-all duration-300 ${
																progress >= 100 ? "bg-green-600" : 
																progress >= 75 ? "bg-yellow-500" : 
																progress >= 50 ? "bg-orange-500" : 
																"bg-red-500"
															}`}
															style={{ width: `${Math.min(progress, 100)}%` }}
														/>
													</div>
													<span className={`text-xs font-semibold ${
														progress >= 100 ? "text-green-600" : 
														progress >= 75 ? "text-yellow-600" : 
														progress >= 50 ? "text-orange-600" : 
														"text-red-600"
													}`}>
														{progress.toFixed(1)}%
													</span>
												</div>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>

				{/* Summary Statistics */}
				{latestRecordsPerIndicator.length > 0 && (
					<div className="px-6 py-4 bg-gray-50 border-t">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
							<div>
								<p className="text-sm text-gray-600">Total Indikator</p>
								<p className="text-2xl font-bold text-blue-600">{latestRecordsPerIndicator.length}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">BIGGER</p>
								<p className="text-2xl font-bold text-blue-600">
									{latestRecordsPerIndicator.filter(item => item.pilar === 'BIGGER').length}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">SMARTER</p>
								<p className="text-2xl font-bold text-green-600">
									{latestRecordsPerIndicator.filter(item => item.pilar === 'SMARTER').length}
								</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">BETTER</p>
								<p className="text-2xl font-bold text-yellow-600">
									{latestRecordsPerIndicator.filter(item => item.pilar === 'BETTER').length}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
