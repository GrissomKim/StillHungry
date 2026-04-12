import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const MEAL_TYPES = [
  { value: 'BREAKFAST', label: '조식' },
  { value: 'LUNCH', label: '중식' },
  { value: 'DINNER', label: '석식' },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

const DEFAULT_PRICE_KEY = {
  BREAKFAST: 'defaultBreakfastPrice',
  LUNCH: 'defaultLunchPrice',
  DINNER: 'defaultDinnerPrice',
}

export default function MenuPage() {
  const navigate = useNavigate()
  const [date, setDate] = useState(today())
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(false)
  const [defaultPrices, setDefaultPrices] = useState({})
  const [categories, setCategories] = useState([])

  // 메뉴 등록/수정 폼
  const [showForm, setShowForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null) // null이면 등록, 값이 있으면 수정
  const [form, setForm] = useState({ mealType: 'LUNCH', price: '', image: null, isPublished: false, items: [] })
  const [newItem, setNewItem] = useState({ name: '', calories: '', isMain: false })
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMenus()
    api.get('/admin/cafeteria')
      .then(({ data }) => setDefaultPrices(data.data))
      .catch(() => {})
    api.get('/admin/categories')
      .then(({ data }) => setCategories(data.data))
      .catch(() => {})
  }, [date])

  async function fetchMenus() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/menus')
      const filtered = data.data.filter((m) => m.date.slice(0, 10) === date)
      setMenus(filtered)
    } catch {
      setMenus([])
    } finally {
      setLoading(false)
    }
  }

  function resizeAndEncodeImage(file) {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const MAX = 800
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX }
          else                { width  = Math.round(width  * MAX / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width  = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = url
    })
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await resizeAndEncodeImage(file)
    setForm((f) => ({ ...f, image: base64 }))
    setImagePreview(base64)
  }

  function removeImage() {
    setForm((f) => ({ ...f, image: null }))
    setImagePreview(null)
  }

  function addItem() {
    if (!newItem.name.trim()) return
    setForm((f) => ({
      ...f,
      items: [
        ...f.items,
        {
          name: newItem.name.trim(),
          calories: newItem.calories ? Number(newItem.calories) : null,
          isMain: newItem.isMain,
          order: f.items.length,
        },
      ],
    }))
    setNewItem({ name: '', calories: '', isMain: false })
  }

  function removeItem(idx) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }

  function closeForm() {
    setShowForm(false)
    setEditingMenu(null)
    setForm({ mealType: 'LUNCH', price: '', image: null, isPublished: false, items: [] })
    setImagePreview(null)
    setNewItem({ name: '', calories: '', isMain: false })
  }

  function openEditForm(menu) {
    setEditingMenu(menu)
    setForm({
      mealType: menu.mealType,
      price: menu.price != null ? String(menu.price) : '',
      image: menu.image || null,
      isPublished: menu.isPublished,
      items: menu.items.map((item) => ({
        id: item.id,
        name: item.name,
        calories: item.calories,
        isMain: item.isMain,
        order: item.order,
      })),
    })
    setImagePreview(menu.image || null)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.items.length === 0) return alert('메뉴 항목을 하나 이상 추가하세요.')
    setSubmitting(true)
    try {
      if (editingMenu) {
        // 수정: 메뉴 헤더 업데이트
        await api.put(`/admin/menus/${editingMenu.id}`, {
          mealType: form.mealType,
          price: form.price ? Number(form.price) : null,
          image: form.image,
          isPublished: form.isPublished,
        })
        // 기존 항목 전부 삭제
        for (const item of editingMenu.items) {
          await api.delete(`/admin/menus/${editingMenu.id}/items/${item.id}`)
        }
        // 새 항목 추가
        for (const item of form.items) {
          await api.post(`/admin/menus/${editingMenu.id}/items`, {
            name: item.name,
            calories: item.calories,
            isMain: item.isMain,
            order: item.order,
          })
        }
      } else {
        // 신규 등록
        await api.post('/admin/menus', { ...form, date, price: form.price ? Number(form.price) : null })
      }
      closeForm()
      fetchMenus()
    } catch (err) {
      alert(err.response?.data?.message || (editingMenu ? '수정에 실패했습니다.' : '등록에 실패했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function togglePublish(menu) {
    try {
      await api.put(`/admin/menus/${menu.id}`, { isPublished: !menu.isPublished })
      fetchMenus()
    } catch {
      alert('수정에 실패했습니다.')
    }
  }

  async function deleteMenu(id) {
    if (!confirm('메뉴를 삭제하시겠습니까?')) return
    try {
      await api.delete(`/admin/menus/${id}`)
      fetchMenus()
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
            <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-0.5">
              메뉴 관리
            </button>
            <button onClick={() => navigate('/admin/notices')} className="text-gray-500 hover:text-blue-600 transition">
              공지/이벤트
            </button>
            <button onClick={() => navigate('/admin/settings')} className="text-gray-500 hover:text-blue-600 transition">
              식당 설정
            </button>
          </nav>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition">
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* 날짜 선택 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              const defaultPrice = defaultPrices[DEFAULT_PRICE_KEY['LUNCH']] ?? ''
              setEditingMenu(null)
              setForm({ mealType: 'LUNCH', price: defaultPrice != null ? String(defaultPrice) : '', image: null, isPublished: false, items: [] })
              setImagePreview(null)
              setShowForm(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + 메뉴 등록
          </button>
        </div>

        {/* 메뉴 목록 */}
        {loading ? (
          <p className="text-center text-gray-400 py-12">불러오는 중...</p>
        ) : menus.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-4xl mb-3">🍽️</p>
            <p>등록된 메뉴가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {MEAL_TYPES.map((mt) => {
              const menu = menus.find((m) => m.mealType === mt.value)
              if (!menu) return null
              return (
                <div key={mt.value} className="bg-white rounded-2xl shadow-sm border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{mt.label}</span>
                      {menu.price && (
                        <span className="text-sm text-blue-600 font-medium">
                          {menu.price.toLocaleString()}원
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublish(menu)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                          menu.isPublished
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {menu.isPublished ? '공개 중' : '비공개'}
                      </button>
                      <button
                        onClick={() => openEditForm(menu)}
                        className="text-xs text-blue-400 hover:text-blue-600 transition"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => deleteMenu(menu.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  {menu.image && (
                    <img
                      src={menu.image}
                      alt="메뉴 사진"
                      className="w-full rounded-xl object-cover max-h-40 mb-3"
                    />
                  )}
                  <ul className="space-y-1">
                    {menu.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between text-sm">
                        <span className={item.isMain ? 'font-medium text-gray-800' : 'text-gray-600'}>
                          {item.isMain && <span className="text-blue-500 mr-1">★</span>}
                          {item.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {item.price ? `${item.price.toLocaleString()}원` : ''}
                          {item.price && item.calories ? ' · ' : ''}
                          {item.calories ? `${item.calories}kcal` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 메뉴 등록 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">{editingMenu ? '메뉴 수정' : '메뉴 등록'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 식사 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">식사 유형</label>
                <select
                  value={form.mealType}
                  disabled={!!editingMenu}
                  onChange={(e) => {
                    const mealType = e.target.value
                    const defaultPrice = defaultPrices[DEFAULT_PRICE_KEY[mealType]]
                    setForm({ ...form, mealType, price: defaultPrice != null ? String(defaultPrice) : '' })
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {MEAL_TYPES.map((mt) => (
                    <option key={mt.value} value={mt.value}>{mt.label}</option>
                  ))}
                </select>
              </div>

              {/* 가격 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
                <input
                  type="number"
                  placeholder="예: 5000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 대표 사진 (중식만) */}
              {form.mealType === 'LUNCH' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    대표 사진 <span className="text-gray-400 font-normal">(선택)</span>
                  </label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="미리보기"
                        className="w-full rounded-xl object-cover max-h-48"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-black/50 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/70 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition">
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-xs text-gray-400">사진을 선택하세요</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* 카테고리에서 선택 */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리에서 선택</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <div key={cat.id}>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{cat.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((item) => {
                            const already = form.items.some((i) => i.name === item.name)
                            return (
                              <button
                                key={item.id}
                                type="button"
                                disabled={already}
                                onClick={() => {
                                  if (already) return
                                  setForm((f) => ({
                                    ...f,
                                    items: [
                                      ...f.items,
                                      { name: item.name, calories: item.calories, isMain: item.isMain, order: f.items.length },
                                    ],
                                  }))
                                }}
                                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                                  already
                                    ? 'bg-blue-50 border-blue-300 text-blue-400 cursor-default'
                                    : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                                }`}
                              >
                                {item.isMain && <span className="mr-0.5">★</span>}
                                {item.name}
                                {already && ' ✓'}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 메뉴 항목 직접 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">직접 입력</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="메뉴명 *"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="kcal"
                      value={newItem.calories}
                      onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      type="button"
                      onClick={addItem}
                      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg transition"
                    >
                      추가
                    </button>
                  </div>
                </div>

                {/* 추가된 항목 목록 */}
                {form.items.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {form.items.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <span className={item.isMain ? 'font-medium' : ''}>
                          {item.isMain && <span className="text-blue-500 mr-1">★</span>}
                          {item.name}
                          {item.calories && <span className="text-gray-400 ml-1">{item.calories}kcal</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-red-400 hover:text-red-600 ml-2"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 공개 여부 */}
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="rounded"
                />
                등록 후 바로 공개
              </label>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  {submitting ? (editingMenu ? '수정 중...' : '등록 중...') : (editingMenu ? '수정' : '등록')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
