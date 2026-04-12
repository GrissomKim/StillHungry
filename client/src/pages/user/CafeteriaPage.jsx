import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/client'
import { useFavorites } from '../../hooks/useFavorites'

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: '조식' },
  { value: 'LUNCH', label: '중식' },
  { value: 'DINNER', label: '석식' },
]

const TYPE_LABELS = { NOTICE: '공지', EVENT: '이벤트' }

function today() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function CafeteriaPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { toggleFavorite, isFavorite } = useFavorites()
  const cafId = Number(id)

  const [cafeteria, setCafeteria] = useState(null)
  const [tab, setTab] = useState('menu') // 'menu' | 'notice'
  const [date, setDate] = useState(today())
  const [menus, setMenus] = useState([])
  const [notices, setNotices] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [noticeLoading, setNoticeLoading] = useState(false)

  useEffect(() => {
    api.get(`/public/cafeterias/${id}`)
      .then(({ data }) => setCafeteria(data.data))
      .catch(() => {})
  }, [id])

  useEffect(() => {
    setMenuLoading(true)
    api.get(`/public/cafeterias/${id}/menus`, { params: { date } })
      .then(({ data }) => setMenus(data.data))
      .catch(() => setMenus([]))
      .finally(() => setMenuLoading(false))
  }, [id, date])

  useEffect(() => {
    if (tab !== 'notice') return
    setNoticeLoading(true)
    api.get(`/public/cafeterias/${id}/notices`)
      .then(({ data }) => setNotices(data.data))
      .catch(() => setNotices([]))
      .finally(() => setNoticeLoading(false))
  }, [id, tab])

  function changeDate(delta) {
    const d = new Date(date)
    d.setDate(d.getDate() + delta)
    setDate(d.toISOString().slice(0, 10))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-5 py-4 sticky top-0 z-10 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-700 transition text-xl leading-none"
        >
          ‹
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900">
            {cafeteria ? cafeteria.name : '식당'}
          </h1>
          {cafeteria?.address && (
            <p className="text-xs text-gray-400 mt-0.5">📍 {cafeteria.address}</p>
          )}
        </div>
        <button
          onClick={() => toggleFavorite(cafId)}
          className="text-2xl leading-none transition-transform active:scale-90"
          aria-label={isFavorite(cafId) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          {isFavorite(cafId) ? '❤️' : '🤍'}
        </button>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b sticky top-[65px] z-10">
        <div className="max-w-xl mx-auto flex">
          <button
            onClick={() => setTab('menu')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              tab === 'menu'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            메뉴
          </button>
          <button
            onClick={() => setTab('notice')}
            className={`flex-1 py-3 text-sm font-medium transition ${
              tab === 'notice'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            공지/이벤트
          </button>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 py-5">
        {/* 메뉴 탭 */}
        {tab === 'menu' && (
          <>
            {/* 날짜 네비게이션 */}
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => changeDate(-1)}
                className="w-9 h-9 rounded-full bg-white border flex items-center justify-center text-gray-500 hover:border-blue-400 transition"
              >
                ‹
              </button>
              <div className="text-center">
                <p className="font-semibold text-gray-800">{formatDate(date)}</p>
                <p className="text-xs text-gray-400">{date === today() ? '오늘' : date}</p>
              </div>
              <button
                onClick={() => changeDate(1)}
                className="w-9 h-9 rounded-full bg-white border flex items-center justify-center text-gray-500 hover:border-blue-400 transition"
              >
                ›
              </button>
            </div>

            {menuLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border h-32 animate-pulse" />
                ))}
              </div>
            ) : menus.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                <p className="text-4xl mb-3">🍽️</p>
                <p>이 날의 메뉴가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {MEAL_TYPES.map((mt) => {
                  const menu = menus.find((m) => m.mealType === mt.value)
                  if (!menu) return null
                  return (
                    <div key={mt.value} className="bg-white rounded-2xl border shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-xs font-semibold text-blue-500 uppercase">
                          {mt.label}
                        </p>
                        {menu.price && (
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 rounded-full px-2 py-0.5">
                            {menu.price.toLocaleString()}원
                          </span>
                        )}
                      </div>
                      <ul className="space-y-2">
                        {menu.items.map((item) => (
                          <li key={item.id} className="flex items-center justify-between">
                            <span
                              className={`text-sm ${
                                item.isMain
                                  ? 'font-semibold text-gray-900'
                                  : 'text-gray-600'
                              }`}
                            >
                              {item.isMain && (
                                <span className="text-blue-400 mr-1 text-xs">★</span>
                              )}
                              {item.name}
                            </span>
                            {item.calories && (
                              <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                                {item.calories}kcal
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* 공지/이벤트 탭 */}
        {tab === 'notice' && (
          <>
            {noticeLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border h-24 animate-pulse" />
                ))}
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center text-gray-400 py-16">
                <p className="text-4xl mb-3">📋</p>
                <p>등록된 공지/이벤트가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div key={notice.id} className="bg-white rounded-2xl border shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          notice.type === 'EVENT'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {TYPE_LABELS[notice.type]}
                      </span>
                      {notice.type === 'EVENT' && notice.startDate && (
                        <span className="text-xs text-gray-400">
                          {notice.startDate.slice(0, 10)}
                          {notice.endDate ? ` ~ ${notice.endDate.slice(0, 10)}` : ''}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-800 mb-1">{notice.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                      {notice.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
