// app/user/sosialisasi/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

interface SosialisasiItem {
  id: number
  nama: string
  tanggal: string
  jenis: string
  platform: string
  peserta: number
}

export default function SosialisasiPage() {
  const router = useRouter()

  // Dummy initial data
  const initialData: SosialisasiItem[] = [
    {
      id: 1,
      nama: "Webinar SPBE dan Inovasi Digital",
      tanggal: "2025-05-10",
      jenis: "Webinar",
      platform: "Zoom",
      peserta: 200,
    },
    {
      id: 2,
      nama: "Sosialisasi Reformasi Birokrasi",
      tanggal: "2025-05-12",
      jenis: "Tatap Muka",
      platform: "Kantor LAN Pusat",
      peserta: 80,
    },
  ]

  // Ambil data dari localStorage jika tersedia
  const [data, setData] = useState<SosialisasiItem[]>(() => {
    const saved = localStorage.getItem("sosialisasiData")
    return saved ? JSON.parse(saved) : initialData
  })

  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    nama: "",
    tanggal: "",
    jenis: "Webinar",
    platform: "",
    peserta: 0,
  })

  const userUnit = typeof window !== 'undefined' ? localStorage.getItem("userUnit") : null

  const jenisOptions = ["Webinar", "Tatap Muka", "Live IG", "FGD"]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "peserta" ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!userUnit) {
      alert("Tidak dapat menentukan unit kerja")
      return
    }

    const newItem = {
      id: Date.now(),
      ...formData,
      unit: userUnit, // masih disimpan di localStorage
    }

    const updatedData = [...data, newItem]
    setData(updatedData)
    localStorage.setItem("sosialisasiData", JSON.stringify(updatedData))

    setFormData({
      nama: "",
      tanggal: "",
      jenis: "Webinar",
      platform: "",
      peserta: 0,
    })
    setShowModal(false)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Sosialisasi</h1>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Tambah Kegiatan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-700">Tambah Kegiatan Sosialisasi</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div className="space-y-1">
                <Label>Nama Kegiatan</Label>
                <Input
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                />
              </div>

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

              {/* Jenis */}
              <div className="space-y-1">
                <Label>Jenis Kegiatan</Label>
                <Select
                  name="jenis"
                  value={formData.jenis}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, jenis: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kegiatan" />
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

              {/* Platform */}
              <div className="space-y-1">
                <Label>Platform</Label>
                <Input
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                  placeholder="Zoom / Instagram / Offline"
                />
              </div>

              {/* Peserta */}
              <div className="space-y-1">
                <Label>Jumlah Peserta</Label>
                <Input
                  type="number"
                  name="peserta"
                  value={formData.peserta}
                  onChange={handleChange}
                  min={0}
                  required
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
              <TableHead>Nama Kegiatan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead className="text-right">Peserta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.nama}</TableCell>
                <TableCell>{item.tanggal}</TableCell>
                <TableCell>{item.jenis}</TableCell>
                <TableCell>{item.platform}</TableCell>
                <TableCell className="text-right">{item.peserta}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}