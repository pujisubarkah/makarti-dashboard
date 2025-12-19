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
  ).sort();

  const golonganOptions = Array.from(
    new Set(
      pegawaiList
        .map((p) => p.golongan)
        .filter((g): g is string => Boolean(g))
    )
  ).sort();

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Edit Pegawai</h2>
      
      <div className="flex justify-between items-center gap-3 mb-4">
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Tambah Pegawai
        </button>
        <div className="flex gap-3">
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:outline-blue-500 bg-white"
            style={{ minWidth: 200 }}
          >
            <option value="">Semua Unit Kerja</option>
            {unitOptions.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          <select
            value={golonganFilter}
            onChange={(e) => setGolonganFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:outline-blue-500 bg-white"
            style={{ minWidth: 150 }}
          >
            <option value="">Semua Golongan</option>
            {golonganOptions.map((golongan) => (
              <option key={golongan} value={golongan}>{golongan}</option>
            ))}
          </select>
        </div>
      </div>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr className="bg-blue-100 text-blue-700">
            <th className="py-2 px-4 border">No</th>
            <th className="py-2 px-4 border">Nama</th>
            <th className="py-2 px-4 border">Jabatan</th>
            <th className="py-2 px-4 border">Unit Kerja</th>
            <th className="py-2 px-4 border">Golongan</th>
            <th className="py-2 px-4 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredPegawai.map((pegawai, idx) => (
            <tr key={pegawai.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border text-center">{idx + 1}</td>
              <td className="py-2 px-4 border">
                <a
                  href={`/admin/pegawai/${pegawai.id}`}
                  className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                >
                  {pegawai.nama}
                </a>
              </td>
              <td className="py-2 px-4 border">{pegawai.jabatan}</td>
              <td className="py-2 px-4 border">{pegawai.users_pegawai_unit_kerja_idTousers?.unit_kerja}</td>
              <td className="py-2 px-4 border">{pegawai.golongan}</td>
              <td className="py-2 px-4 border text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEditClick(pegawai)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pegawai)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
  );
}

export default PegawaiPage;

