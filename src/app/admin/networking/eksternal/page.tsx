"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Kemitraan = {
  id: number
  instansi: string
  bentuk: string[]
  status: "Aktif" | "Selesai" | "Direncanakan"
  tahunMulai: number
}

const dataMitra: Kemitraan[] = [
  {
    id: 1,
    instansi: "Kementerian PANRB",
    bentuk: ["MoU", "Workshop"],
    status: "Aktif",
    tahunMulai: 2023,
  },
  {
    id: 2,
    instansi: "Bappenas",
    bentuk: ["Kajian"],
    status: "Selesai",
    tahunMulai: 2022,
  },
  {
    id: 3,
    instansi: "Kominfo",
    bentuk: ["Data Sharing", "Pelatihan"],
    status: "Direncanakan",
    tahunMulai: 2025,
  },
]

export default function NetworkingInternalPage() {
  const [data, setData] = useState(dataMitra)
  const [selected, setSelected] = useState<Kemitraan | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">
          🤝 Kemitraan Lintas Instansi
        </h1>
        <Button variant="default" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kemitraan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Total Instansi</p>
            <p className="text-xl font-bold">{data.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Kolaborasi Aktif</p>
            <p className="text-xl font-bold">
              {data.filter((d) => d.status === "Aktif").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Rencana Baru</p>
            <p className="text-xl font-bold">
              {data.filter((d) => d.status === "Direncanakan").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Kolaborasi Selesai</p>
            <p className="text-xl font-bold">
              {data.filter((d) => d.status === "Selesai").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Daftar Kemitraan */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-blue-50 text-blue-800">
            <TableRow>
              <TableHead>Instansi</TableHead>
              <TableHead>Bentuk Kerja Sama</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tahun Mulai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => {
                  setSelected(item)
                  setOpen(true)
                }}
                className="cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <TableCell>{item.instansi}</TableCell>
                <TableCell>{item.bentuk.join(", ")}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "Aktif"
                        ? "default"
                        : item.status === "Selesai"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.tahunMulai}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Detail Kemitraan */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Kemitraan</DialogTitle>
            <DialogDescription>
              Informasi lengkap kerja sama lintas instansi.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Instansi:</strong> {selected.instansi}
              </p>
              <p>
                <strong>Bentuk Kerja Sama:</strong>{" "}
                {selected.bentuk.join(", ")}
              </p>
              <p>
                <strong>Status:</strong> {selected.status}
              </p>
              <p>
                <strong>Tahun Mulai:</strong> {selected.tahunMulai}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
