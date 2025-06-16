"use client"



export default function Home() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    
      <main className="flex-1 p-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              Selamat datang di MAKARTI{" "}
              <span className="text-yellow-300 animate-bounce">🎉</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Platform terintegrasi untuk mengelola kinerja, inovasi, komunikasi, dan pembelajaran
              dengan teknologi terdepan.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-800 ml-3">Kinerja</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Monitor dan evaluasi kinerja secara real-time dengan dashboard interaktif.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-indigo-500 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-indigo-800 ml-3">Inovasi</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Kelola ide-ide kreatif dan implementasi inovasi untuk kemajuan organisasi.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-cyan-500 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-cyan-100 p-3 rounded-full">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-cyan-800 ml-3">Komunikasi</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Fasilitasi komunikasi efektif antar tim dan departemen.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-sky-500 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="bg-sky-100 p-3 rounded-full">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-sky-800 ml-3">Pembelajaran</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Platform pembelajaran berkelanjutan untuk pengembangan SDM.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
            Statistik Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
              <div className="text-blue-800 font-medium">Pengguna Aktif</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-xl">
              <div className="text-3xl font-bold text-indigo-600 mb-2">25</div>
              <div className="text-indigo-800 font-medium">Proyek Selesai</div>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-xl">
              <div className="text-3xl font-bold text-cyan-600 mb-2">98%</div>
              <div className="text-cyan-800 font-medium">Tingkat Kepuasan</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Mulai Eksplorasi
          </button>
        </div>
      </main>
    </div>
  )
}
