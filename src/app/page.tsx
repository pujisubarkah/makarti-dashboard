
import Image from 'next/image';

export default function Home() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: 'url(/bsb.png)' }}
    >
      {/* Enhanced overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/60 backdrop-blur-[2px] z-0" />
      
      {/* Main container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col items-center justify-center h-screen overflow-hidden">
        
        {/* Title Section - Centered */}
        <div className="text-center mb-2 md:mb-3 mt-8 md:mt-12 lg:mt-16 group-hover:opacity-0 transition-all duration-500 px-6 md:px-8">
          <div className="space-y-2 md:space-y-3">
            <h1
              className="text-lg md:text-2xl lg:text-4xl font-light text-white leading-tight tracking-wide"
              style={{ textShadow: "0 2px 8px #269DD8, 0 0px 2px #fff" }}
            >
              Selamat Datang di
            </h1>
            <div className="inline-block">
              <span
                className="text-xl md:text-3xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-text text-transparent px-3 md:px-5 py-1 md:py-2 rounded-lg md:rounded-xl backdrop-blur-sm bg-white/10 border border-yellow-400/40 shadow-xl"
                style={{ textShadow: "0 2px 10px #FFD700, 0 0px 2px #fff" }}
              >
                MAKARTI 5.0
              </span>
            </div>
            <p
              className="text-xs md:text-sm lg:text-base text-white/90 max-w-xs md:max-w-lg lg:max-w-2xl mx-auto leading-relaxed font-light px-3 md:px-4"
              style={{ textShadow: "0 1px 6px #269DD8, 0 0px 2px #fff" }}
            >
              ASN LAN: Satu Gerbang Pembelajaran dan Reputasi<br/>BIGGER, SMARTTER, BETTER
            </p>
            <div className="inline-block mt-2 md:mt-3">
              <div className="text-[#269DD8] bg-white/95 px-3 md:px-5 py-1 md:py-2 rounded-md md:rounded-lg font-bold text-xs md:text-sm lg:text-base shadow-lg border border-white/30">
                LEMBAGA ADMINISTRASI NEGARA
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Logo Section */}
        <div className="relative w-full max-w-[300px] md:max-w-[400px] lg:w-[500px] h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center group hover:cursor-pointer" id="start-btn">
          {/* Main Logo Circle */}
          <div id="start" className="bg-white group-hover:opacity-0 md:group-hover:opacity-100 rounded-full opacity-85 shadow-md group-hover:translate-y-[150px] md:group-hover:translate-y-[200px] lg:group-hover:translate-y-[90px] group-hover:shadow-white shadow-white group-hover:shadow-2xl group-hover:bg-slate-100/80 transition-all duration-500 group-hover:ring-2 group-hover:ring-red-600/85 group-hover:scale-105 lg:group-hover:scale-125 peer flex justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{zIndex:2}}>
            <div className="size-[100px] md:size-[130px] lg:size-[180px] rounded-xl flex justify-center items-center">
              <Image src="/lanri.png" width={140} height={140} alt="Logo LAN" className="w-3/4 h-auto" />
            </div>
          </div>

          {/* Desktop Navigation Menu - appears on hover */}
          <div id="menu-is-quest" className="hidden md:block">
            {/* Left Circle: Makarti 5.0 */}
            <a href="/login"
              className="absolute text-center size-[120px] lg:size-[150px] bg-blue-50 border-red-500 border-[1px] shadow-lg shadow-white/40 text-slate-800 font-semibold hover:scale-105 opacity-0 rounded-full flex flex-col justify-center items-center transition-all duration-300 delay-200 group-hover:opacity-90 group-hover:-translate-x-[160px] lg:group-hover:-translate-x-[220px] group-hover:-translate-y-[20px] p-2"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) translate(-160px, -20px)' }}
            >
              <div className="flex flex-col justify-center items-center">
                <Image src="/lanri.png" alt="Logo LAN" width={40} height={40} className="mb-1" />
                <span className="text-[#269DD8] font-bold text-xs lg:text-sm">Makarti 5.0</span>
              </div>
            </a>
            
            {/* Right Circle: Makarti Corpu */}
            <a href="https://makarti-corpu.vercel.app/" target="_blank" rel="noopener noreferrer" id="btn-layanan-guest2"
              className="absolute text-center size-[120px] lg:size-[150px] bg-blue-50 border-red-500 border-[1px] shadow-lg shadow-white/40 text-slate-800 font-semibold hover:scale-105 opacity-0 rounded-full flex flex-col justify-center items-center transition-all duration-300 delay-200 group-hover:opacity-90 group-hover:translate-x-[160px] lg:group-hover:translate-x-[220px] group-hover:-translate-y-[20px]"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) translate(160px, -20px)' }}
            >
              <div className="flex flex-col justify-center items-center">
                <Image src="/lanri.png" alt="Logo LAN" width={40} height={40} className="mb-1" />
                <span className="text-[#269DD8] font-bold text-xs lg:text-sm">Makarti Corpu</span>
                <span className="text-gray-500 text-xs lg:text-sm">Coming Soon!</span>
              </div>
            </a>

            {/* Top Circle: Manajemen Kinerja */}
            <a href="https://simanja-indol.vercel.app/" target="_blank" rel="noopener noreferrer" id="btn-manajemen-kinerja"
              className="absolute text-center size-[120px] lg:size-[150px] bg-blue-50 border-red-500 border-[1px] shadow-lg shadow-white/40 text-slate-800 font-semibold hover:scale-105 opacity-0 rounded-full flex flex-col justify-center items-center transition-all duration-300 delay-300 group-hover:opacity-90 group-hover:-translate-y-[140px] lg:group-hover:-translate-y-[170px]"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) translate(0px, -140px)' }}
            >
              <div className="flex flex-col justify-center items-center">
                <Image src="/lanri.png" alt="Logo LAN" width={40} height={40} className="mb-1" />
                <span className="text-[#269DD8] font-bold text-xs lg:text-sm">Manajemen</span>
                <span className="text-[#269DD8] font-bold text-xs lg:text-sm">Kinerja</span>
                <span className="text-gray-500 text-xs lg:text-sm">Coming Soon!</span>
              </div>
            </a>
          </div>

          {/* Mobile Navigation Menu */}
          <div className="md:hidden">
            <div className="relative">
              <a
                href="/login"
                id="btn-layanan-makarti-mobile"
                className="absolute -left-4 text-center py-2 px-3 w-[200px] rounded-md bg-blue-50 border-red-500 border-[1px] shadow-lg shadow-white/40 text-slate-800 font-semibold hover:scale-105 opacity-0 flex justify-center items-center transition-all duration-300 delay-200 p-2 group-hover:opacity-90 group-hover:-translate-y-[60px]"
              >
                <div className="text-center flex gap-2 justify-center items-center text-[#DF2463]">
                  {/* Lapor Icon (megaphone) */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10v4a1 1 0 001 1h2l3 5V4L6 9H4a1 1 0 00-1 1zm13-1v6a3 3 0 003-3 3 3 0 00-3-3z" />
                  </svg>
                  <span className="text-[#269DD8] font-bold text-sm">Makarti 5.0</span>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="absolute bottom-4 md:bottom-6 text-center text-white/70 text-xs group-hover:opacity-0 transition-all duration-500 px-6">
          <p>Klik logo untuk memulai</p>
        </div>
      </div>
    </div>
  );
}
