import { NextApiRequest, NextApiResponse } from 'next'
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  userId: number // We'll get this from the request body or session
}

// Simple password hashing using PBKDF2
function hashPassword(password: string): string {
  const salt = randomBytes(32).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

// Verify password against hash
function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':')
    const hashToVerify = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashToVerify, 'hex'))
  } catch {
    return false
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  try {
    const { currentPassword, newPassword, userId }: ChangePasswordRequest = req.body

    // Validate input
    if (!currentPassword || !newPassword || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password lama, password baru, dan user ID wajib diisi' 
      })
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password baru minimal 8 karakter' 
      })
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus' 
      })
    }

    // Get user from database
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId.toString()) },
      select: {
        id: true,
        username: true,
        password: true,
        role: true
      }
    })

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      })
    }

    if (!user.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password tidak tersedia dalam sistem' 
      })
    }

    // Verify current password
    const isCurrentPasswordValid = verifyPassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password lama tidak sesuai' 
      })
    }

    // Check if new password is same as current password
    const isSamePassword = verifyPassword(newPassword, user.password)
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password baru tidak boleh sama dengan password lama' 
      })
    }

    // Hash new password
    const hashedNewPassword = hashPassword(newPassword)

    // Update password in database
    await prisma.users.update({
      where: { id: user.id },
      data: { 
        password: hashedNewPassword
      }
    })

    // Log password change (optional - for security auditing)
    console.log(`Password changed for user: ${user.username} (ID: ${user.id}) at ${new Date().toISOString()}`)

    return res.status(200).json({ 
      success: true, 
      message: 'Password berhasil diubah',
      data: {
        username: user.username,
        name: user.name,
        changedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error changing password:', error)

    return res.status(500).json({ 
      success: false, 
      message: 'Terjadi kesalahan internal server' 
    })
  } finally {
    await prisma.$disconnect()
  }
}
