# 개발 히스토리

## [0.3.0] - 2026-04-10

### Admin 메뉴 관리 UI 구축

- React + Vite + Tailwind CSS 클라이언트 초기 세팅 (port 3000)
- axios 인터셉터로 JWT 자동 갱신 처리
- 로그인 페이지 구현 (LoginPage)
- Admin 메뉴 관리 페이지 구현 (MenuPage)
  - 날짜별 메뉴 조회 (조식/중식/석식)
  - 메뉴 등록 모달 (항목명, 가격, 칼로리, 주메뉴 여부)
  - 공개/비공개 토글, 삭제
- 테스트용 시드 데이터 생성 (prisma/seed.js)
  - 구로디지털단지 / 테스트 구내식당
  - superadmin / testadmin 계정

---

## [0.2.0] - 2026-04-10

### DB 연결 및 서버 가동

- `.env` 파일 생성 (PostgreSQL 연결 정보 설정)
- Prisma 버전 7 → 5로 다운그레이드 (v7 breaking change 대응)
- `prisma generate` — Prisma Client 생성 완료
- `prisma migrate dev --name init` — DB 테이블 생성 완료 (`stillhungry` DB)
- `npm run dev` 서버 정상 실행 확인 (`http://localhost:4000`)

---

## [0.1.0] - 2026-04-10

### 프로젝트 초기 세팅

- 프로젝트 구조 설계 및 디렉토리 생성
- 기술 스택 확정: Node.js + Express, React + Vite, PostgreSQL, Prisma, JWT
- docs/ 문서 초안 작성 (OVERVIEW, ARCHITECTURE, DB_SCHEMA, API_SPEC, AGENT_PLAN)
- server/ 초기화: Express 기본 구조, Prisma 스키마
- client/ 초기화: React + Vite + Tailwind CSS
- Git 저장소 초기화 및 첫 커밋

### 확정된 서비스 구조
- Client: 단지별 식당 메뉴 조회 (조식/중식/석식), 공지/이벤트 확인
- Admin: 담당 식당 메뉴·공지 CRUD
- Super Admin: 전체 식당·계정 관리, Admin ID 발급

---

<!-- 새 버전은 위에 추가 -->
