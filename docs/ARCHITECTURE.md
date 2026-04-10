# 시스템 아키텍처

## 전체 구조

```
[ Client Browser ]
        │
        ▼
[ React + Vite (client/) ]
        │  REST API
        ▼
[ Express.js (server/) ]
        │
        ▼
[ Prisma ORM ]
        │
        ▼
[ PostgreSQL DB ]
```

---

## Tech Stack

| 계층 | 기술 | 버전 |
|------|------|------|
| Frontend | React + Vite | React 18, Vite 5 |
| Backend | Node.js + Express | Node 20+, Express 4 |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 15+ |
| 인증 | JWT (Access + Refresh Token) | - |
| 컨테이너 | Docker + Docker Compose | - |
| 스타일 | Tailwind CSS | 3.x |

---

## 폴더 구조

```
StillHungry/
├── docs/                     # 프로젝트 문서
│   ├── OVERVIEW.md
│   ├── ARCHITECTURE.md
│   ├── DB_SCHEMA.md
│   ├── API_SPEC.md
│   ├── CHANGELOG.md
│   └── AGENT_PLAN.md
│
├── server/                   # Backend
│   ├── src/
│   │   ├── routes/           # 라우터 (엔드포인트 정의)
│   │   ├── controllers/      # 요청 처리 로직
│   │   ├── services/         # 비즈니스 로직
│   │   ├── middleware/       # 인증, 에러핸들링 등
│   │   └── utils/            # 공통 유틸
│   ├── prisma/
│   │   └── schema.prisma     # DB 스키마
│   ├── .env
│   └── package.json
│
├── client/                   # Frontend
│   ├── src/
│   │   ├── pages/            # 페이지 컴포넌트
│   │   ├── components/       # 공통 컴포넌트
│   │   ├── hooks/            # 커스텀 훅
│   │   └── api/              # API 호출 함수
│   └── package.json
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 인증 흐름

```
[로그인 요청] → [서버 검증] → [Access Token (15m) + Refresh Token (7d) 발급]
                                          │
[API 요청] → [Access Token 검증] ─────── ┘
                    │
              [만료 시] → [Refresh Token으로 재발급]
```

### 권한 체계

| Role | 접근 범위 |
|------|----------|
| SUPER_ADMIN | 전체 |
| ADMIN | 자기 cafeteria_id에 해당하는 데이터만 |

---

## API 구조 (prefix)

| prefix | 대상 |
|--------|------|
| `/api/v1/public/` | Client (인증 불필요) |
| `/api/v1/admin/` | Admin (JWT 필요, ADMIN 이상) |
| `/api/v1/super/` | Super Admin (JWT 필요, SUPER_ADMIN만) |
