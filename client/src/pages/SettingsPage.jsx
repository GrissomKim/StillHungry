import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useKakaoMap, useKakaoGeocoder } from '../hooks/useKakaoMap'

const MEAL_FIELDS = [
  { key: 'defaultBreakfastPrice', label: '조식 기본 금액' },
  { key: 'defaultLunchPrice',    label: '중식 기본 금액' },
  { key: 'defaultDinnerPrice',   label: '석식 기본 금액' },
]

export default function SettingsPage() {
  const navigate = useNavigate()

  // 기본 금액
  const [priceForm, setPriceForm] = useState({
    defaultBreakfastPrice: '',
    defaultLunchPrice: '',
    defaultDinnerPrice: '',
  })
  const [priceLoading, setPriceLoading] = useState(true)
  const [priceSaving, setPriceSaving] = useState(false)
  const [priceSaved, setPriceSaved] = useState(false)

  // 위치
  const [locationForm, setLocationForm] = useState({ address: '', lat: null, lng: null })
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSaving, setLocationSaving] = useState(false)
  const [locationSaved, setLocationSaved] = useState(false)
  const [locationError, setLocationError] = useState('')
  const geocode = useKakaoGeocoder()
  const mapContainerRef = useKakaoMap(locationForm.lat, locationForm.lng)

  // 카테고리
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(true)
  const [newCatName, setNewCatName] = useState('')
  const [expandedCat, setExpandedCat] = useState(null)

  // 음식 항목 입력 (카테고리별)
  const [newItem, setNewItem] = useState({ name: '', calories: '', isMain: false })

  useEffect(() => {
    api.get('/admin/cafeteria')
      .then(({ data }) => {
        const c = data.data
        setPriceForm({
          defaultBreakfastPrice: c.defaultBreakfastPrice ?? '',
          defaultLunchPrice:     c.defaultLunchPrice ?? '',
          defaultDinnerPrice:    c.defaultDinnerPrice ?? '',
        })
        if (c.latitude != null && c.longitude != null) {
          setLocationForm({ address: c.address ?? '', lat: c.latitude, lng: c.longitude })
        }
      })
      .catch(() => {})
      .finally(() => setPriceLoading(false))

    fetchCategories()
  }, [])

  async function fetchCategories() {
    setCatLoading(true)
    try {
      const { data } = await api.get('/admin/categories')
      setCategories(data.data)
    } catch {
      setCategories([])
    } finally {
      setCatLoading(false)
    }
  }

  async function handleLocationSearch() {
    if (!locationQuery.trim()) return
    setLocationError('')
    if (!geocode) { setLocationError('카카오맵 SDK가 아직 로드되지 않았습니다.'); return }
    try {
      const result = await geocode(locationQuery.trim())
      setLocationForm({ address: result.roadAddress || result.jibunAddress, lat: result.lat, lng: result.lng })
    } catch {
      setLocationError('주소를 찾을 수 없습니다. 다시 확인해주세요.')
    }
  }

  async function handleLocationSave() {
    if (locationForm.lat == null || locationForm.lng == null) return
    setLocationSaving(true)
    setLocationSaved(false)
    try {
      await api.put('/admin/cafeteria', {
        latitude: locationForm.lat,
        longitude: locationForm.lng,
      })
      setLocationSaved(true)
      setTimeout(() => setLocationSaved(false), 2000)
    } catch (err) {
      alert(err.response?.data?.message || '저장에 실패했습니다.')
    } finally {
      setLocationSaving(false)
    }
  }

  async function handlePriceSubmit(e) {
    e.preventDefault()
    setPriceSaving(true)
    setPriceSaved(false)
    try {
      await api.put('/admin/cafeteria', {
        defaultBreakfastPrice: priceForm.defaultBreakfastPrice !== '' ? Number(priceForm.defaultBreakfastPrice) : null,
        defaultLunchPrice:     priceForm.defaultLunchPrice !== ''     ? Number(priceForm.defaultLunchPrice)     : null,
        defaultDinnerPrice:    priceForm.defaultDinnerPrice !== ''    ? Number(priceForm.defaultDinnerPrice)    : null,
      })
      setPriceSaved(true)
      setTimeout(() => setPriceSaved(false), 2000)
    } catch (err) {
      alert(err.response?.data?.message || '저장에 실패했습니다.')
    } finally {
      setPriceSaving(false)
    }
  }

  async function addCategory() {
    if (!newCatName.trim()) return
    try {
      const { data } = await api.post('/admin/categories', {
        name: newCatName.trim(),
        order: categories.length,
      })
      setCategories((prev) => [...prev, data.data])
      setNewCatName('')
    } catch (err) {
      alert(err.response?.data?.message || '등록에 실패했습니다.')
    }
  }

  async function deleteCategory(id) {
    if (!confirm('카테고리와 하위 음식 항목이 모두 삭제됩니다. 계속하시겠습니까?')) return
    try {
      await api.delete(`/admin/categories/${id}`)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      if (expandedCat === id) setExpandedCat(null)
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  async function addItem(categoryId) {
    if (!newItem.name.trim()) return
    try {
      const { data } = await api.post(`/admin/categories/${categoryId}/items`, {
        name: newItem.name.trim(),
        calories: newItem.calories ? Number(newItem.calories) : null,
        isMain: newItem.isMain,
        order: categories.find((c) => c.id === categoryId)?.items.length ?? 0,
      })
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, items: [...c.items, data.data] } : c
        )
      )
      setNewItem({ name: '', calories: '', isMain: false })
    } catch (err) {
      alert(err.response?.data?.message || '등록에 실패했습니다.')
    }
  }

  async function deleteItem(categoryId, itemId) {
    try {
      await api.delete(`/admin/categories/${categoryId}/items/${itemId}`)
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c
        )
      )
    } catch {
      alert('삭제에 실패했습니다.')
    }
  }

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">StillHungry 관리자</h1>
        <div className="flex items-center gap-4">
          <nav className="flex gap-3 text-sm">
            <button onClick={() => navigate('/admin/menus')} className="text-gray-500 hover:text-blue-600 transition">
              메뉴 관리
            </button>
            <button onClick={() => navigate('/admin/notices')} className="text-gray-500 hover:text-blue-600 transition">
              공지/이벤트
            </button>
            <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-0.5">
              식당 설정
            </button>
          </nav>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition">
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-10">

        {/* 기본 금액 설정 */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-1">기본 금액 설정</h2>
          <p className="text-sm text-gray-400 mb-4">메뉴 등록 시 식사 유형에 맞는 기본 금액이 자동으로 입력됩니다.</p>

          {priceLoading ? (
            <div className="bg-white rounded-2xl border h-32 animate-pulse" />
          ) : (
            <form onSubmit={handlePriceSubmit}>
              <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
                {MEAL_FIELDS.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-4">
                    <label className="w-32 text-sm font-medium text-gray-700 shrink-0">{label}</label>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="미설정"
                        value={priceForm[key]}
                        onChange={(e) => setPriceForm({ ...priceForm, [key]: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-400 shrink-0">원</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={priceSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-6 py-2 rounded-lg transition"
                >
                  {priceSaving ? '저장 중...' : '저장'}
                </button>
                {priceSaved && <span className="text-sm text-green-600 font-medium">저장되었습니다.</span>}
              </div>
            </form>
          )}
        </section>

        {/* 식당 위치 설정 */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-1">식당 위치</h2>
          <p className="text-sm text-gray-400 mb-4">주소를 검색하면 지도에 핀이 표시됩니다.</p>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="주소 검색 (예: 가산디지털단지역)"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLocationSearch())}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLocationSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shrink-0"
            >
              검색
            </button>
          </div>

          {locationError && (
            <p className="text-xs text-red-500 mb-2">{locationError}</p>
          )}

          {locationForm.lat != null ? (
            <>
              <div
                ref={mapContainerRef}
                className="w-full rounded-xl overflow-hidden border mb-3"
                style={{ height: '220px' }}
              />
              <p className="text-xs text-gray-500 mb-3">
                📍 {locationForm.address || `${locationForm.lat}, ${locationForm.lng}`}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLocationSave}
                  disabled={locationSaving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-6 py-2 rounded-lg transition"
                >
                  {locationSaving ? '저장 중...' : '위치 저장'}
                </button>
                {locationSaved && <span className="text-sm text-green-600 font-medium">저장되었습니다.</span>}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border h-[220px] flex items-center justify-center text-gray-300 text-sm">
              주소를 검색하면 지도가 표시됩니다
            </div>
          )}
        </section>

        {/* 카테고리 & 음식 관리 */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-1">카테고리 & 음식 관리</h2>
          <p className="text-sm text-gray-400 mb-4">카테고리별 음식을 등록하면 메뉴 등록 시 빠르게 선택할 수 있습니다.</p>

          {/* 카테고리 추가 */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="카테고리 이름 (예: 밥류, 국/찌개)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shrink-0"
            >
              + 추가
            </button>
          </div>

          {catLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl border h-14 animate-pulse" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center text-gray-400 py-10 bg-white rounded-2xl border">
              <p className="text-3xl mb-2">🗂️</p>
              <p className="text-sm">등록된 카테고리가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  {/* 카테고리 헤더 */}
                  <div
                    className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => {
                      setExpandedCat(expandedCat === cat.id ? null : cat.id)
                      setNewItem({ name: '', calories: '', isMain: false })
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{cat.name}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                        {cat.items.length}개
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id) }}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        삭제
                      </button>
                      <span className={`text-gray-400 transition-transform ${expandedCat === cat.id ? 'rotate-90' : ''}`}>›</span>
                    </div>
                  </div>

                  {/* 펼쳐진 경우: 음식 목록 + 추가 */}
                  {expandedCat === cat.id && (
                    <div className="border-t px-5 py-4 space-y-3">
                      {/* 기존 음식 목록 */}
                      {cat.items.length > 0 && (
                        <ul className="space-y-1 mb-3">
                          {cat.items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between text-sm py-1">
                              <span className={item.isMain ? 'font-medium text-gray-800' : 'text-gray-600'}>
                                {item.isMain && <span className="text-blue-400 mr-1 text-xs">★</span>}
                                {item.name}
                                {item.calories && <span className="text-gray-400 ml-2 text-xs">{item.calories}kcal</span>}
                              </span>
                              <button
                                onClick={() => deleteItem(cat.id, item.id)}
                                className="text-red-400 hover:text-red-600 transition ml-2 text-xs"
                              >
                                삭제
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* 음식 항목 추가 */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="음식 이름 *"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(cat.id))}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="kcal"
                          value={newItem.calories}
                          onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
                          className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newItem.isMain}
                            onChange={(e) => setNewItem({ ...newItem, isMain: e.target.checked })}
                            className="rounded"
                          />
                          주메뉴
                        </label>
                        <button
                          onClick={() => addItem(cat.id)}
                          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg transition"
                        >
                          + 음식 추가
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
