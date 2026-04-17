import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/client'
import { useFavorites } from '../../hooks/useFavorites'
import { useKakaoMap } from '../../hooks/useKakaoMap'

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: '조식' },
  { value: 'LUNCH', label: '중식' },
  { value: 'DINNER', label: '석식' },
]

const TYPE_LABELS = { NOTICE: '공지', EVENT: '이벤트' }
const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']

function today() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

// 해당 날짜가 속한 주의 월요일 반환
function getMondayOf(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return d.toISOString().slice(0, 10)
}

// 월요일부터 7일치 날짜 배열
function getWeekDates(mondayStr) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayStr)
    d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function addDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function formatWeekRange(mondayStr) {
  const mon = new Date(mondayStr)
  const sun = new Date(mondayStr)
  sun.setDate(mon.getDate() + 6)
  return `${mon.getMonth() + 1}월 ${mon.getDate()}일 ~ ${sun.getMonth() + 1}월 ${sun.getDate()}일`
}

export default function CafeteriaPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { toggleFavorite, isFavorite } = useFavorites()
  const cafId = Number(id)

  const [cafeteria, setCafeteria] = useState(null)
  const [tab, setTab] = useState('menu') // 'menu' | 'notice' | 'location'
  const [view, setView] = useState('day')  // 'day' | 'week'
  const [date, setDate] = useState(today())
  const [weekStart, setWeekStart] = useState(getMondayOf(today()))
  const [menus, setMenus] = useState([])
  const [weekMenus, setWeekMenus] = useState([])
  const [notices, setNotices] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [weekLoading, setWeekLoading] = useState(false)
  const [noticeLoading, setNoticeLoading] = useState(false)

  const mapContainerRef = useKakaoMap(
    cafeteria?.latitude ?? null,
    cafeteria?.longitude ?? null,
  )

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
    if (tab !== 'menu' || view !== 'week') return
    setWeekLoading(true)
    const from = weekStart
    const to = addDays(weekStart, 6)
    api.get(`/public/cafeterias/${id}/menus`, { params: { from, to } })
      .then(({ data }) => setWeekMenus(data.data))
      .catch(() => setWeekMenus([]))
      .finally(() => setWeekLoading(false))
  }, [id, tab, view, weekStart])

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
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-700 transition text-lg leading-none"
          aria-label="홈으로"
        >
          🏠
        </button>
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
          {cafeteria?.latitude != null && (
            <button
              onClick={() => setTab('location')}
              className={`flex-1 py-3 text-sm font-medium transition ${
                tab === 'location'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              위치
            </button>
          )}
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4 py-5">
        {/* 메뉴 탭 */}
        {tab === 'menu' && (
          <>
            {/* Day / Week 토글 */}
            <div className="flex justify-end mb-4">
              <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                {['day', 'week'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                      view === v ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {v === 'day' ? 'Day' : 'Week'}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 주간 뷰 ── */}
            {view === 'week' && (
              <>
                {/* 주 네비게이션 */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setWeekStart(addDays(weekStart, -7))}
                    className="w-9 h-9 rounded-full bg-white border flex items-center justify-center text-gray-500 hover:border-blue-400 transition"
                  >‹</button>
                  <span className="text-sm font-semibold text-gray-700">{formatWeekRange(weekStart)}</span>
                  <button
                    onClick={() => setWeekStart(addDays(weekStart, 7))}
                    className="w-9 h-9 rounded-full bg-white border flex items-center justify-center text-gray-500 hover:border-blue-400 transition"
                  >›</button>
                </div>

                {weekLoading ? (
                  <div className="space-y-3">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="bg-white rounded-2xl border h-24 animate-pulse" />
                    ))}
                  </div>
                ) : (() => {
                  const allDates = getWeekDates(weekStart)
                  const weekdays = allDates.slice(0, 5)
                  const weekend = allDates.slice(5)
                  const hasWeekendData = weekend.some((d) => weekMenus.some((m) => m.date.slice(0, 10) === d))
                  const displayDates = hasWeekendData ? allDates : weekdays

                  return (
                    <div className="space-y-3">
                      {displayDates.map((d) => {
                        const dayMenus = weekMenus.filter((m) => m.date.slice(0, 10) === d)
                        const jsDate = new Date(d)
                        const isToday = d === today()
                        const dayNum = jsDate.getDay()
                        const isSat = dayNum === 6
                        const isSun = dayNum === 0

                        return (
                          <div
                            key={d}
                            className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isToday ? 'border-blue-400 ring-1 ring-blue-400' : ''}`}
                          >
                            {/* 날짜 헤더 */}
                            <div className={`px-4 py-2 flex items-center gap-2 ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                              <span className={`text-sm font-bold ${isSat ? 'text-blue-500' : isSun ? 'text-red-500' : isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                                {DAY_KO[dayNum]} {jsDate.getDate()}
                              </span>
                              {isToday && <span className="text-xs bg-blue-500 text-white rounded-full px-2 py-0.5">오늘</span>}
                            </div>

                            {/* 메뉴 */}
                            <div className="px-4 py-3">
                              {dayMenus.length === 0 ? (
                                <p className="text-xs text-gray-300">등록된 메뉴 없음</p>
                              ) : (
                                <div className="space-y-1.5">
                                  {MEAL_TYPES.map((mt) => {
                                    const menu = dayMenus.find((m) => m.mealType === mt.value)
                                    if (!menu) return null
                                    const mainItems = menu.items.filter((i) => i.isMain)
                                    const sideItems = menu.items.filter((i) => !i.isMain)
                                    return (
                                      <div key={mt.value} className="flex items-start gap-2">
                                        <span className="text-xs font-semibold text-blue-500 w-6 shrink-0 pt-0.5">{mt.label}</span>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                          {mainItems.map((item, i) => (
                                            <span key={item.id} className="font-semibold text-gray-800">
                                              {i > 0 && ' · '}{item.name}
                                            </span>
                                          ))}
                                          {mainItems.length > 0 && sideItems.length > 0 && <span className="text-gray-300"> · </span>}
                                          {sideItems.map((item, i) => (
                                            <span key={item.id}>
                                              {i > 0 && <span className="text-gray-300"> · </span>}{item.name}
                                            </span>
                                          ))}
                                        </p>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </>
            )}

            {/* ── 일간 뷰 ── */}
            {view === 'day' && <>
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
                      {menu.image && (
                        <img
                          src={menu.image}
                          alt="메뉴 사진"
                          className="w-full rounded-xl object-cover max-h-48 mb-3"
                        />
                      )}
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
            </>}
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

        {/* 위치 탭 */}
        {tab === 'location' && (
          <div>
            <div
              ref={mapContainerRef}
              className="w-full rounded-2xl overflow-hidden border shadow-sm"
              style={{ height: '320px' }}
            />
            {cafeteria?.address && (
              <p className="text-sm text-gray-500 mt-3">
                📍 {cafeteria.address}
              </p>
            )}
            {cafeteria?.phone && (
              <p className="text-sm text-gray-500 mt-1">
                📞 {cafeteria.phone}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
