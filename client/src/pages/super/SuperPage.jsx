import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

const TABS = [
  { key: 'complexes', label: '단지 관리' },
  { key: 'cafeterias', label: '식당 관리' },
  { key: 'admins', label: '관리자 계정' },
]

// ── 공통 모달 ──────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}

// ── 단지 관리 탭 ───────────────────────────────────────
function ComplexTab() {
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await api.get('/super/complexes')
    setList(data.data)
  }

  function openAdd() {
    setEditing(null)
    setForm({ name: '', slug: '' })
    setShowForm(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({ name: item.name, slug: item.slug })
    setShowForm(true)
  }

  function close() {
    setShowForm(false)
    setEditing(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/super/complexes/${editing.id}`, form)
      } else {
        await api.post('/super/complexes', form)
      }
      close()
      load()
    } catch (err) {
      alert(err.response?.data?.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('단지를 삭제하면 소속 식당과 데이터가 모두 삭제됩니다. 계속할까요?')) return
    try {
      await api.delete(`/super/complexes/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.')
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + 단지 추가
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">ID</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">단지명</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">슬러그</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.length === 0 && (
              <tr><td colSpan={4} className="text-center text-gray-400 py-10">등록된 단지가 없습니다.</td></tr>
            )}
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-400">{item.id}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{item.name}</td>
                <td className="px-5 py-3 text-gray-500">{item.slug}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(item)} className="text-blue-400 hover:text-blue-600 mr-3">수정</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? '단지 수정' : '단지 추가'} onClose={close}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">단지명 *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 구로 디지털단지"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">슬러그 * <span className="text-gray-400 font-normal">(영문 소문자·하이픈)</span></label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="예: guro"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={close} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition">취소</button>
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium transition">
                {saving ? '저장 중...' : (editing ? '수정' : '추가')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ── 식당 관리 탭 ───────────────────────────────────────
function CafeteriaTab() {
  const [list, setList] = useState([])
  const [complexes, setComplexes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const EMPTY_FORM = { name: '', complexId: '', description: '', address: '', phone: '', isActive: true }
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [cafRes, cplRes] = await Promise.all([
      api.get('/super/cafeterias'),
      api.get('/super/complexes'),
    ])
    setList(cafRes.data.data)
    setComplexes(cplRes.data.data)
  }

  function openAdd() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, complexId: complexes[0]?.id ?? '' })
    setShowForm(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({
      name: item.name,
      complexId: item.complexId,
      description: item.description || '',
      address: item.address || '',
      phone: item.phone || '',
      isActive: item.isActive,
    })
    setShowForm(true)
  }

  function close() {
    setShowForm(false)
    setEditing(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, complexId: Number(form.complexId) }
      if (editing) {
        await api.put(`/super/cafeterias/${editing.id}`, payload)
      } else {
        await api.post('/super/cafeterias', payload)
      }
      close()
      load()
    } catch (err) {
      alert(err.response?.data?.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('식당을 삭제하면 관련 메뉴 데이터가 모두 삭제됩니다. 계속할까요?')) return
    try {
      await api.delete(`/super/cafeterias/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.')
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + 식당 추가
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">식당명</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">단지</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">주소</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">상태</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-400 py-10">등록된 식당이 없습니다.</td></tr>
            )}
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{item.name}</td>
                <td className="px-5 py-3 text-gray-500">{item.complex?.name ?? '-'}</td>
                <td className="px-5 py-3 text-gray-500">{item.address || '-'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {item.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(item)} className="text-blue-400 hover:text-blue-600 mr-3">수정</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? '식당 수정' : '식당 추가'} onClose={close}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">단지 *</label>
              <select
                required
                value={form.complexId}
                onChange={(e) => setForm({ ...form, complexId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">단지 선택</option>
                {complexes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">식당명 *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 구로1동 구내식당"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="예: 서울 구로구 디지털로 300"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="예: 02-1234-5678"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="짧은 소개 (선택)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              활성 식당
            </label>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={close} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition">취소</button>
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium transition">
                {saving ? '저장 중...' : (editing ? '수정' : '추가')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ── 관리자 계정 탭 ─────────────────────────────────────
function AdminTab() {
  const [list, setList] = useState([])
  const [cafeterias, setCafeterias] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const EMPTY_FORM = { username: '', password: '', role: 'ADMIN', cafeteriaId: '', isActive: true }
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const [admRes, cafRes] = await Promise.all([
      api.get('/super/admins'),
      api.get('/super/cafeterias'),
    ])
    setList(admRes.data.data)
    setCafeterias(cafRes.data.data)
  }

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({
      username: item.username,
      password: '',
      role: item.role,
      cafeteriaId: item.cafeteriaId ?? '',
      isActive: item.isActive,
    })
    setShowForm(true)
  }

  function close() {
    setShowForm(false)
    setEditing(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!editing && !form.password) return alert('비밀번호를 입력하세요.')
    setSaving(true)
    try {
      const payload = {
        username: form.username,
        role: form.role,
        cafeteriaId: form.role === 'ADMIN' && form.cafeteriaId ? Number(form.cafeteriaId) : null,
        isActive: form.isActive,
        ...(form.password ? { password: form.password } : {}),
      }
      if (editing) {
        await api.put(`/super/admins/${editing.id}`, payload)
      } else {
        await api.post('/super/admins', payload)
      }
      close()
      load()
    } catch (err) {
      alert(err.response?.data?.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('관리자 계정을 삭제할까요?')) return
    try {
      await api.delete(`/super/admins/${id}`)
      load()
    } catch (err) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.')
    }
  }

  function cafeteriaName(id) {
    return cafeterias.find((c) => c.id === id)?.name ?? '-'
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          + 계정 추가
        </button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">아이디</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">권한</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">담당 식당</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">상태</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-400 py-10">등록된 계정이 없습니다.</td></tr>
            )}
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{item.username}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.role === 'SUPER_ADMIN' ? '최고 관리자' : '식당 관리자'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{item.cafeteriaId ? cafeteriaName(item.cafeteriaId) : '-'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {item.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(item)} className="text-blue-400 hover:text-blue-600 mr-3">수정</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title={editing ? '계정 수정' : '계정 추가'} onClose={close}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">아이디 *</label>
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="로그인 아이디"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 {editing && <span className="text-gray-400 font-normal">(변경 시에만 입력)</span>}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? '변경할 비밀번호' : '비밀번호 *'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">권한</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value, cafeteriaId: '' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADMIN">식당 관리자</option>
                <option value="SUPER_ADMIN">최고 관리자</option>
              </select>
            </div>
            {form.role === 'ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당 식당 *</label>
                <select
                  required
                  value={form.cafeteriaId}
                  onChange={(e) => setForm({ ...form, cafeteriaId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">식당 선택</option>
                  {cafeterias.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.complex?.name})</option>)}
                </select>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              활성 계정
            </label>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={close} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition">취소</button>
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg text-sm font-medium transition">
                {saving ? '저장 중...' : (editing ? '수정' : '추가')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

// ── 메인 슈퍼어드민 페이지 ─────────────────────────────
export default function SuperPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('complexes')

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">StillHungry</h1>
          <p className="text-xs text-purple-600 font-medium">최고 관리자</p>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition">
          로그아웃
        </button>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 text-sm font-medium transition ${
                tab === t.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {tab === 'complexes'  && <ComplexTab />}
        {tab === 'cafeterias' && <CafeteriaTab />}
        {tab === 'admins'     && <AdminTab />}
      </main>
    </div>
  )
}
