import Image from 'next/image';
import Link from 'next/link';

export default function CorpuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <Image 
            src="/lanri.png" 
            alt="Logo LAN" 
            width={160}
            height={160}
            className="mx-auto w-32 h-32 md:w-40 md:h-40 object-contain"
          />
        </div>

        {/* Main Title */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Makarti Corpu
          </h1>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
        </div>

        {/* Coming Soon Badge */}
        <div className="mb-8">
          <span className="inline-block bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full text-lg font-semibold border border-yellow-300">
            🚧 Sedang Dalam Pengembangan
          </span>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-xl md:text-2xl text-gray-600 mb-4">
            Coming Soon
          </p>
          <p className="text-gray-500 leading-relaxed">
            Platform pembelajaran dan pengembangan kompetensi ASN yang inovatif sedang dalam tahap pengembangan. 
            Nantikan kehadiran fitur-fitur menarik yang akan membantu meningkatkan kapasitas dan kualitas pelayanan publik 
            menjadi <span className="font-semibold text-blue-600">Bigger</span>, 
            <span className="font-semibold text-blue-600"> Smarter</span>, dan 
            <span className="font-semibold text-blue-600"> Better</span>.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-3 mb-2">
            <div className="bg-blue-500 h-3 rounded-full animate-pulse" style={{ width: '45%' }}></div>
          </div>
          <p className="text-sm text-gray-500">Progress Pengembangan: 45%</p>
        </div>

        {/* Back Button */}
        <div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Kembali ke Beranda
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-400 text-sm">
            © 2025 Pusdatin Lembaga Administrasi Negara - Makarti 5.0
          </p>
        </div>
      </div>
    </div>
  );
}
