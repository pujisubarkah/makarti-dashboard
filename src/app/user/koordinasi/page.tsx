// app/user/koordinasi/tambah/page.tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface KoordinasiItem {
  id: number
  tanggal: string
  instansi: string
  jenisInstansi: string
  topik: string
  catatan: string
}

export default function TambahKoordinasiPage() {
  // Dummy initial data
  const initialData: KoordinasiItem[] = [
    {
      id: 1,
      tanggal: "2025-05-15",
      instansi: "Kementerian PANRB",
      jenisInstansi: "Pusat",
      topik: "Koordinasi Indikator SPBE",
      catatan: "Disepakati timeline pelaporan"
    },
    {
      id: 2,
      tanggal: "2025-05-18",
      instansi: "Pemprov DKI Jakarta",
      jenisInstansi: "Daerah",
      topik: "Sinkronisasi RB",
      catatan: "Menunggu dokumen pendukung"
    },
    {
      id: 3,
      tanggal: "2025-05-20",
      instansi: "Universitas Indonesia",
      jenisInstansi: "Akademisi",
      topik: "Kerjasama Riset",
      catatan: "MoU dalam proses penyusunan"
    }
  ]

  // Load data from localStorage if available
  const [data, setData] = useState<KoordinasiItem[]>(() => {
    const saved = localStorage.getItem("koordinasiData")
    return saved ? JSON.parse(saved) : initialData
  })

  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    tanggal: "",
    instansi: "",
    jenisInstansi: "Pusat",
    topik: "",
    catatan: "",
  })

  const jenisOptions = ["Pusat", "Daerah", "Akademisi"]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newItem = {
      id: Date.now(),
      ...formData
    }

    const updatedData = [...data, newItem]
    setData(updatedData)
    localStorage.setItem("koordinasiData", JSON.stringify(updatedData))

    setFormData({
      tanggal: "",
      instansi: "",
      jenisInstansi: "Pusat",
      topik: "",
      catatan: "",
    })
    setShowModal(false)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Koordinasi</h1>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Tambah Kegiatan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Tambah Kegiatan Koordinasi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tanggal */}
              <div className="space-y-1">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Instansi */}
              <div className="space-y-1">
                <Label>Instansi / Pihak Terkait</Label>
                <Input
                  name="instansi"
                  value={formData.instansi}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Kementerian PANRB"
                />
              </div>

              {/* Jenis Instansi */}
              <div className="space-y-1">
                <Label>Jenis Instansi</Label>
                <Select
                  name="jenisInstansi"
                  value={formData.jenisInstansi}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, jenisInstansi: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis instansi" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Topik */}
              <div className="space-y-1">
                <Label>Topik Koordinasi</Label>
                <Input
                  name="topik"
                  value={formData.topik}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Sinkronisasi indikator SPBE"
                />
              </div>

              {/* Catatan */}
              <div className="space-y-1">
                <Label>Catatan</Label>
                <Input
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  placeholder="Contoh: Disepakati timeline pelaporan"
                />
              </div>

              {/* Tombol Simpan & Batal */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabel Daftar Kegiatan */}
      <div className="overflow-x-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Instansi</TableHead>
              <TableHead>Jenis Instansi</TableHead>
              <TableHead>Topik</TableHead>
              <TableHead>Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.tanggal}</TableCell>
                <TableCell>{item.instansi}</TableCell>
                <TableCell>{item.jenisInstansi}</TableCell>
                <TableCell>{item.topik}</TableCell>
                <TableCell>{item.catatan || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}