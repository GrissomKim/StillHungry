import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const TYPE_LABELS = { NOTICE: '공지', EVENT: '이벤트' }

const EMPTY_FORM = {
  title: '',
  content: '',
  type: 'NOTICE',
  startDate: '',
  endDate: '',
  isPublished: false,
}

export default function NoticePage() {
  const navigate = useNavigate()
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null) // null = 등록, id = 수정
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchNotices()
  }, [])

  async function fetchNotices() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/notices')
      setNotices(data.data)
    } catch {
      setNotices([])
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(notice) {
    setEditTarget(notice.id)
    setForm({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      startDate: notice.startDate ? notice.startDate.slice(0, 10) : '',
      endDate: notice.endDate ? notice.endDate.slice(0, 10) : '',
      isPublished: notice.isPublished,
    })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      }
      if (editTarget) {
        await api.put(`/admin/notices/${editTarget}`, payload)
      } else {
        await api.post('/admin/notices', payload)
      }
      setShowForm(false)
      fetchNotices()
    } catch (err) {
      alert(err.response?.data?.message || '저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  async function togglePublish(notice) {
    try {
      await api.put(`/admin/notices/${notice.id}`, { isPublished: !notice.isPublished })
      fetchNotices()
    } catch {
      alert('수정에 실패했습니다.')
    }
  }

  async function deleteNotice(id) {
    if (!confirm('삭제하시겠습니까?')) return
    try {
      await api.delete(`/admin/notices/${id}`)
      fetchNotices()
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
            <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-0.5">
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-700">공지/이벤트 관리</h2>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + 등록
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">불러오는 중...</p>
        ) : notices.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-4xl mb-3">📋</p>
            <p>등록된 공지/이벤트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-2xl border shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        notice.type === 'EVENT'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {TYPE_LABELS[notice.type]}
                      </span>
                      {notice.type === 'EVENT' && notice.startDate && (
                        <span className="text-xs text-gray-400">
                          {notice.startDate.slice(0, 10)}
                          {notice.endDate ? ` ~ ${notice.endDate.slice(0, 10)}` : ''}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-800 truncate">{notice.title}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notice.content}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => togglePublish(notice)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                        notice.isPublished
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {notice.isPublished ? '공개 중' : '비공개'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(notice)}
                        className="text-xs text-blue-500 hover:text-blue-700 transition"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 등록/수정 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">
              {editTarget ? '공지/이벤트 수정' : '공지/이벤트 등록'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">유형</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NOTICE">공지</option>
                  <option value="EVENT">이벤트</option>
                </select>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="제목을 입력하세요"
                  required
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="내용을 입력하세요"
                  required
                />
              </div>

              {/* 이벤트 기간 */}
              {form.type === 'EVENT' && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* 공개 여부 */}
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="rounded"
                />
                바로 공개
              </label>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  {submitting ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
