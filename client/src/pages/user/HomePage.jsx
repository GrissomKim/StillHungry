import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useFavorites } from '../../hooks/useFavorites'

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: '조식' },
  { value: 'LUNCH', label: '중식' },
  { value: 'DINNER', label: '석식' },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

function FavoriteCard({ cafeteriaId, navigate }) {
  const [cafeteria, setCafeteria] = useState(null)
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/public/cafeterias/${cafeteriaId}`),
      api.get(`/public/cafeterias/${cafeteriaId}/menus`, { params: { date: today() } }),
    ])
      .then(([cafRes, menuRes]) => {
        setCafeteria(cafRes.data.data)
        setMenus(menuRes.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [cafeteriaId])

  if (loading) {
    return <div className="bg-white rounded-2xl border h-32 animate-pulse" />
  }

  return (
    <button
      onClick={() => navigate(`/cafeteria/${cafeteriaId}`)}
      className="w-full bg-white rounded-2xl border shadow-sm p-4 text-left hover:border-blue-400 hover:shadow-md transition"
    >
      {/* 식당명 */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-800">{cafeteria?.name}</p>
        <span className="text-gray-300 text-lg">›</span>
      </div>

      {/* 오늘 메뉴 */}
      {menus.length === 0 ? (
        <p className="text-xs text-gray-400">오늘 등록된 메뉴가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {MEAL_TYPES.map((mt) => {
            const menu = menus.find((m) => m.mealType === mt.value)
            if (!menu) return null
            const mainItems = menu.items.filter((i) => i.isMain)
            const others = menu.items.filter((i) => !i.isMain)
            return (
              <div key={mt.value} className="flex items-start gap-2">
                <span className="text-xs font-semibold text-blue-500 w-6 shrink-0 pt-0.5">
                  {mt.label}
                </span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {mainItems.map((i) => (
                    <span key={i.id} className="font-medium text-gray-800">{i.name}</span>
                  ))}
                  {mainItems.length > 0 && others.length > 0 && (
                    <span className="text-gray-400"> · </span>
                  )}
                  {others.map((i, idx) => (
                    <span key={i.id}>
                      {i.name}{idx < others.length - 1 && <span className="text-gray-300"> · </span>}
                    </span>
                  ))}
                  {menu.price && (
                    <span className="ml-1 text-gray-400">({menu.price.toLocaleString()}원)</span>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </button>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { favorites } = useFavorites()
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

      <main className="max-w-xl mx-auto px-4 py-6 space-y-8">

        {/* 즐겨찾기 섹션 */}
        {favorites.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              ❤️ 즐겨찾기 — 오늘의 메뉴
            </h2>
            <div className="space-y-3">
              {favorites.map((cafId) => (
                <FavoriteCard key={cafId} cafeteriaId={cafId} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* 단지 탐색 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            단지 선택
          </h2>

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
        </section>

      </main>
    </div>
  )
}
