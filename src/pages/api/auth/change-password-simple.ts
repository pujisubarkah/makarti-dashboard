import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  userId: number
}

// Simple hash function (for development only - use proper hashing in production)
function simpleHash(password: string): string {
  // This is a very basic hash - in production, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
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

    // For development: simple password verification
    // In production, use proper password hashing comparison
    const isCurrentPasswordValid = user.password === currentPassword || 
                                  simpleHash(currentPassword) === user.password

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password lama tidak sesuai' 
      })
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password baru tidak boleh sama dengan password lama' 
      })
    }

    // For development: store password as is or with simple hash
    // In production, use proper password hashing
    const hashedNewPassword = simpleHash(newPassword)

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
    
  }
}

