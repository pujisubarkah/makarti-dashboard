'use client'

import { useEffect, useState, useRef } from "react"
import { ChevronDown, MessageCircle, Send, X, User, Shield, Clock, CheckCheck, Mail } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Message {
  id: number
  sender_id: number
  sender_name: string
  sender_role: 'admin' | 'user'
  message: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  created_at: string
  is_read: boolean
}

export default function Header() {
  const [username, setUsername] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [unitKerja, setUnitKerja] = useState<string>('MAKARTI Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    const storedId = localStorage.getItem('id')
    const storedRole = localStorage.getItem('role')

    if (storedUsername) setUsername(storedUsername)
    if (storedId) {
      setUserId(storedId)
      // Fetch user data and notifications
      fetchUserData(storedId)
      fetchNotifications(storedId)
    }
    if (storedRole) setUserRole(storedRole)

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setChatOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch user data
  const fetchUserData = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      if (data.user?.unit_kerja) {
        setUnitKerja(data.user.unit_kerja)
      }
    } catch {
      setUnitKerja('MAKARTI Dashboard')
    }
  }

  // Fetch notifications/messages
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

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) return
    
    setIsTyping(true)
    try {
      // Determine target role
      const targetRole = userRole === '1' ? '2' : '1' // Send to opposite role
      
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: parseInt(userId),
          receiver_role: targetRole,
          message: newMessage.trim(),
          type: 'info'
        })
      })

      if (response.ok) {
        setNewMessage('')
        // Refresh notifications
        await fetchNotifications(userId)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  // Mark as read
  const markAsRead = async (messageId: number) => {
    try {
      await fetch(`/api/notifications/mark-read/${messageId}`, {
        method: 'PUT'
      })
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, is_read: true }
            : msg
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const handleChangePassword = () => {
    router.push('/ubah-password')
  }

  return (
    <header className="h-16 bg-white border-b shadow-sm px-6 flex items-center justify-between sticky top-0 z-20">
      <h1 className="text-lg font-semibold text-blue-700">
        📊 {unitKerja}
      </h1>

      <div className="flex items-center gap-4">
        {/* Personal Messages System */}
        <div className="relative" ref={chatRef}>
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-all duration-200 group"
          >
            <Mail className={`w-5 h-5 transition-colors ${
              unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'
            } group-hover:text-blue-500`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Messages Panel */}
          {chatOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white border rounded-xl shadow-2xl z-50 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold text-sm">
                        {userRole === '1' ? 'Pesan dengan User' : 'Pesan dengan Admin'}
                      </h3>
                      <p className="text-xs opacity-90">Komunikasi Internal</p>
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
              <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 font-medium">Belum ada pesan</p>
                    <p className="text-sm text-gray-500">Mulai percakapan dengan mengirim pesan</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                      <div className={`flex ${msg.sender_id.toString() === userId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] group ${msg.sender_id.toString() === userId ? 'order-2' : 'order-1'}`}>
                          {/* Message Bubble */}
                          <div 
                            className={`relative p-3 rounded-2xl shadow-sm ${
                              msg.sender_id.toString() === userId
                                ? 'bg-blue-500 text-white rounded-br-md'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                            } ${!msg.is_read && msg.sender_id.toString() !== userId ? 'ring-2 ring-blue-300' : ''}`}
                            onClick={() => !msg.is_read && markAsRead(msg.id)}
                          >
                            {/* Sender Info */}
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
                            
                            {/* Message Content */}
                            <div className="text-sm leading-relaxed whitespace-pre-line">
                              {msg.message}
                            </div>
                            
                            {/* Timestamp and Status */}
                            <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              {msg.sender_id.toString() === userId && (
                                <CheckCheck className={`w-3 h-3 ${msg.is_read ? 'text-blue-400' : 'text-gray-400'}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
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
                    placeholder={userRole === '1' ? "Kirim pesan ke user..." : "Kirim pesan ke admin..."}
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
                
                {/* Status */}
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

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-lg"
          >
            <Image
              src="/avatar.png"
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm font-medium text-gray-800">
              {username || 'Pengguna'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-30">
              <button
                onClick={handleChangePassword}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                🔒 Ubah Password
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
