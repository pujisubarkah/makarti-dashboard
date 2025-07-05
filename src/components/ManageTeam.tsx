"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

// Dummy Data Pegawai
const teamData = [
  { id: 1, name: "Ahmad Fauzi", position: "Kepala Unit", email: "fauzi@example.com", status: "active" },
  { id: 2, name: "Siti Nurhaliza", position: "Analis", email: "siti@example.com", status: "onleave" },
  { id: 3, name: "Budi Santoso", position: "Programmer", email: "budi@example.com", status: "active" },
  { id: 4, name: "Indra Perdana", position: "Administrasi", email: "indra@example.com", status: "inactive" },
];

export default function ManageTeam() {
  const [newMember, setNewMember] = useState({ name: "", position: "", email: "" });
  const [members, setMembers] = useState(teamData);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.position || !newMember.email) return;
    const newId = members.length + 1;
    setMembers([...members, { ...newMember, id: newId, status: "active" }]);
    setNewMember({ name: "", position: "", email: "" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>;
      case "onleave":
        return <Badge variant="secondary">Cuti</Badge>;
      case "inactive":
        return <Badge variant="outline">Nonaktif</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Ringkasan Tim */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Pegawai</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kepala Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{members[0]?.name || "-"}</p>
            <p className="text-sm text-gray-600">{members[0]?.position || "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Aktivitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {members.filter(m => m.status === "active").length} dari {members.length} aktif hari ini.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Pegawai */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Daftar Pegawai</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Tambah Pegawai</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Anggota Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Jabatan</Label>
                  <Input value={newMember.position} onChange={(e) => setNewMember({...newMember, position: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} />
                </div>
                <Button onClick={handleAddMember} className="w-full mt-2">Simpan</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <ScrollArea className="h-[400px] px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://i.pravatar.cc/150?img=${member.id}`} />
                      <AvatarFallback>{member.name.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </TableCell>
                  <TableCell>{member.position}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Detail</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="destructive" size="sm">Hapus</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}