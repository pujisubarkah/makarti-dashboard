'use client'
import { useEffect, useState, useRef } from 'react'
import { ChevronDown, MessageCircle, Send, X, User, Shield, Clock, CheckCheck, Mail } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from './theme-toggle'

interface Message {
  id: number
  sender_id?: number
  sender_name?: string
  sender_role?: 'admin' | 'user'
  message: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  created_at: string
  is_read: boolean
  is_broadcast: boolean // true jika ini pesan siaran
}

export default function Header() {
  const [username, setUsername] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [unitKerja, setUnitKerja] = useState<string>('MAKARTI Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [broadcasts, setBroadcasts] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadBroadcastCount, setUnreadBroadcastCount] = useState(0)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false)
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'urgent' | 'success'>('info')
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    const storedId = localStorage.getItem('id')
    const storedRole = localStorage.getItem('role') || localStorage.getItem('role_id');

    if (storedUsername) setUsername(storedUsername)
    if (storedId) {
      setUserId(storedId)
      fetchUserData(storedId)
      fetchNotifications(storedId)
      fetchBroadcasts(storedId)
    }
    if (storedRole) setUserRole(storedRole)

    console.log('userRole from localStorage:', storedRole);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setChatOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, broadcasts])

  // Fetch user data
  const fetchUserData = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      if (data.user?.unit_kerja) {
        setUnitKerja(data.user.unit_kerja)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUnitKerja('MAKARTI Dashboard')
    }
  }

  // Fetch personal messages
  const fetchNotifications = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`)
      const data = await response.json()
      if (data.success) {
        setMessages(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Fetch broadcast messages
  const fetchBroadcasts = async (id: string) => {
    try {
      const response = await fetch(`/api/broadcast?userId=${id}`)
      const data: {
        id: number
        message: string
        type: 'info' | 'warning' | 'success' | 'urgent'
        createdAt: string
        isRead: boolean
      }[] = await response.json()

      if (Array.isArray(data)) {
        const broadcastMessages: Message[] = data.map((item) => ({
          id: item.id,
          message: item.message,
          type: item.type,
          created_at: item.createdAt,
          is_read: item.isRead,
          is_broadcast: true,
        }))
        setBroadcasts(broadcastMessages)
        setUnreadBroadcastCount(broadcastMessages.filter((b) => !b.is_read).length)
      }
    } catch (error) {
      console.error('Error fetching broadcast messages:', error)
    }
  }

  // Send personal message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) return
    setIsTyping(true)
    try {
      const targetRole = userRole === '1' ? '2' : '1'
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: parseInt(userId),
          receiver_role: targetRole,
          message: newMessage.trim(),
          type: 'info',
        }),
      })

      if (response.ok) {
        setNewMessage('')
        await fetchNotifications(userId)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  // Mark personal message as read
  const markAsRead = async (messageId: number) => {
    try {
      await fetch(`/api/notifications/mark-read/${messageId}`, { method: 'PUT' })
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, is_read: true } : msg))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking personal message as read:', error)
    }
  }

  // Mark broadcast message as read
  const markBroadcastAsRead = async (broadcastId: number) => {
    try {
      await fetch(`/api/broadcast/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcastId, userId }),
      })

      setBroadcasts((prev) =>
        prev.map((msg) => (msg.id === broadcastId ? { ...msg, is_read: true } : msg))
      )
      setUnreadBroadcastCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking broadcast as read:', error)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const handleChangePassword = () => {
    router.push('/ubah-password')
  }

  // Handle broadcast sending
  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return
    
    setIsSendingBroadcast(true)
    try {
      const res = await fetch('/api/broadcast/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: broadcastMessage.trim(),
          type: broadcastType,
          adminId: userId,
        }),
      })
      
      if (res.ok) {
        setBroadcastModalOpen(false)
        setBroadcastMessage('')
        setBroadcastType('info')
        if (userId) fetchBroadcasts(userId)
        alert('✅ Pengumuman berhasil dikirim!')
      } else {
        alert('❌ Gagal mengirim pengumuman!')
      }
    } catch {
      alert('❌ Terjadi error saat mengirim pengumuman!')
    } finally {
      setIsSendingBroadcast(false)
    }
  }

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm px-6 flex items-center justify-between sticky top-0 z-20">
      <h1 className="text-lg font-semibold text-blue-700 dark:text-blue-400">📊 {unitKerja}</h1>
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Chat & Broadcast Button */}
        {/* Admin: Broadcast Button */}
        {userRole !== null && userRole.trim() === '1' && (
          <button
            onClick={() => setBroadcastModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
          >
            <span className="text-lg">📢</span>
            <span>Kirim Pengumuman</span>
          </button>
        )}
        <div className="relative" ref={chatRef}>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-all duration-200 group"
          >
            <Mail
              className={`w-5 h-5 transition-colors ${
                unreadCount + unreadBroadcastCount > 0 ? 'text-blue-600' : 'text-gray-600'
              } group-hover:text-blue-500`}
            />
            {unreadCount + unreadBroadcastCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount + unreadBroadcastCount > 9 ? '9+' : unreadCount + unreadBroadcastCount}
              </span>
            )}
          </button>

          {/* Chat Panel */}
          {chatOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold text-sm">Pusat Pesan</h3>
                      <p className="text-xs opacity-90">Pesan & Pengumuman</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
                {messages.length === 0 && broadcasts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Belum ada pesan</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mulai percakapan atau cek pengumuman</p>
                  </div>
                ) : (
                  <>
                    {/* Broadcast Messages */}
                    {broadcasts.map((msg) => (
                      <div key={`broadcast-${msg.id}`} className="flex justify-center">
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl shadow-sm bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 cursor-pointer transition-all hover:shadow-md ${
                            msg.type === 'urgent'
                              ? 'border-red-500'
                              : msg.type === 'warning'
                              ? 'border-yellow-500'
                              : msg.type === 'success'
                              ? 'border-green-500'
                              : 'border-blue-500'
                          }`}
                          onClick={() => !msg.is_read && markBroadcastAsRead(msg.id)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-700">📢 PENGUMUMAN</span>
                            {!msg.is_read && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                                Baru
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-800 whitespace-pre-line">{msg.message}</div>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(msg.created_at).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Personal Messages */}
                    {messages.map((msg) => (
                      <div key={msg.id} className="space-y-2">
                        <div
                          className={`flex ${
                            msg.sender_id?.toString() === userId ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] group ${
                              msg.sender_id?.toString() === userId ? 'order-2' : 'order-1'
                            }`}
                          >
                            <div
                              className={`relative p-3 rounded-2xl shadow-sm ${
                                msg.sender_id?.toString() === userId
                                  ? 'bg-blue-500 text-white rounded-br-md'
                                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                              } ${
                                !msg.is_read && msg.sender_id?.toString() !== userId
                                  ? 'ring-2 ring-blue-300'
                                  : ''
                              }`}
                              onClick={() => !msg.is_read && markAsRead(msg.id)}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {msg.sender_role === 'admin' ? (
                                  <Shield className="w-3 h-3" />
                                ) : (
                                  <User className="w-3 h-3" />
                                )}
                                <span className="text-xs opacity-80 font-medium">
                                  {msg.sender_name}
                                </span>
                              </div>
                              <div className="text-sm leading-relaxed whitespace-pre-line">
                                {msg.message}
                              </div>
                              <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {msg.sender_id?.toString() === userId && (
                                  <CheckCheck
                                    className={`w-3 h-3 ${
                                      msg.is_read ? 'text-blue-400' : 'text-gray-400'
                                    }`}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t bg-white p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={userRole === '1' ? 'Kirim pesan ke user...' : 'Kirim pesan ke admin...'}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isTyping}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full p-2 transition-colors shadow-md hover:shadow-lg"
                  >
                    {isTyping ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>
                    {userRole === '1' ? 'Admin' : 'User'} • {username}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Online
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Broadcast Modal */}
        {broadcastModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-96 max-w-[90vw] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📢</span>
                    <div>
                      <h3 className="text-lg font-bold">Kirim Pengumuman</h3>
                      <p className="text-sm opacity-90">Sampaikan informasi penting kepada semua user</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBroadcastModalOpen(false)}
                    className="hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Message Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Pengumuman
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'info', label: 'Info', color: 'blue', emoji: '💬' },
                      { value: 'warning', label: 'Peringatan', color: 'yellow', emoji: '⚠️' },
                      { value: 'urgent', label: 'Urgent', color: 'red', emoji: '🚨' },
                      { value: 'success', label: 'Sukses', color: 'green', emoji: '✅' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setBroadcastType(type.value as 'info' | 'warning' | 'urgent' | 'success')}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          broadcastType === type.value
                            ? `bg-${type.color}-100 text-${type.color}-700 ring-2 ring-${type.color}-300`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span>{type.emoji}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan Pengumuman
                  </label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Tulis pesan pengumuman di sini..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {broadcastMessage.length}/500 karakter
                    </span>
                    {broadcastMessage.length > 400 && (
                      <span className="text-xs text-orange-600">
                        Mendekati batas maksimal
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {broadcastMessage.trim() && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                      Preview Pengumuman
                    </h4>
                    <div className={`p-3 rounded-lg border-l-4 ${
                      broadcastType === 'urgent' ? 'bg-red-50 border-red-500 text-red-800' :
                      broadcastType === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
                      broadcastType === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
                      'bg-blue-50 border-blue-500 text-blue-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">📢 PENGUMUMAN</span>
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          Baru
                        </span>
                      </div>
                      <div className="text-sm whitespace-pre-line">{broadcastMessage}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSendBroadcast}
                  disabled={!broadcastMessage.trim() || isSendingBroadcast}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingBroadcast ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>Kirim Pengumuman</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-lg"
          >
            <Image src="/avatar.png" alt="User Avatar" width={32} height={32} className="rounded-full" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{username || 'Pengguna'}</span>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-30">
              <button
                onClick={handleChangePassword}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                🔒 Ubah Password
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                🚪 Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}