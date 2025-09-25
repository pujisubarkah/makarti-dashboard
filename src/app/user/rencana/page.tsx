// (Removed duplicate useEffect referencing isCreateDialogOpen before its declaration)
'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Calendar, 
  Users, 
  Flag, 
  CheckCircle2, 
  Clock, 
  Star,
  Lightbulb,
  Network,
  Megaphone,
  GraduationCap,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  GripVertical
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// Update the import path if SubtaskForm is located elsewhere, e.g.:
import SubtaskForm from "../../../components/SubtaskForm"
// Or create src/components/SubtaskForm.tsx if it does not exist.

// Remove Task and Subtask interfaces from here.
// Import them from a shared types file instead:
import type { Task, Subtask } from "../../../../types/task";

const categories = [
  { 
    id: 'inovasi', 
    name: 'Inovasi', 
    icon: Lightbulb, 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    bgColor: 'bg-purple-50'
  },
  { 
    id: 'networking', 
    name: 'Networking', 
    icon: Network, 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-50'
  },
  { 
    id: 'branding', 
    name: 'Branding', 
    icon: Megaphone, 
    color: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50'
  },
  { 
    id: 'learning', 
    name: 'Learning', 
    icon: GraduationCap, 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    bgColor: 'bg-orange-50'
  }
]




export default function RencanaAksiPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // untuk modal subtask

  // Define newTask state
  const [newTask, setNewTask] = useState({
    title: '',
    owner: 0,
    status: 'not-started',
    label: '',
    progress: 0,
    pilar: '',
  });
  
  // Set owner dari localStorage saat modal dibuka
  useEffect(() => {
    if (isCreateDialogOpen) {
      const ownerId = typeof window !== 'undefined' ? Number(localStorage.getItem('id')) || 0 : 0;
      setNewTask((prev) => ({ ...prev, owner: ownerId }));
    }
  }, [isCreateDialogOpen]);

  useEffect(() => {
    // Fetch tasks dari API
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setFilteredTasks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = tasks;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.pilar === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.label?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredTasks(filtered);
  }, [tasks, selectedCategory, selectedStatus, searchTerm]);

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask.title,
          owner: newTask.owner,
          status: newTask.status,
          label: newTask.label,
          progress: newTask.progress,
          pilar: newTask.pilar,
        }),
      });
      if (!response.ok) {
        throw new Error('Gagal membuat task');
      }
      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setNewTask({
        title: '',
        owner: 0,
        status: 'not-started',
        label: '',
        progress: 0,
        pilar: '',
      });
      setIsCreateDialogOpen(false);
    } catch {
      alert('Gagal membuat task');
    }
  }

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      String(task.id) === String(taskId) 
        ? { ...task, status: newStatus, progress: newStatus === 'completed' ? 100 : task.progress }
        : task
    ))
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
    e.dataTransfer.setData('text/plain', String(task.id))
    
    // Add drag image styling
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = 'rotate(5deg)'
    dragImage.style.opacity = '0.8'
    document.body.appendChild(dragImage)
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    e.dataTransfer.setDragImage(dragImage, 0, 0)
    
    setTimeout(() => document.body.removeChild(dragImage), 0)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault()
    setDragOverColumn(status)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only remove highlight if we're leaving the column container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (draggedTask && draggedTask.status !== newStatus) {
      updateTaskStatus(String(draggedTask.id), newStatus)
      
      // Visual feedback for successful drop
      const statusText: Record<Task['status'], string> = {
        'not-started': 'Belum Mulai',
        'in-progress': 'Sedang Berjalan',
        'completed': 'Selesai',
        'blocked': 'Terhambat',
      }
      
      console.log(`Task "${draggedTask.title}" dipindahkan ke ${statusText[newStatus as Task['status']]}`)
    }
    setDraggedTask(null)
  }

  const getCategoryData = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)
  }

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-600">Loading rencana aksi...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rencana Aksi</h1>
            <p className="text-gray-600 mt-2">Kelola rencana aksi inovasi, networking, branding, dan learning</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Rencana
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Buat Rencana Aksi Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan rencana aksi baru untuk mencapai tujuan strategis
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Rencana Aksi</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Masukkan judul rencana aksi"
                  />
                </div>
                {/* Owner otomatis dari localStorage, tidak perlu input manual */}
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Belum Mulai</SelectItem>
                      <SelectItem value="in-progress">Sedang Berjalan</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="blocked">Terhambat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="label">Label</Label>
                  <Select value={newTask.label} onValueChange={(value) => setNewTask({ ...newTask, label: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Rendah</SelectItem>
                      <SelectItem value="medium">Sedang</SelectItem>
                      <SelectItem value="high">Tinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min={0}
                    max={100}
                    value={newTask.progress}
                    onChange={(e) => setNewTask({ ...newTask, progress: Number(e.target.value) })}
                    placeholder="Progress awal (0-100)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pilar">Pilar</Label>
                  <Select value={newTask.pilar} onValueChange={(value) => setNewTask({ ...newTask, pilar: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <category.icon className="h-4 w-4 mr-2" />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateTask} disabled={!newTask.title}>
                  Buat Rencana
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistik berdasarkan pilar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {categories.map(category => {
            const categoryTasks = tasks.filter(task => task.pilar === category.id);
            const completedTasks = categoryTasks.filter(task => task.status === 'completed');
            const inProgressTasks = categoryTasks.filter(task => task.status === 'in-progress');
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="bg-white rounded-xl shadow-lg border-l-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium mb-1">{category.name}</p>
                    <p className="text-3xl font-bold mb-2">{categoryTasks.length}</p>
                    <div className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-600">{completedTasks.length} selesai</span>
                      {inProgressTasks.length > 0 && (
                        <>
                          <span className="text-xs text-gray-500 mx-2">•</span>
                          <span className="text-xs text-blue-600">{inProgressTasks.length} berjalan</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-full">
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter dan Search hanya berdasarkan pilar dan status */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari rencana aksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Pilar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Pilar</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="not-started">Belum Mulai</SelectItem>
            <SelectItem value="in-progress">Sedang Berjalan</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="blocked">Terhambat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Board View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[
          { status: 'not-started', title: 'Belum Mulai', icon: Clock },
          { status: 'in-progress', title: 'Sedang Berjalan', icon: Star },
          { status: 'completed', title: 'Selesai', icon: CheckCircle2 },
          { status: 'blocked', title: 'Terhambat', icon: Flag }
        ].map(column => {
          const columnTasks = getTasksByStatus(column.status as Task['status'])
          const IconComponent = column.icon
          const isDragOver = dragOverColumn === column.status
          
          return (
            <div 
              key={column.status} 
              className={`bg-gray-50 rounded-lg p-4 transition-all duration-200 ${
                isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed scale-[1.02]' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.status as Task['status'])}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status as Task['status'])}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <IconComponent className="h-5 w-5 mr-2 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                </div>
                <Badge variant="secondary" className="bg-gray-200">
                  {columnTasks.length}
                </Badge>
              </div>
              
              <div className="space-y-3 min-h-[200px]">
                {columnTasks.map(task => {
                  const categoryData = getCategoryData(task.pilar || 'inovasi');
                  const CategoryIcon = categoryData?.icon || Lightbulb;
                  const isDragging = draggedTask?.id === task.id;
                  return (
                    <Card
                      key={task.id}
                      className={`cursor-move hover:shadow-md transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            <Badge className={categoryData?.color}>
                              <CategoryIcon className="h-3 w-3 mr-1" />
                              {categoryData?.name}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Subtasks
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {task.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {task.created_at ? new Date(task.created_at).toLocaleDateString('id-ID') : '-'}
                          </span>
                          <Badge variant="outline">
                            {task.label || '-'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {task.users?.name || '-'}
                          </span>
                        </div>
                        {typeof task.progress === 'number' && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                
                {columnTasks.length === 0 && (
                  <div className={`text-center py-8 text-gray-500 transition-all duration-200 ${
                    isDragOver ? 'text-blue-500 scale-105' : ''
                  }`}>
                    <IconComponent className={`h-8 w-8 mx-auto mb-2 opacity-50 ${
                      isDragOver ? 'opacity-100 text-blue-500' : ''
                    }`} />
                    <p className="text-sm">
                      {isDragOver ? 'Lepaskan di sini' : 'Tidak ada rencana aksi'}
                    </p>
                    {isDragOver && (
                      <p className="text-xs text-blue-500 mt-1 animate-pulse">
                        Drop untuk memindahkan
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      {/* Modal Subtasks */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Subtasks untuk: {selectedTask.title}</DialogTitle>
            </DialogHeader>
            <SubtaskForm selectedTask={selectedTask} setTasks={setTasks} tasks={tasks} />
            <div className="space-y-3 mt-4">
              {selectedTask.subtasks.length === 0 ? (
                <div className="text-gray-500">Belum ada subtask.</div>
              ) : (
                selectedTask?.subtasks.map((subtask: Subtask) => {
                  // Tentukan warna badge berdasarkan status
                  let badgeClass = "bg-red-100 text-red-700";
                  // If your Subtask type only has 'is_done', use that for status
                  if (!subtask.is_done) {
                    badgeClass = "bg-yellow-100 text-yellow-700";
                  } else if (subtask.is_done) {
                    badgeClass = "bg-green-100 text-green-700";
                  }
                  return (
                    <div key={subtask.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className={subtask.is_done ? 'line-through text-gray-400' : ''}>{subtask.title}</span>
                        {subtask.assigned_to && (
                          <span className="ml-2 text-xs text-blue-600">({subtask.assigned_to})</span>
                        )}
                      </div>
                      <span
                        className={`inline-block w-4 h-4 rounded-full border border-gray-300 ${
                          badgeClass === "bg-red-100 text-red-700" ? "bg-red-500" :
                          badgeClass === "bg-yellow-100 text-yellow-700" ? "bg-yellow-400" :
                          badgeClass === "bg-green-100 text-green-700" ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></span>
                    </div>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
  );
}
