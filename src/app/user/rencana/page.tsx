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
  GripVertical,
  Filter
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
    label: 'learning',
    pilar: 'smarter',
    tags: '',
    pj_kegiatan: ''
  });

  // Auto-fill pilar based on label
  const handleLabelChange = (value: string) => {
    let pilar = 'smarter'; // default
    if (value === 'learning' || value === 'inovasi') {
      pilar = 'smarter';
    } else if (value === 'networking' || value === 'branding') {
      pilar = 'bigger';
    }
    setNewTask({ ...newTask, label: value, pilar: pilar });
  };

  useEffect(() => {
    // Fetch tasks dari API
    const currentUserId = localStorage.getItem('id');
    console.log('Frontend - User ID from localStorage:', currentUserId);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add user ID to headers if available
    if (currentUserId) {
      headers['x-user-id'] = currentUserId;
      console.log('Frontend - Sending x-user-id header:', currentUserId);
    }
    
    fetch('/api/tasks', {
      headers: headers,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched tasks:', data);
        console.log('Tasks with rencana status:', data.filter((task: any) => task.status === 'rencana'));
        setTasks(data);
        setFilteredTasks(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = tasks;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.pilar === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      // Map filter status to include both old and new status names
      const statusToFilter = (status: string) => {
        switch (status) {
          case 'not-started':
            return (task: Task) => task.status === 'not-started' || task.status === 'rencana';
          case 'in-progress':
            return (task: Task) => task.status === 'in-progress' || task.status === 'proses';
          case 'completed':
            return (task: Task) => task.status === 'completed' || task.status === 'selesai';
          case 'blocked':
            return (task: Task) => task.status === 'blocked' || task.status === 'terhambat';
          default:
            return (task: Task) => task.status === status;
        }
      };
      filtered = filtered.filter(statusToFilter(selectedStatus));
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
      // Get current user ID from localStorage
      const currentUserId = localStorage.getItem('id');
      const userId = currentUserId ? parseInt(currentUserId) : null;

      if (!userId) {
        alert('Gagal mendapatkan informasi user. Silakan login kembali.');
        return;
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(), // Send user ID in header
        },
        body: JSON.stringify({
          title: newTask.title,
          label: newTask.label,
          pilar: newTask.pilar,
          tags: newTask.tags,
          pj_kegiatan: newTask.pj_kegiatan,
          owner: userId // Dynamic owner based on current user
        })
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks([...tasks, createdTask]);
        
        // Reset form
        setNewTask({
          title: '',
          label: 'learning',
          pilar: 'smarter',
          tags: '',
          pj_kegiatan: ''
        });
        setIsCreateDialogOpen(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to create task:', errorData);
        alert(errorData.error || 'Gagal membuat rencana aksi');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          status: newStatus
        })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          String(task.id) === String(taskId) 
            ? updatedTask
            : task
        ));
      } else {
        console.error('Failed to update task status');
        // Optionally show error message to user
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
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

  const handleDrop = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (!draggedTask) return;
    
    // Map column status to actual task status
    let newStatus: string;
    switch (columnStatus) {
      case 'not-started':
        newStatus = 'rencana';
        break;
      case 'in-progress':
        newStatus = 'proses';
        break;
      case 'completed':
        newStatus = 'selesai';
        break;
      case 'blocked':
        newStatus = 'terhambat';
        break;
      default:
        newStatus = columnStatus;
    }
    
    if (draggedTask.status !== newStatus) {
      updateTaskStatus(String(draggedTask.id), newStatus as Task['status'])
      
      // Visual feedback for successful drop
      const statusText: Record<string, string> = {
        'rencana': 'Belum Mulai',
        'proses': 'Sedang Berjalan', 
        'selesai': 'Selesai',
        'terhambat': 'Terhambat'
      }
      
      console.log(`Task "${draggedTask.title}" dipindahkan ke ${statusText[newStatus]}`)
    }
    setDraggedTask(null)
  }

  const getCategoryData = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)
  }

  const getTasksByStatus = (status: string) => {
    // Map status untuk menampilkan task di kolom yang sesuai
    let result: Task[];
    switch (status) {
      case 'not-started':
        result = filteredTasks.filter(task => task.status === 'rencana' || task.status === 'not-started');
        break;
      case 'in-progress':
        result = filteredTasks.filter(task => task.status === 'proses' || task.status === 'in-progress');
        break;
      case 'completed':
        result = filteredTasks.filter(task => task.status === 'selesai' || task.status === 'completed');
        break;
      case 'blocked':
        result = filteredTasks.filter(task => task.status === 'terhambat' || task.status === 'blocked');
        break;
      default:
        result = filteredTasks.filter(task => task.status === status);
    }
    
    if (status === 'not-started') {
      console.log('Tasks for not-started column:', result);
      console.log('All filtered tasks:', filteredTasks);
    }
    
    return result;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-600">Loading rencana aksi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Rencana Aksi</h1>
          <p className="text-gray-600">Kelola rencana aksi inovasi, networking, branding, dan learning</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Rencana
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Buat Rencana Aksi Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan rencana aksi baru. Pilar akan otomatis terisi berdasarkan label yang dipilih, dan progress dimulai dari 0%.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Judul Rencana</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Masukkan judul rencana aksi"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="label">Pilar Makarti</Label>
                  <Select value={newTask.label} onValueChange={handleLabelChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learning">
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2 text-orange-500" />
                          Learning
                        </div>
                      </SelectItem>
                      <SelectItem value="inovasi">
                        <div className="flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2 text-purple-500" />
                          Inovasi
                        </div>
                      </SelectItem>
                      <SelectItem value="networking">
                        <div className="flex items-center">
                          <Network className="h-4 w-4 mr-2 text-blue-500" />
                          Networking
                        </div>
                      </SelectItem>
                      <SelectItem value="branding">
                        <div className="flex items-center">
                          <Megaphone className="h-4 w-4 mr-2 text-green-500" />
                          Branding
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={newTask.tags}
                    onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                    placeholder="Masukkan tags (pisahkan dengan koma)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pj_kegiatan">Tim Kerja PJ Kegiatan</Label>
                  <Input
                    id="pj_kegiatan"
                    value={newTask.pj_kegiatan}
                    onChange={(e) => setNewTask({ ...newTask, pj_kegiatan: e.target.value })}
                    placeholder="Masukkan tim kerja penanggungjawab kegiatan"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateTask} disabled={!newTask.title || !newTask.pj_kegiatan}>
                  Buat Rencana
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      

      {/* Statistik berdasarkan pilar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, idx) => {
            const categoryTasks = tasks.filter(task => task.pilar === category.id);
            const completedTasks = categoryTasks.filter(task => task.status === 'completed');
            const inProgressTasks = categoryTasks.filter(task => task.status === 'in-progress');
            const IconComponent = category.icon;
            
            // Color schemes untuk setiap kategori
            const colorSchemes = [
              {
                bgGradient: 'from-purple-500 to-purple-600',
                bgLight: 'bg-purple-100',
                textColor: 'text-purple-600',
                textDark: 'text-purple-800',
                borderColor: 'border-purple-500'
              },
              {
                bgGradient: 'from-blue-500 to-blue-600',
                bgLight: 'bg-blue-100',
                textColor: 'text-blue-600',
                textDark: 'text-blue-800',
                borderColor: 'border-blue-500'
              },
              {
                bgGradient: 'from-green-500 to-green-600',
                bgLight: 'bg-green-100',
                textColor: 'text-green-600',
                textDark: 'text-green-800',
                borderColor: 'border-green-500'
              },
              {
                bgGradient: 'from-orange-500 to-orange-600',
                bgLight: 'bg-orange-100',
                textColor: 'text-orange-600',
                textDark: 'text-orange-800',
                borderColor: 'border-orange-500'
              }
            ];
            
            const colorScheme = colorSchemes[idx % colorSchemes.length];
            
            return (
              <div
                key={category.id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colorScheme.borderColor} hover:scale-105 group overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${colorScheme.textDark} mb-1`}>
                        {category.name}
                      </p>
                      <p className={`text-2xl font-bold ${colorScheme.textColor} mb-2`}>
                        {categoryTasks.length}
                      </p>
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
                    <div className={`${colorScheme.bgLight} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Filter dan Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Filter & Pencarian</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari rencana aksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Filter Pilar */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Pilar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pilar</SelectItem>
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

            {/* Filter Status */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
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

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="px-3"
              title="Bersihkan filter"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results Info */}
        <div className="mt-4 text-sm text-gray-600">
          Menampilkan {filteredTasks.length} dari {tasks.length} rencana aksi
          {(searchTerm || (selectedCategory !== 'all') || (selectedStatus !== 'all')) && (
            <span className="ml-2 text-blue-600">(dengan filter)</span>
          )}
        </div>
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
              <DialogTitle>Subtasks untuk: {selectedTask?.title ?? ''}</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <SubtaskForm selectedTask={selectedTask!} setTasks={setTasks} tasks={tasks} />
            )}
            <div className="space-y-3 mt-4">
              {!selectedTask || selectedTask?.subtasks.length === 0 ? (
                <div className="text-gray-500">Belum ada subtask.</div>
              ) : (
                selectedTask?.subtasks.map((subtask: Subtask) => (
                  <div key={subtask.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <span className={subtask.is_done ? 'line-through text-gray-400' : ''}>{subtask.title}</span>
                      {subtask.assigned_to && (
                        <span className="ml-2 text-xs text-blue-600">({subtask.assigned_to})</span>
                      )}
                    </div>
                    <div>
                      {subtask.is_done ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700">Selesai</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-700">Belum</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
    </div>
  );
}
