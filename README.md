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
