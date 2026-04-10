# API 명세

## 기본 정보

- Base URL: `http://localhost:4000/api/v1`
- 인증: Bearer JWT Token (`Authorization: Bearer <token>`)
- 응답 형식: JSON

---

## 공통 응답 형식

```json
// 성공
{
  "success": true,
  "data": { ... }
}

// 실패
{
  "success": false,
  "message": "에러 메시지"
}
```

---

## 인증 (Auth)

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | `/auth/login` | 로그인 | 없음 |
| POST | `/auth/refresh` | 토큰 갱신 | 없음 |
| POST | `/auth/logout` | 로그아웃 | ADMIN+ |

---

## Public (Client용, 인증 불필요)

### 단지

| Method | Path | 설명 |
|--------|------|------|
| GET | `/public/complexes` | 단지 목록 |
| GET | `/public/complexes/:id/cafeterias` | 단지별 식당 목록 |

### 식당

| Method | Path | 설명 |
|--------|------|------|
| GET | `/public/cafeterias/:id` | 식당 상세 |
| GET | `/public/cafeterias/:id/menus` | 날짜별 메뉴 조회 (`?date=YYYY-MM-DD`) |
| GET | `/public/cafeterias/:id/notices` | 공지/이벤트 목록 |

---

## Admin (식당 관리자)

### 메뉴

| Method | Path | 설명 |
|--------|------|------|
| GET | `/admin/menus` | 내 식당 메뉴 목록 |
| POST | `/admin/menus` | 메뉴 등록 |
| PUT | `/admin/menus/:id` | 메뉴 수정 |
| DELETE | `/admin/menus/:id` | 메뉴 삭제 |
| POST | `/admin/menus/:id/items` | 메뉴 항목 추가 |
| PUT | `/admin/menus/:menuId/items/:itemId` | 메뉴 항목 수정 |
| DELETE | `/admin/menus/:menuId/items/:itemId` | 메뉴 항목 삭제 |

### 공지/이벤트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/admin/notices` | 내 식당 공지 목록 |
| POST | `/admin/notices` | 공지 등록 |
| PUT | `/admin/notices/:id` | 공지 수정 |
| DELETE | `/admin/notices/:id` | 공지 삭제 |

---

## Super Admin

### 단지

| Method | Path | 설명 |
|--------|------|------|
| GET | `/super/complexes` | 전체 단지 목록 |
| POST | `/super/complexes` | 단지 생성 |
| PUT | `/super/complexes/:id` | 단지 수정 |
| DELETE | `/super/complexes/:id` | 단지 삭제 |

### 식당

| Method | Path | 설명 |
|--------|------|------|
| GET | `/super/cafeterias` | 전체 식당 목록 |
| POST | `/super/cafeterias` | 식당 생성 |
| PUT | `/super/cafeterias/:id` | 식당 수정 |
| DELETE | `/super/cafeterias/:id` | 식당 삭제 |

### 관리자 계정

| Method | Path | 설명 |
|--------|------|------|
| GET | `/super/admins` | 전체 Admin 목록 |
| POST | `/super/admins` | Admin 계정 발급 |
| PUT | `/super/admins/:id` | Admin 수정 |
| DELETE | `/super/admins/:id` | Admin 삭제 |

### 메뉴 (전체)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/super/menus` | 전체 메뉴 조회 |
| PUT | `/super/menus/:id` | 모든 식당 메뉴 수정 |
| DELETE | `/super/menus/:id` | 모든 식당 메뉴 삭제 |
