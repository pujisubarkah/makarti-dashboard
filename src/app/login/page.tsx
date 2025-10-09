'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Enhanced user experience with smoother transitions
    try {
      // Simulate initial processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Gagal login');
        setIsLoading(false);
        return;
      }

      // ✅ Simpan ke localStorage
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('role_id', data.user.role_id.toString());
      localStorage.setItem('id', data.user.id || '');

      // Add login timestamp
      localStorage.setItem('loginTime', new Date().toISOString());

      // Transisi loading yang lebih smooth dengan animation steps
      // Step 1: Loading data (selesai)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 2: Mempersiapkan dashboard (simulasi)
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Step 3: Redirect berdasarkan role
      if (data.user.role_id === 1) {
        router.push('/admin/dashboard');
      } else if (data.user.role_id === 4) {
        // Format slug: hapus spasi, ganti dengan dash
        const unitSlug = (data.user.unit_kerja || 'unit')
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        router.push(`/${unitSlug}`);
      } else {
        router.push('/user/dashboard');
      }

    } catch {
      setError('Terjadi kesalahan server');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex h-screen m-0 p-0 bg-gradient-to-br from-blue-100 via-blue-50 to-white">
      {/* Kiri: Form Login */}
      <div className="w-full md:w-1/3 flex flex-col justify-center items-center p-8 min-h-screen relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-200/30 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300/20 rounded-full filter blur-3xl translate-x-1/4 translate-y-1/4"></div>
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center shadow-lg">
            <div className="absolute inset-0 rounded-full bg-white/50 backdrop-blur-sm"></div>
            <Image 
              src="/lanri.png" 
              alt="Logo MAKARTI" 
              width={150} 
              height={150}
              className="p-4 relative z-10 hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h1 className="text-5xl font-bold mb-3 text-[#3781c7] mt-20 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-700 tracking-tight">MAKARTI 5.0</h1>
          <p className="text-blue-800/70 text-center text-lg md:text-xl font-medium max-w-md">Dashboard Monitoring Kinerja & Inovasi ASN LAN</p>
        </div>
        <div className="w-full max-w-md bg-white/90 p-8 rounded-xl shadow-lg backdrop-blur-md border border-blue-100/50 transition-all duration-300 hover:shadow-xl relative z-10">
          <form onSubmit={handleLogin} className="space-y-6 text-base md:text-lg">
            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                <p className="text-base md:text-lg font-medium">{error}</p>
              </div>
            )}            <div className="mb-5 group">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2 ml-1 transition-colors group-focus-within:text-blue-600">Username</label>
              <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
                <span className="absolute left-3 top-3.5 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-300">
                  <User size={20} strokeWidth={1.5} />
                </span>
                <input
                  className="shadow-sm border border-blue-100 rounded-lg w-full py-3.5 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-base md:text-lg bg-blue-50/30 hover:bg-blue-50/50 focus:bg-white"
                  id="username"
                  type="text"
                  placeholder="Masukkan username anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-5 group">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 ml-1 transition-colors group-focus-within:text-blue-600">Password</label>
              <div className="relative transition-all duration-300 group-focus-within:scale-[1.01]">
                <span className="absolute left-3 top-3.5 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-300">
                  <Lock size={20} strokeWidth={1.5} />
                </span>
                <input
                  className="shadow-sm border border-blue-100 rounded-lg w-full py-3.5 pl-10 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-base md:text-lg bg-blue-50/30 hover:bg-blue-50/50 focus:bg-white"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-blue-400 hover:text-blue-600 transition duration-200 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                </button>
              </div>
            </div>            <div className="mb-6">
              <label className="inline-flex items-center cursor-pointer text-base md:text-lg group">
                <input
                  type="checkbox"
                  className="form-checkbox rounded text-blue-500 border-blue-300 focus:ring-blue-300 cursor-pointer h-5 w-5"
                  checked={false}
                  onChange={() => {}}
                />
                <span className="ml-2 text-gray-600 group-hover:text-gray-800 transition-colors duration-200">Ingat saya?</span>
              </label>
            </div>            <div className="flex items-center justify-between">
              <button
                disabled={isLoading}
                className="relative bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-3.5 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center text-base md:text-lg overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]"
                type="submit"
              >
                <span className={`flex items-center justify-center transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                  Masuk
                </span>
                {isLoading && (
                  <span className="absolute flex items-center justify-center">
                    <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Proses Login...
                  </span>
                )}
              </button>
            </div>            {isLoading && (
              <div className="mt-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100 shadow-sm backdrop-blur-sm">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">Sedang login...</span>
                  <span className="text-xs font-medium text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full">
                    Mohon tunggu
                  </span>
                </div>
                <div className="h-2.5 w-full bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full animate-loading-progress bg-gradient-animate"></div>
                </div>
                <div className="mt-3 flex items-center justify-center flex-col">
                  <p className="text-sm text-center text-gray-600 animate-pulse">
                    <span className="inline-block bg-blue-100/80 w-1.5 h-1.5 rounded-full mr-1 animate-pulse"></span>
                    Memverifikasi kredensial...
                  </p>
                  <div className="mt-2 flex space-x-1.5">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                    <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Footer with copyright */}
        <div className="absolute bottom-4 text-center text-xs text-blue-500/70 font-medium z-10">
          <p>&copy; {new Date().getFullYear()} Lembaga Administrasi Negara</p>
          <p className="mt-1">MAKARTI 5.0 - Monitoring Kinerja & Inovasi</p>
        </div>
      </div>      {/* Kanan: Background Image */}
      <div className="hidden md:flex w-2/3 bg-gradient-to-br from-blue-50 to-white items-center justify-center m-0 p-0 relative min-h-screen overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-300/10 rounded-full filter blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-200/20 rounded-full filter blur-2xl"></div>
        
        <div className="absolute inset-0 z-10 backdrop-blur-[1px]"></div>
        
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/5 to-transparent z-10"></div>
        
        <Image
          src="/smarter.png"
          alt="Background MAKARTI"
          fill
          className="object-cover z-0 transition-transform duration-700 ease-in-out hover:scale-105"
          priority
          quality={100}
        />
        
        {/* Overlay text */}
        <div className="absolute bottom-10 left-10 z-20">
          <h2 className="text-blue-800 text-xl font-semibold drop-shadow-md bg-white/30 backdrop-blur-sm p-3 rounded-lg inline-block">
            MAKARTI 5.0
          </h2>
        </div>
      </div>
    </div>
  );
}
