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
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  title: string
  description: string
  category: 'inovasi' | 'networking' | 'branding' | 'learning'
  priority: 'low' | 'medium' | 'high'
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  dueDate: string
  assignee: string
  tags: string[]
  progress: number
  createdAt: string
}

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

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}



export default function RencanaAksiPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  // Form state for new task
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'inovasi' as Task['category'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
    assignee: '',
    tags: ''
  })

  useEffect(() => {
    // Simulate loading data
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Implementasi AI Chatbot untuk Pelayanan Publik',
        description: 'Mengembangkan chatbot berbasis AI untuk meningkatkan kualitas pelayanan publik 24/7',
        category: 'inovasi',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2025-10-15',
        assignee: 'Tim IT',
        tags: ['AI', 'Chatbot', 'Pelayanan'],
        progress: 60,
        createdAt: '2025-09-01'
      },
      {
        id: '2',
        title: 'Kolaborasi dengan Universitas Lokal',
        description: 'Membangun kemitraan strategis dengan universitas untuk program magang dan penelitian',
        category: 'networking',
        priority: 'medium',
        status: 'not-started',
        dueDate: '2025-11-30',
        assignee: 'Tim SDM',
        tags: ['Kemitraan', 'Universitas', 'Magang'],
        progress: 0,
        createdAt: '2025-09-10'
      },
      {
        id: '3',
        title: 'Campaign Digital Awareness Program',
        description: 'Meluncurkan kampanye digital untuk meningkatkan awareness program pemerintah',
        category: 'branding',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2025-10-01',
        assignee: 'Tim Marketing',
        tags: ['Digital', 'Campaign', 'Awareness'],
        progress: 80,
        createdAt: '2025-08-15'
      },
      {
        id: '4',
        title: 'Pelatihan Data Analytics untuk Staff',
        description: 'Program pelatihan komprehensif data analytics untuk meningkatkan kapasitas staff',
        category: 'learning',
        priority: 'medium',
        status: 'completed',
        dueDate: '2025-09-30',
        assignee: 'Tim Training',
        tags: ['Pelatihan', 'Data Analytics', 'Kapasitas'],
        progress: 100,
        createdAt: '2025-08-01'
      }
    ]
    
    setTimeout(() => {
      setTasks(sampleTasks)
      setFilteredTasks(sampleTasks)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = tasks

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus)
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority)
    }

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredTasks(filtered)
  }, [tasks, selectedCategory, selectedStatus, selectedPriority, searchTerm])

  const handleCreateTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      status: 'not-started',
      dueDate: newTask.dueDate,
      assignee: newTask.assignee,
      tags: newTask.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      progress: 0,
      createdAt: new Date().toISOString()
    }

    setTasks([...tasks, task])
    setNewTask({
      title: '',
      description: '',
      category: 'inovasi',
      priority: 'medium',
      dueDate: '',
      assignee: '',
      tags: ''
    })
    setIsCreateDialogOpen(false)
  }

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, progress: newStatus === 'completed' ? 100 : task.progress }
        : task
    ))
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
    e.dataTransfer.setData('text/plain', task.id)
    
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
      updateTaskStatus(draggedTask.id, newStatus)
      
      // Visual feedback for successful drop
      const statusText = {
        'not-started': 'Belum Mulai',
        'in-progress': 'Sedang Berjalan',
        'completed': 'Selesai',
        'blocked': 'Terhambat'
      }
      
      console.log(`Task "${draggedTask.title}" dipindahkan ke ${statusText[newStatus]}`)
    }
    setDraggedTask(null)
  }

  const getCategoryData = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)
  }

  const getTasksByStatus = (status: Task['status']) => {
    return filteredTasks.filter(task => task.status === status)
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
                  <Label htmlFor="title">Judul Rencana</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Masukkan judul rencana aksi"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Jelaskan detail rencana aksi"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={newTask.category} onValueChange={(value: Task['category']) => setNewTask({ ...newTask, category: value })}>
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
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Prioritas</Label>
                    <Select value={newTask.priority} onValueChange={(value: Task['priority']) => setNewTask({ ...newTask, priority: value })}>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Target Selesai</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="assignee">Penanggung Jawab</Label>
                    <Input
                      id="assignee"
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                      placeholder="Tim/Unit kerja"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (pisahkan dengan koma)</Label>
                  <Input
                    id="tags"
                    value={newTask.tags}
                    onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                    placeholder="AI, Digital, Innovation"
                  />
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {categories.map(category => {
            const categoryTasks = tasks.filter(task => task.category === category.id)
            const completedTasks = categoryTasks.filter(task => task.status === 'completed')
            const inProgressTasks = categoryTasks.filter(task => task.status === 'in-progress')
            const IconComponent = category.icon
            const completionRate = categoryTasks.length > 0 ? Math.round((completedTasks.length / categoryTasks.length) * 100) : 0
            
            // Color mapping for consistency with admin dashboard
            const colorMap = {
              'inovasi': {
                bgGradient: 'from-purple-500 to-purple-600',
                bgLight: 'bg-purple-100',
                textColor: 'text-purple-600',
                textDark: 'text-purple-800',
                borderColor: 'border-purple-500'
              },
              'networking': {
                bgGradient: 'from-blue-500 to-blue-600',
                bgLight: 'bg-blue-100',
                textColor: 'text-blue-600',
                textDark: 'text-blue-800',
                borderColor: 'border-blue-500'
              },
              'branding': {
                bgGradient: 'from-green-500 to-green-600',
                bgLight: 'bg-green-100',
                textColor: 'text-green-600',
                textDark: 'text-green-800',
                borderColor: 'border-green-500'
              },
              'learning': {
                bgGradient: 'from-orange-500 to-orange-600',
                bgLight: 'bg-orange-100',
                textColor: 'text-orange-600',
                textDark: 'text-orange-800',
                borderColor: 'border-orange-500'
              }
            }
            
            const colors = colorMap[category.id as keyof typeof colorMap]
            
            return (
              <div
                key={category.id}
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${colors.borderColor} hover:scale-105 group overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${colors.textDark} mb-1`}>
                        {category.name}
                      </p>
                      <p className={`text-3xl font-bold ${colors.textColor} mb-2`}>
                        {categoryTasks.length}
                      </p>
                      <div className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-green-600">
                          {completedTasks.length} selesai
                        </span>
                        {inProgressTasks.length > 0 && (
                          <>
                            <span className="text-xs text-gray-500 mx-2">•</span>
                            <span className="text-xs text-blue-600">
                              {inProgressTasks.length} berjalan
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`${colors.bgLight} p-4 rounded-full group-hover:scale-110 transition-transform`}>
                      <div className={colors.textColor}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${colors.bgGradient} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                      <span>Completion Rate</span>
                      <span className={`font-medium ${colors.textColor} flex items-center`}>
                        {completionRate >= 80 ? '🏆' : 
                         completionRate >= 50 ? '📈' : 
                         completionRate > 0 ? '⏳' : '📋'} {completionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters and Search */}
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
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
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
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Prioritas</SelectItem>
            <SelectItem value="high">Tinggi</SelectItem>
            <SelectItem value="medium">Sedang</SelectItem>
            <SelectItem value="low">Rendah</SelectItem>
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
                  const categoryData = getCategoryData(task.category)
                  const CategoryIcon = categoryData?.icon || Lightbulb
                  const isDragging = draggedTask?.id === task.id
                  
                  return (
                    <Card 
                      key={task.id} 
                      className={`cursor-move hover:shadow-md transition-all duration-200 ${
                        isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
                      }`}
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
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
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
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString('id-ID')}
                          </span>
                          <Badge className={priorityColors[task.priority]} variant="outline">
                            {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {task.assignee}
                          </span>
                          <div className="flex gap-1">
                            {task.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {task.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{task.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {task.progress > 0 && (
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
                  )
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
      </div>
    </div>
  )
}
