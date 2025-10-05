"use client";
import React, { useState } from "react";
import { Pencil } from "lucide-react";
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
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";

export default function SKPGenerikAdminPage() {
		const [skpList, setSkpList] = useState<SKPItem[]>([
		{
			tanggal: "2025-10-01",
			pilar: "BIGGER",
			indikator: "Jumlah Produk Pembelajaran dalam Corpu LAN",
			targetVolume: 2,
			targetSatuan: "produk",
			updateVolume: 1,
			updateSatuan: "produk",
			kendala: "Belum ada modul pembelajaran terbaru."
		},
		{
			tanggal: "2025-10-02",
			pilar: "SMARTER",
			indikator: "Jumlah Produk hukum yang ditetapkan oleh Kepala LAN",
			targetVolume: 19,
			targetSatuan: "produk hukum",
			updateVolume: 10,
			updateSatuan: "produk hukum",
			kendala: "Proses legalisasi masih berjalan."
		},
		{
			tanggal: "2025-10-03",
			pilar: "BETTER",
			indikator: "Jumlah Mitra Kerja yang berkaitan dengan layanan Biro HOS",
			targetVolume: 30,
			targetSatuan: "mitra kerja",
			updateVolume: 20,
			updateSatuan: "mitra kerja",
			kendala: "Beberapa mitra belum konfirmasi kerjasama."
		},
		{
			tanggal: "2025-10-04",
			pilar: "BETTER",
			indikator: "Jumlah Mitra Kerja yang berkaitan dengan layanan Biro HOS",
			targetVolume: 40,
			targetSatuan: "mitra kerja",
			updateVolume: 25,
			updateSatuan: "mitra kerja",
			kendala: "Kendala komunikasi dengan mitra baru."
		},
	]);
	const [showModal, setShowModal] = useState(false);
	const [editIndex, setEditIndex] = useState<number | null>(null);

		const calcProgress = (target: number, update: number) => {
			if (!target || target === 0) return 0;
			return Math.min((update / target) * 100, 100);
		};

	const handleEdit = (index: number) => {
		setEditIndex(index);
		setShowModal(true);
	};

		const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			const formData = new FormData(e.currentTarget);
			const newItem: Partial<SKPItem> = Object.fromEntries(formData.entries());
			if (editIndex !== null) {
				const updatedList = [...skpList];
				updatedList[editIndex] = {
					...updatedList[editIndex],
					...newItem,
					targetVolume: Number(newItem.targetVolume),
					updateVolume: Number(newItem.updateVolume),
				} as SKPItem;
				setSkpList(updatedList);
				setEditIndex(null);
			}
			setShowModal(false);
		};

	return (
				<div className="p-6 space-y-8 bg-gray-50 min-h-screen relative">
				{/* Watermark Data Dummy */}
				<div className="pointer-events-none select-none absolute top-10 right-10 opacity-30 text-5xl font-extrabold text-blue-400 z-10" style={{transform: 'rotate(-20deg)'}}>DATA DUMMY</div>
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard SKP Generik</h1>
					<p className="text-blue-600">Rekap capaian SKP generik seluruh user</p>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
				<h2 className="text-xl font-bold mb-4 text-blue-600 flex items-center">
					<svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" /></svg>
					Perbandingan Target & Realisasi
				</h2>
				<div className="h-[300px]">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={skpList} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
							<XAxis dataKey="pilar" tick={{ fontSize: 14 }} />
							<YAxis tick={{ fontSize: 12 }} />
							<Tooltip contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
							<Legend />
							<Line type="monotone" dataKey="targetVolume" name="Target" stroke="#2563eb" strokeWidth={2} />
							<Line type="monotone" dataKey="updateVolume" name="Realisasi" stroke="#22c55e" strokeWidth={2} />
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>

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
								<th className="px-4 py-2 border">Target</th>
								<th className="px-4 py-2 border">Update</th>
								<th className="px-4 py-2 border">Kendala</th>
								<th className="px-4 py-2 border">Progress</th>
								<th className="px-4 py-2 border">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{skpList.length === 0 ? (
								<tr>
									<td colSpan={8} className="text-center py-4 text-gray-500 italic">Belum ada data</td>
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
											<td className="px-4 py-2 border">{target} {item.targetSatuan}</td>
											<td className="px-4 py-2 border">{update} {item.updateSatuan}</td>
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

			{/* Modal Edit */}
			{showModal && editIndex !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
						<h2 className="text-xl font-bold mb-6 text-blue-700">Edit SKP Generik</h2>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="flex items-center gap-4">
								<label htmlFor="tanggal" className="w-48 text-sm font-medium text-gray-700">Tanggal Pelaporan</label>
								<input
									type="date"
									id="tanggal"
									name="tanggal"
									className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
									defaultValue={editIndex !== null ? skpList[editIndex].tanggal : ""}
								/>
							</div>
							<div className="flex items-center gap-4">
								<label htmlFor="pilar" className="w-48 text-sm font-medium text-gray-700">Pilar</label>
								<select
									id="pilar"
									name="pilar"
									className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
									defaultValue={editIndex !== null ? skpList[editIndex].pilar : ""}
								>
									<option value="BIGGER">BIGGER</option>
									<option value="SMARTER">SMARTER</option>
									<option value="BETTER">BETTER</option>
								</select>
							</div>
							<div className="flex items-center gap-4">
								<label htmlFor="indikator" className="w-48 text-sm font-medium text-gray-700">Indikator Kinerja</label>
								<textarea
									id="indikator"
									name="indikator"
									rows={2}
									className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
									defaultValue={editIndex !== null ? skpList[editIndex].indikator : ""}
								/>
							</div>
							<div className="flex items-center gap-4">
								<label htmlFor="kendala" className="w-48 text-sm font-medium text-gray-700">Kendala</label>
								<textarea
									id="kendala"
									name="kendala"
									className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
									defaultValue={editIndex !== null ? skpList[editIndex].kendala : ""}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="flex items-center gap-2">
									<label htmlFor="targetVolume" className="text-sm font-medium text-gray-700 min-w-max">Target Volume</label>
									<input
										type="number"
										id="targetVolume"
										name="targetVolume"
										className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
										defaultValue={editIndex !== null ? skpList[editIndex].targetVolume : ""}
									/>
								</div>
								<div className="flex items-center gap-2">
									<label htmlFor="targetSatuan" className="text-sm font-medium text-gray-700 min-w-max">Target Satuan</label>
									<input
										type="text"
										id="targetSatuan"
										name="targetSatuan"
										className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
										defaultValue={editIndex !== null ? skpList[editIndex].targetSatuan : ""}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="flex items-center gap-2">
									<label htmlFor="updateVolume" className="text-sm font-medium text-gray-700 min-w-max">Update Volume</label>
									<input
										type="number"
										id="updateVolume"
										name="updateVolume"
										className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
										defaultValue={editIndex !== null ? skpList[editIndex].updateVolume : ""}
									/>
								</div>
								<div className="flex items-center gap-2">
									<label htmlFor="updateSatuan" className="text-sm font-medium text-gray-700 min-w-max">Update Satuan</label>
									<input
										type="text"
										id="updateSatuan"
										name="updateSatuan"
										className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
										defaultValue={editIndex !== null ? skpList[editIndex].updateSatuan : ""}
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
