import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/client'

export default function ComplexPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complex, setComplex] = useState(null)
  const [cafeterias, setCafeterias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/public/complexes`),
      api.get(`/public/complexes/${id}/cafeterias`),
    ])
      .then(([complexRes, cafRes]) => {
        const found = complexRes.data.data.find((c) => c.id === Number(id))
        setComplex(found || null)
        setCafeterias(cafRes.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-5 py-4 sticky top-0 z-10 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-700 transition text-xl leading-none"
        >
          ‹
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900">
            {complex ? complex.name : '식당 목록'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">식당을 선택하세요</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-700 transition text-lg leading-none"
          aria-label="홈으로"
        >
          🏠
        </button>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border h-24 animate-pulse" />
            ))}
          </div>
        ) : cafeterias.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p>등록된 식당이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cafeterias.map((caf) => (
              <button
                key={caf.id}
                onClick={() => navigate(`/cafeteria/${caf.id}`)}
                className="w-full bg-white rounded-2xl border shadow-sm px-5 py-4 flex items-center justify-between hover:border-blue-400 hover:shadow-md transition text-left"
              >
                <div>
                  <p className="font-semibold text-gray-800">{caf.name}</p>
                  {caf.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{caf.description}</p>
                  )}
                  {caf.address && (
                    <p className="text-xs text-gray-400 mt-0.5">📍 {caf.address}</p>
                  )}
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
