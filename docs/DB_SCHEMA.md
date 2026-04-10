# DB 스키마 설계

## ERD 개요

```
Complex (단지)
  └── Cafeteria (식당)
        ├── Admin (관리자 계정)
        ├── Menu (메뉴 헤더: 날짜 + 식사유형)
        │     └── MenuItem (메뉴 항목)
        └── Notice (공지사항/이벤트)
```

---

## 테이블 상세

### Complex (단지)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int (PK) | 자동증가 |
| name | String | 단지명 (예: 구로디지털단지) |
| slug | String (unique) | URL용 슬러그 (예: guro) |
| createdAt | DateTime | 생성일시 |
| updatedAt | DateTime | 수정일시 |

---

### Cafeteria (식당)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int (PK) | 자동증가 |
| complexId | Int (FK) | 소속 단지 |
| name | String | 식당명 |
| description | String? | 설명 |
| address | String? | 주소 |
| phone | String? | 전화번호 |
| isActive | Boolean | 활성 여부 |
| createdAt | DateTime | 생성일시 |
| updatedAt | DateTime | 수정일시 |

---

### Admin (관리자)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int (PK) | 자동증가 |
| cafeteriaId | Int? (FK) | 관리 식당 (null = Super Admin) |
| username | String (unique) | 로그인 ID |
| password | String | bcrypt 해시 |
| role | Enum | SUPER_ADMIN / ADMIN |
| isActive | Boolean | 활성 여부 |
| createdAt | DateTime | 생성일시 |
| updatedAt | DateTime | 수정일시 |

---

### Menu (메뉴 헤더)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int (PK) | 자동증가 |
| cafeteriaId | Int (FK) | 소속 식당 |
| date | Date | 메뉴 날짜 |
| mealType | Enum | BREAKFAST / LUNCH / DINNER |
| isPublished | Boolean | 공개 여부 |
| createdAt | DateTime | 생성일시 |
| updatedAt | DateTime | 수정일시 |

> Unique: (cafeteriaId, date, mealType)

---

### MenuItem (메뉴 항목)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int (PK) | 자동증가 |
| menuId | Int (FK) | 소속 메뉴 |
| name | String | 메뉴명 |
| price | Int? | 가격 (원) |
| calories | Int? | 칼로리 (kcal) |
| isMain | Boolean | 주메뉴 여부 |
| order | Int | 정렬 순서 |
| createdAt | DateTime | 생성일시 |
| updatedAt | DateTime | 수정일시 |

---

### Notice (공지사항/이벤트)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | Int (PK) | 자동증가 |
| cafeteriaId | Int (FK) | 소속 식당 |
| title | String | 제목 |
| content | String | 내용 |
| type | Enum | NOTICE / EVENT |
| startDate | DateTime? | 이벤트 시작일 |
| endDate | DateTime? | 이벤트 종료일 |
| isPublished | Boolean | 공개 여부 |
| createdAt | DateTime | 생성일시 |
| updatedAt | DateTime | 수정일시 |

---

## Enum 정의

```
Role        : SUPER_ADMIN, ADMIN
MealType    : BREAKFAST, LUNCH, DINNER
NoticeType  : NOTICE, EVENT
```
