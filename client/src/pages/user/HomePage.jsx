import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

export default function HomePage() {
  const navigate = useNavigate()
  const [complexes, setComplexes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/complexes')
      .then(({ data }) => setComplexes(data.data))
      .catch(() => setComplexes([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-5 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">StillHungry</h1>
        <p className="text-xs text-gray-400 mt-0.5">오늘 뭐 먹지?</p>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">단지 선택</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border h-20 animate-pulse" />
            ))}
          </div>
        ) : complexes.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-4xl mb-3">🏢</p>
            <p>등록된 단지가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {complexes.map((complex) => (
              <button
                key={complex.id}
                onClick={() => navigate(`/complex/${complex.id}`)}
                className="w-full bg-white rounded-2xl border shadow-sm px-5 py-4 flex items-center justify-between hover:border-blue-400 hover:shadow-md transition text-left"
              >
                <div>
                  <p className="font-semibold text-gray-800">{complex.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{complex.slug}</p>
                </div>
                <span className="text-gray-300 text-lg">›</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
