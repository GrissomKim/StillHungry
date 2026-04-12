import { useState, useEffect, useCallback } from 'react'
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

// 즐겨찾기 식당 카드 (오늘 메뉴 요약)
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

  if (loading) return <div className="bg-white rounded-2xl border h-32 animate-pulse" />

  return (
    <button
      onClick={() => navigate(`/cafeteria/${cafeteriaId}`)}
      className="w-full bg-white rounded-2xl border shadow-sm p-4 text-left hover:border-blue-400 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-800">{cafeteria?.name}</p>
          {cafeteria?.complex && (
            <p className="text-xs text-gray-400 mt-0.5">{cafeteria.complex.name}</p>
          )}
        </div>
        <span className="text-gray-300 text-lg">›</span>
      </div>

      {menus.length === 0 ? (
        <p className="text-xs text-gray-400">오늘 등록된 메뉴가 없습니다.</p>
      ) : (
        <div className="space-y-1.5">
          {MEAL_TYPES.map((mt) => {
            const menu = menus.find((m) => m.mealType === mt.value)
            if (!menu) return null
            const mainItems = menu.items.filter((i) => i.isMain)
            const others = menu.items.filter((i) => !i.isMain)
            return (
              <div key={mt.value} className="flex items-start gap-2">
                <span className="text-xs font-semibold text-blue-500 w-6 shrink-0 pt-0.5">{mt.label}</span>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {mainItems.map((i) => (
                    <span key={i.id} className="font-medium text-gray-800">{i.name}</span>
                  ))}
                  {mainItems.length > 0 && others.length > 0 && (
                    <span className="text-gray-300"> · </span>
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
  const [tab, setTab] = useState(favorites.length > 0 ? 'favorites' : 'explore')

  // 탐색 탭 상태
  const [complexes, setComplexes] = useState([])
  const [complexLoading, setComplexLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    api.get('/public/complexes')
      .then(({ data }) => setComplexes(data.data))
      .catch(() => setComplexes([]))
      .finally(() => setComplexLoading(false))
  }, [])

  // 검색 — 입력 후 300ms 디바운스
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(() => {
      setSearching(true)
      api.get('/public/cafeterias', { params: { q: query.trim() } })
        .then(({ data }) => setSearchResults(data.data))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleTabChange = useCallback((next) => {
    setTab(next)
    setQuery('')
    setSearchResults([])
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-5 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">StillHungry</h1>
        <p className="text-xs text-gray-400 mt-0.5">오늘 뭐 먹지?</p>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b sticky top-[65px] z-10">
        <div className="max-w-xl mx-auto flex">
          <button
            onClick={() => handleTabChange('favorites')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              tab === 'favorites'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            ❤️ 즐겨찾기
          </button>
          <button
            onClick={() => handleTabChange('explore')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              tab === 'explore'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            탐색
          </button>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 py-5">

        {/* 즐겨찾기 탭 */}
        {tab === 'favorites' && (
          <>
            {favorites.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                <p className="text-4xl mb-3">🤍</p>
                <p className="font-medium text-gray-500 mb-1">즐겨찾기한 식당이 없습니다</p>
                <p className="text-sm">탐색 탭에서 식당을 찾아 ❤️를 눌러보세요</p>
                <button
                  onClick={() => handleTabChange('explore')}
                  className="mt-4 text-sm text-blue-600 font-medium hover:underline"
                >
                  탐색하러 가기 →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((cafId) => (
                  <FavoriteCard key={cafId} cafeteriaId={cafId} navigate={navigate} />
                ))}
              </div>
            )}
          </>
        )}

        {/* 탐색 탭 */}
        {tab === 'explore' && (
          <>
            {/* 검색창 */}
            <div className="relative mb-5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="식당 이름으로 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 검색 결과 */}
            {query.trim() ? (
              searching ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border h-16 animate-pulse" />
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-sm">"{query}"에 해당하는 식당이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((caf) => (
                    <button
                      key={caf.id}
                      onClick={() => navigate(`/cafeteria/${caf.id}`)}
                      className="w-full bg-white rounded-2xl border shadow-sm px-5 py-4 flex items-center justify-between hover:border-blue-400 hover:shadow-md transition text-left"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{caf.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{caf.complex.name}</p>
                        {caf.address && (
                          <p className="text-xs text-gray-400 mt-0.5">📍 {caf.address}</p>
                        )}
                      </div>
                      <span className="text-gray-300 text-lg">›</span>
                    </button>
                  ))}
                </div>
              )
            ) : (
              /* 단지 목록 */
              complexLoading ? (
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
                <>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">단지 선택</p>
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
                </>
              )
            )}
          </>
        )}

      </main>
    </div>
  )
}
