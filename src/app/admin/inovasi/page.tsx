"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Badge } from "@/components/ui/badge"

type Ide = {
  id: number
  judul: string
  pengusul: string
  status: "Baru" | "Diproses" | "Diimplementasi"
  tanggal: string
}

export default function DaftarInovasiPage() {
  const [data, setData] = useState<Ide[]>([
    {
      id: 1,
      judul: "Integrasi Dashboard",
      pengusul: "Direktorat A",
      status: "Baru",
      tanggal: "2025-06-16",
    },
    {
      id: 2,
      judul: "Otomatisasi Laporan",
      pengusul: "Pusat Data",
      status: "Diproses",
      tanggal: "2025-06-15",
    },
  ])

  const [sortAsc, setSortAsc] = useState(true)

  const sortedData = [...data].sort((a, b) =>
    sortAsc ? a.judul.localeCompare(b.judul) : b.judul.localeCompare(a.judul)
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700">💡 Daftar Ide Inovasi</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tambah Ide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Ide Inovasi</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const judul = (form.elements.namedItem("judul") as HTMLInputElement).value
                const pengusul = (form.elements.namedItem("pengusul") as HTMLInputElement).value
                const status = "Baru"
                const tanggal = new Date().toISOString().slice(0, 10)
                setData([...data, { id: data.length + 1, judul, pengusul, status, tanggal }])
                form.reset()
              }}
              className="space-y-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="judul">Judul Ide</Label>
                <Input name="judul" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pengusul">Pengusul</Label>
                <Input name="pengusul" required />
              </div>
              <Button type="submit" className="w-full">
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full table-auto text-sm">
          <thead className="bg-blue-50 text-blue-800">
            <tr>
              <th className="text-left p-3 font-semibold cursor-pointer" onClick={() => setSortAsc(!sortAsc)}>
                Judul Ide ⬍
              </th>
              <th className="text-left p-3 font-semibold">Pengusul</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{item.judul}</td>
                <td className="p-3">{item.pengusul}</td>
                <td className="p-3">
                  <Badge
                    variant={
                      item.status === "Baru"
                        ? "default"
                        : item.status === "Diproses"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {item.status}
                  </Badge>
                </td>
                <td className="p-3">{item.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
