"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";

type Pegawai = {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  golongan?: string;
  eselon?: string;
  users_pegawai_unit_kerja_idTousers?: { unit_kerja?: string };
};

const PegawaiPage: React.FC = () => {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [unitKerjaList, setUnitKerjaList] = useState<{ id: number; unit_kerja: string }[]>([]);
  const [unitFilter, setUnitFilter] = useState("");
  const [golonganFilter, setGolonganFilter] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [editForm, setEditForm] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    golongan: "",
    eselon: "",
    unit_kerja_id: 0,
  });
  const [addForm, setAddForm] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    golongan: "",
    eselon: "",
    unit_kerja_id: 0,
  });

  useEffect(() => {
    // Fetch pegawai
    fetch("/api/pegawai")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPegawaiList(data);
        } else if (Array.isArray(data.data)) {
          setPegawaiList(data.data);
        } else {
          setPegawaiList([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch pegawai:", err);
        setPegawaiList([]);
      });

    // Fetch unit kerja list (role_id 1 dan 2)
    fetch("/api/unit_kerja")
      .then((res) => res.json())
      .then((data) => {
        console.log("Unit Kerja API Response:", data);
        if (Array.isArray(data)) {
          setUnitKerjaList(data);
          console.log("Unit Kerja List set:", data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch unit kerja:", err);
      });
  }, []);

  const unitOptions = Array.from(
    new Set(
      pegawaiList
        .map((p) => p.users_pegawai_unit_kerja_idTousers?.unit_kerja)
        .filter((u): u is string => Boolean(u))
    )
  ).sort((a, b) => a.localeCompare(b, 'id'));

  const golonganOptions = Array.from(
    new Set(
      pegawaiList
        .map((p) => p.golongan)
        .filter((g): g is string => Boolean(g))
    )
  ).sort((a, b) => a.localeCompare(b, 'id'));

  const filteredPegawai = pegawaiList.filter((pegawai) => {
    const matchUnit = !unitFilter || pegawai.users_pegawai_unit_kerja_idTousers?.unit_kerja === unitFilter;
    const matchGolongan = !golonganFilter || pegawai.golongan === golonganFilter;
    return matchUnit && matchGolongan;
  });

  const handleEditClick = (pegawai: Pegawai) => {
    // Fetch full pegawai data to get unit_kerja_id
    fetch(`/api/pegawai/${pegawai.id}`)
      .then(res => res.json())
      .then(data => {
        setSelectedPegawai(pegawai);
        setEditForm({
          nama: pegawai.nama || "",
          nip: pegawai.nip || "",
          jabatan: pegawai.jabatan || "",
          golongan: pegawai.golongan || "",
          eselon: pegawai.eselon || "",
          unit_kerja_id: data.unit_kerja_id || 0,
        });
        setIsEditDialogOpen(true);
      })
      .catch(err => {
        console.error("Failed to fetch pegawai detail:", err);
        setSelectedPegawai(pegawai);
        setEditForm({
          nama: pegawai.nama || "",
          nip: pegawai.nip || "",
          jabatan: pegawai.jabatan || "",
          golongan: pegawai.golongan || "",
          eselon: pegawai.eselon || "",
          unit_kerja_id: 0,
        });
        setIsEditDialogOpen(true);
      });
  };

  const handleSaveEdit = async () => {
    if (!selectedPegawai) return;

    try {
      const response = await fetch(`/api/pegawai/${selectedPegawai.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        // Refresh data pegawai
        const refreshResponse = await fetch("/api/pegawai");
        const data = await refreshResponse.json();
        if (Array.isArray(data)) {
          setPegawaiList(data);
        } else if (Array.isArray(data.data)) {
          setPegawaiList(data.data);
        }
        setIsEditDialogOpen(false);
        alert("Data pegawai berhasil diupdate!");
      } else {
        const error = await response.json();
        alert(`Gagal mengupdate data: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating pegawai:", error);
      alert("Terjadi kesalahan saat mengupdate data");
    }
  };

  const handleAddPegawai = async () => {
    try {
      const response = await fetch("/api/pegawai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addForm),
      });

      if (response.ok) {
        // Refresh data pegawai
        const refreshResponse = await fetch("/api/pegawai");
        const data = await refreshResponse.json();
        if (Array.isArray(data)) {
          setPegawaiList(data);
        } else if (Array.isArray(data.data)) {
          setPegawaiList(data.data);
        }
        setIsAddDialogOpen(false);
        // Reset form
        setAddForm({
          nama: "",
          nip: "",
          jabatan: "",
          golongan: "",
          eselon: "",
          unit_kerja_id: 0,
        });
        alert("Data pegawai berhasil ditambahkan!");
      } else {
        const error = await response.json();
        alert(`Gagal menambahkan data: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding pegawai:", error);
      alert("Terjadi kesalahan saat menambahkan data");
    }
  };

  const handleDelete = async (pegawai: Pegawai) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pegawai ${pegawai.nama}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/pegawai/${pegawai.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh data
        const refreshResponse = await fetch("/api/pegawai");
        const data = await refreshResponse.json();
        if (Array.isArray(data)) {
          setPegawaiList(data);
        }
        alert("Data pegawai berhasil dihapus!");
      } else {
        alert("Gagal menghapus data pegawai");
      }
    } catch (error) {
      console.error("Error deleting pegawai:", error);
      alert("Terjadi kesalahan saat menghapus data");
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Master Pegawai</h2>
        
        {/* Tombol Tambah */}
        <div className="mb-4">
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            Tambah Pegawai
          </button>
        </div>
        
        {/* Table dengan Filter */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Filter Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm hover:border-blue-400 transition-colors"
                style={{ minWidth: 280 }}
              >
                <option value="">Semua Unit Kerja</option>
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              
              <select
                value={golonganFilter}
                onChange={(e) => setGolonganFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm hover:border-blue-400 transition-colors"
                style={{ minWidth: 150 }}
              >
                <option value="">Semua Golongan</option>
                {golonganOptions.map((golongan) => (
                  <option key={golongan} value={golongan}>{golongan}</option>
                ))}
              </select>
            </div>
          </div>
        
        {/* Table */}
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="py-3 px-4 text-left font-semibold">No</th>
                <th className="py-3 px-4 text-left font-semibold">Nama</th>
                <th className="py-3 px-4 text-left font-semibold">Jabatan</th>
                <th className="py-3 px-4 text-left font-semibold">Unit Kerja</th>
                <th className="py-3 px-4 text-left font-semibold">Golongan</th>
                <th className="py-3 px-4 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">{filteredPegawai.map((pegawai, idx) => (
            <tr key={pegawai.id} className="hover:bg-blue-50 transition-colors">
              <td className="py-3 px-4 text-gray-700">{idx + 1}</td>
              <td className="py-3 px-4">
                <a
                  href={`/user/master-pegawai/${pegawai.id}`}
                  className="text-blue-600 font-medium hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {pegawai.nama}
                </a>
              </td>
              <td className="py-3 px-4 text-gray-700">{pegawai.jabatan}</td>
              <td className="py-3 px-4 text-gray-700">{pegawai.users_pegawai_unit_kerja_idTousers?.unit_kerja}</td>
              <td className="py-3 px-4 text-gray-700">{pegawai.golongan}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEditClick(pegawai)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm hover:shadow-md"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pegawai)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Data Pegawai</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                <input
                  type="text"
                  value={editForm.nip}
                  onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                <input
                  type="text"
                  value={editForm.jabatan}
                  onChange={(e) => setEditForm({ ...editForm, jabatan: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Golongan</label>
                <input
                  type="text"
                  value={editForm.golongan}
                  onChange={(e) => setEditForm({ ...editForm, golongan: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500"
                  placeholder="Contoh: III/d"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eselon</label>
                <select
                  value={editForm.eselon}
                  onChange={(e) => setEditForm({ ...editForm, eselon: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500 bg-white"
                >
                  <option value="">Pilih Eselon</option>
                  <option value="JPTM">JPTM</option>
                  <option value="JPTP">JPTP</option>
                  <option value="JF">JF</option>
                  <option value="JPEL">JPEL</option>
                  <option value="JP">JP</option>
                  <option value="CPNS">CPNS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja</label>
                <select
                  value={editForm.unit_kerja_id}
                  onChange={(e) => setEditForm({ ...editForm, unit_kerja_id: Number(e.target.value) })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500 bg-white"
                >
                  <option value={0}>Pilih Unit Kerja</option>
                  {unitKerjaList.length > 0 ? (
                    unitKerjaList.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.unit_kerja}</option>
                    ))
                  ) : (
                    <option value={0} disabled>Loading...</option>
                  )}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Tambah Pegawai Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={addForm.nama}
                  onChange={(e) => setAddForm({ ...addForm, nama: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
                <input
                  type="text"
                  value={addForm.nip}
                  onChange={(e) => setAddForm({ ...addForm, nip: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                <input
                  type="text"
                  value={addForm.jabatan}
                  onChange={(e) => setAddForm({ ...addForm, jabatan: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Golongan</label>
                <input
                  type="text"
                  value={addForm.golongan}
                  onChange={(e) => setAddForm({ ...addForm, golongan: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500"
                  placeholder="Contoh: III/d"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eselon</label>
                <select
                  value={addForm.eselon}
                  onChange={(e) => setAddForm({ ...addForm, eselon: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500 bg-white"
                >
                  <option value="">Pilih Eselon</option>
                  <option value="JPTM">JPTM</option>
                  <option value="JPTP">JPTP</option>
                  <option value="JF">JF</option>
                  <option value="JPEL">JPEL</option>
                  <option value="JP">JP</option>
                  <option value="CPNS">CPNS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Kerja</label>
                <select
                  value={addForm.unit_kerja_id}
                  onChange={(e) => setAddForm({ ...addForm, unit_kerja_id: Number(e.target.value) })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-blue-500 bg-white"
                >
                  <option value={0}>Pilih Unit Kerja</option>
                  {unitKerjaList.length > 0 ? (
                    unitKerjaList.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.unit_kerja}</option>
                    ))
                  ) : (
                    <option value={0} disabled>Loading...</option>
                  )}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddPegawai}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default PegawaiPage;
