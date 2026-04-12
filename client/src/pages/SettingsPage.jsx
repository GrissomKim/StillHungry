import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const MEAL_FIELDS = [
  { key: 'defaultBreakfastPrice', label: '조식 기본 금액' },
  { key: 'defaultLunchPrice',    label: '중식 기본 금액' },
  { key: 'defaultDinnerPrice',   label: '석식 기본 금액' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    defaultBreakfastPrice: '',
    defaultLunchPrice: '',
    defaultDinnerPrice: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/admin/cafeteria')
      .then(({ data }) => {
        const c = data.data
        setForm({
          defaultBreakfastPrice: c.defaultBreakfastPrice ?? '',
          defaultLunchPrice:     c.defaultLunchPrice ?? '',
          defaultDinnerPrice:    c.defaultDinnerPrice ?? '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await api.put('/admin/cafeteria', {
        defaultBreakfastPrice: form.defaultBreakfastPrice !== '' ? Number(form.defaultBreakfastPrice) : null,
        defaultLunchPrice:     form.defaultLunchPrice !== ''     ? Number(form.defaultLunchPrice)     : null,
        defaultDinnerPrice:    form.defaultDinnerPrice !== ''    ? Number(form.defaultDinnerPrice)    : null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(err.response?.data?.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
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

      <main className="max-w-xl mx-auto px-4 py-8">
        <h2 className="text-base font-semibold text-gray-700 mb-6">기본 금액 설정</h2>
        <p className="text-sm text-gray-400 mb-6 -mt-4">
          메뉴 등록 시 식사 유형에 맞는 기본 금액이 자동으로 입력됩니다.
        </p>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border h-16 animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
              {MEAL_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-4">
                  <label className="w-32 text-sm font-medium text-gray-700 shrink-0">{label}</label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="미설정"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-400 shrink-0">원</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-6 py-2 rounded-lg transition"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              {saved && (
                <span className="text-sm text-green-600 font-medium">저장되었습니다.</span>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
