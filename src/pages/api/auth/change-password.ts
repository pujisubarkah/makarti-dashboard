import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  userId: number // We'll get this from the request body or session
}

// Hash password using bcrypt
function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

// Verify password using bcrypt
function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
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
    console.log('Received body:', req.body);
    const { currentPassword, newPassword, userId }: ChangePasswordRequest = req.body

    // Validate input
    if (!currentPassword || !newPassword || !userId) {
      console.log('Validation failed: missing fields', { currentPassword, newPassword, userId });
      return res.status(400).json({ 
        success: false, 
        message: 'Password lama, password baru, dan user ID wajib diisi' 
      })
    }

    // Password strength validation
    if (newPassword.length < 8) {
      console.log('Validation failed: password too short');
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
      console.log('Validation failed: password complexity', { hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar });
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
      console.log('Validation failed: user not found', { userId });
      return res.status(404).json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      })
    }

    if (!user.password) {
      console.log('Validation failed: user has no password');
      return res.status(400).json({ 
        success: false, 
        message: 'Password tidak tersedia dalam sistem' 
      })
    }

    // Verify current password
    const isCurrentPasswordValid = verifyPassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      console.log('Validation failed: current password incorrect');
      return res.status(400).json({ 
        success: false, 
        message: 'Password lama tidak sesuai' 
      })
    }

    // Check if new password is same as current password
    const isSamePassword = verifyPassword(newPassword, user.password)
    if (isSamePassword) {
      console.log('Validation failed: new password same as current');
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
