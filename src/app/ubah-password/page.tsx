'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle, ArrowLeft, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

const UbahPasswordPage = () => {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength checker
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        Object.values(checks).forEach(check => {
            if (check) strength++;
        });

        return { strength, checks };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const getStrengthColor = (strength: number) => {
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        if (strength <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = (strength: number) => {
        if (strength <= 2) return 'Lemah';
        if (strength <= 3) return 'Sedang';
        if (strength <= 4) return 'Kuat';
        return 'Sangat Kuat';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Semua field harus diisi.');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Password baru dan konfirmasi tidak cocok.');
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError('Password baru minimal 8 karakter.');
            setLoading(false);
            return;
        }

        if (passwordStrength.strength < 3) {
            setError('Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.');
            setLoading(false);
            return;
        }

        try {
            // Get user ID from localStorage
            const userId = localStorage.getItem('id');
            if (!userId) {
                setError('Sesi tidak valid. Silakan login kembali.');
                setLoading(false);
                router.push('/login');
                return;
            }

            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    userId: parseInt(userId)
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengubah password');
            }

            setSuccess('Password berhasil diubah! Anda akan diarahkan ke halaman login dalam 3 detik.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            // Clear user session and redirect after 3 seconds
            setTimeout(() => {
                localStorage.clear(); // Clear all session data
                router.push('/login');
            }, 3000);

        } catch (err: unknown) {
            let message = 'Terjadi kesalahan. Silakan coba lagi.';
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-100/20 to-transparent rounded-full"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-100/20 to-transparent rounded-full"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Kembali
                </button>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                            <Key className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ubah Password</h1>
                        <p className="text-gray-600">Pastikan password baru Anda aman dan mudah diingat</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Current Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Password Saat Ini
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                                    placeholder="Masukkan password saat ini"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Password Baru
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Shield className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                                    placeholder="Masukkan password baru"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {newPassword && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Kekuatan Password:</span>
                                        <span className={`text-sm font-medium ${
                                            passwordStrength.strength <= 2 ? 'text-red-600' :
                                            passwordStrength.strength <= 3 ? 'text-yellow-600' :
                                            passwordStrength.strength <= 4 ? 'text-blue-600' : 'text-green-600'
                                        }`}>
                                            {getStrengthText(passwordStrength.strength)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength.strength)}`}
                                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                        ></div>
                                        
                                        {/* Password Requirements */}
                                        <div className="grid grid-cols-1 gap-1 text-xs">
                                            <div className={`flex items-center ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Minimal 8 karakter
                                            </div>
                                            <div className={`flex items-center ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Huruf besar (A-Z)
                                            </div>
                                            <div className={`flex items-center ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Huruf kecil (a-z)
                                            </div>
                                            <div className={`flex items-center ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Angka (0-9)
                                            </div>
                                            <div className={`flex items-center ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Karakter khusus (!@#$%^&*)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Konfirmasi Password Baru
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Shield className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 ${
                                        confirmPassword && newPassword !== confirmPassword 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : confirmPassword && newPassword === confirmPassword
                                            ? 'border-green-300 focus:ring-green-500'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Konfirmasi password baru"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    Password tidak cocok
                                </p>
                            )}
                            {confirmPassword && newPassword === confirmPassword && (
                                <p className="text-sm text-green-600 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Password cocok
                                </p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                    <span className="text-red-700">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    <span className="text-green-700">{success}</span>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Mengubah Password...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <Key className="w-5 h-5 mr-2" />
                                    Ubah Password
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Security Tips */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Tips Keamanan:</h3>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
                            <li>• Jangan gunakan informasi pribadi dalam password</li>
                            <li>• Ubah password secara berkala untuk keamanan maksimal</li>
                            <li>• Jangan bagikan password kepada siapa pun</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UbahPasswordPage;