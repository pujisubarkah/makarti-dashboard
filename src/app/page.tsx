
import Image from 'next/image';

export default function Home() {
  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: 'url(/better.jpg)' }}
    >
  {/* Overlay to make background more subtle */}
  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />
  <div className="relative w-[600px] h-[600px] flex items-center justify-center z-10 group hover:cursor-pointer" id="start-btn">
        {/* Logo Circle */}
        <div id="start" className="bg-white group-hover:opacity-0 md:group-hover:opacity-100 rounded-full opacity-85 shadow-md group-hover:translate-y-[260px] md:group-hover:translate-y-[90px] group-hover:shadow-white shadow-white group-hover:shadow-2xl group-hover:bg-slate-100/80 transition-all duration-500 group-hover:ring-2 group-hover:ring-red-600/85 lg:group-hover:scale-125 group-hover:scale-105 peer flex justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{zIndex:2}}>
          <div className="size-[160px] md:size-[220px] rounded-xl flex justify-center items-center">
            <Image src="/lanri.png" width={165} height={165} alt="Logo LAN" className="w-3/4 h-auto" />
          </div>
        </div>

        {/* Three Circles on Hover (Desktop) */}
        {/* Guest menu, visible on hover, desktop only */}
        <div id="menu-is-quest" className="hidden md:block">
          {/* Left Circle: Makarti 5.0 (lapor icon) */}
          <a href="/login"
            className="absolute text-center size-[190px] bg-blue-50 border-red-500 border-[1px] shadow-lg shadow-white/40 text-slate-800 font-semibold hover:scale-105 opacity-0 rounded-full flex flex-col justify-center items-center transition-all duration-300 delay-200 group-hover:opacity-90 group-hover:-translate-x-[270px] group-hover:-translate-y-[30px] p-2"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) translate(-270px, -30px)' }}
          >
            <div className="flex flex-col justify-center items-center">
              <Image src="/lanri.png" alt="Logo LAN" width={60} height={60} className="mb-2" />
              <span className="text-[#269DD8] font-bold text-lg">Makarti 5.0</span>
            </div>
          </a>
          {/* Right Circle: Makarti Corpu (LMS icon) */}
          <a href="/corpu" id="btn-layanan-guest2"
            className="absolute text-center size-[190px] bg-blue-50 border-red-500 border-[1px] shadow-lg shadow-white/40 text-slate-800 font-semibold hover:scale-105 opacity-0 rounded-full flex flex-col justify-center items-center transition-all duration-300 delay-200 group-hover:opacity-90 group-hover:translate-x-[270px] group-hover:-translate-y-[30px]"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) translate(270px, -30px)' }}
          >
            <div className="flex flex-col justify-center items-center">
              <Image src="/lanri.png" alt="Logo LAN" width={60} height={60} className="mb-2" />
              <span className="text-[#269DD8] font-bold text-lg">Makarti Corpu</span>
            </div>
          </a>
        </div>

        {/* Desktop Welcome */}
        <div className="relative group-hover:opacity-0 opacity-100 transition-all duration-500 w-full bg-red-400 hidden md:block">
          <div className="absolute md:w-[800px] flex flex-col gap-2 items-center md:-left-[300px] -top-[320px] md:text-3xl text-white justify-center">
            <div className="md:text-4xl text-white">
              Selamat Datang di
              <br className="md:hidden" />
              <br className="md:hidden" />
              <span className="text-4xl font-bold bg-white/80 px-4 py-1 rounded-xl text-[#269DD8]">MAKARTI 5.0</span>
            </div>
            <div>ASN LAN: Satu Gerbang Pembelajaran dan Reputasi, Lebih Besar, Lebih Cerdas, Lebih Baik</div>
            <div className="text-[#269DD8] bg-white/85 px-4 py-2 rounded-xl font-bold">
              LEMBAGA <span>ADMINISTRASI</span> Negara
            </div>
          </div>
        </div>

        {/* Mobile Welcome */}
        <div className="relative -top-[200px] group-hover:opacity-0 transition-all duration-200">
          <div className="md:hidden w-[300px] absolute -left-[70px] text-center text-white">
            <div className="md:text-4xl text-white">
              Selamat Datang di
              <br className="md:hidden" />
              <br className="md:hidden" />
              <span className="text-4xl font-bold bg-white/80 px-4 py-1 rounded-xl text-[#269DD8]">MAKARTI 5.0</span>
            </div>
            <div className="my-2">ASN LAN: Satu Gerbang Pembelajaran dan Reputasi, Lebih Besar, Lebih Cerdas, Lebih Baik</div>
            <div className="text-[#269DD8] bg-white/85 px-4 py-2 rounded-xl font-bold">
              LEMBAGA <span>ADMINISTRASI</span> NEGARA
            </div>
          </div>
        </div>

        {/* Mobile Buttons */}
        <div className="md:hidden">
          <div className="relative">
            <a
              href="/login"
              id="btn-layanan-makarti-mobile"
              className="absolute -left-16 text-center py-5 px-2 w-[300px] rounded-md bg-blue-50 border-red-500 border-[1px] shadow-lg shadow-white/40 text-slate-800 font-semibold hover:scale-105 opacity-0 flex justify-center items-center transition-all duration-300 delay-200 p-2 group-hover:opacity-90 group-hover:-translate-y-[110px]"
            >
              <div className="text-center flex gap-4 justify-center items-center text-[#DF2463]">
                {/* Lapor Icon (megaphone) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10v4a1 1 0 001 1h2l3 5V4L6 9H4a1 1 0 00-1 1zm13-1v6a3 3 0 003-3 3 3 0 00-3-3z" />
                </svg>
                <span className="text-[#269DD8] font-bold text-lg">Makarti 5.0</span>
              </div>
            </a>
          </div>
          {/* Tambahkan button mobile lain sesuai kebutuhan, copy struktur di atas */}
        </div>
        {/* ...tambahkan elemen lain sesuai kebutuhan... */}
      </div>
    </div>
  );
}