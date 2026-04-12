# StillHungry

구로디지털단지 & 가산디지털단지 구내식당 메뉴 통합 조회 서비스

---

## 빠른 시작

### 사전 요구사항

- Node.js 20+
- PostgreSQL 15+
- npm 10+

### 설치

```bash
# 저장소 클론
git clone <repo-url>
cd StillHungry

# 서버 의존성 설치
cd server && npm install

# 클라이언트 의존성 설치
cd ../client && npm install
```

### 환경 변수 설정

```bash
# server/.env 생성
cp server/.env.example server/.env
# .env 파일에서 DATABASE_URL, JWT_SECRET 등 설정
```

### DB 마이그레이션

```bash
cd server
npx prisma migrate dev
npx prisma db seed   # 초기 데이터 (단지, Super Admin 계정)
```

### 실행

```bash
# 서버 실행 (포트 4000)
cd server && npm run dev

# 클라이언트 실행 (포트 3000)
cd client && npm run dev
```

---

## 문서

| 문서 | 설명 |
|------|------|
| [OVERVIEW](docs/OVERVIEW.md) | 프로젝트 개요 및 기능 |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | 시스템 구조 및 기술 스택 |
| [DB_SCHEMA](docs/DB_SCHEMA.md) | 데이터베이스 스키마 |
| [API_SPEC](docs/API_SPEC.md) | API 명세 |
| [CHANGELOG](docs/CHANGELOG.md) | 개발 히스토리 |
| [AGENT_PLAN](docs/AGENT_PLAN.md) | Agent 자동화 계획 |

---

## 사용자 구분

- **Client**: 메뉴 조회 (로그인 불필요)
- **Admin**: 담당 식당 메뉴/공지 관리
- **Super Admin**: 전체 관리

---

## 향후 개발 계획

### 사용자 로그인 & 즐겨찾기

로그인 후 즐겨찾기한 식당들의 오늘 메뉴를 한 화면에서 바로 확인.

- `User` / `Favorite` 모델 추가
- 소셜 로그인 (카카오, 구글) 또는 이메일 가입
- 즐겨찾기 대시보드 — 등록한 식당들의 오늘 메뉴 카드 목록
- 비로그인 사용자는 기존 단지 탐색 화면 유지

### 메뉴 템플릿 기능

식당들이 동일한 메뉴를 순환해서 제공하는 경우가 많음.
매번 메뉴를 새로 입력하는 대신, 미리 등록해둔 메뉴를 선택해서 빠르게 등록할 수 있게 한다.

**데이터 모델**
- `MenuTemplate` — 식당/식사유형별 템플릿
- `MenuTemplateItem` — 템플릿에 속한 메뉴 항목 (이름, kcal, isMain)

**기능**
- 식당 설정 탭에서 템플릿 등록/수정/삭제
- 메뉴 등록 시 "템플릿에서 불러오기" → 선택하면 항목 자동 채움 (수동 편집 가능)

> 상세 내용: [doc/PLAN.md](doc/PLAN.md)
