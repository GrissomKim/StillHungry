# Agent 운영 계획

## 개요

StillHungry 서비스를 자동화하기 위한 Agent 설계 계획.
Node.js 기반의 Agent들이 스케줄에 따라 동작하거나 이벤트에 반응하여 작업을 수행한다.

---

## 계획 중인 Agent 목록

### 1. Menu Crawler Agent
- **목적**: 등록되지 않은 식당의 메뉴를 자동 수집
- **동작**: 식당별 웹사이트 또는 SNS를 크롤링하여 메뉴 파싱 후 DB 저장
- **주기**: 매일 오전 7시
- **상태**: 계획 중

### 2. Notification Agent
- **목적**: 메뉴 업데이트 알림 발송
- **동작**: 새 메뉴 등록 시 구독자에게 알림 (이메일/슬랙/카카오 등)
- **트리거**: 메뉴 등록 이벤트
- **상태**: 계획 중

### 3. Menu Reminder Agent
- **목적**: Admin이 메뉴를 등록하지 않았을 때 리마인드
- **동작**: 당일 오전 9시 기준 메뉴 미등록 식당 Admin에게 알림
- **주기**: 매일 오전 9시
- **상태**: 계획 중

### 4. Data Cleanup Agent
- **목적**: 오래된 메뉴 데이터 정리
- **동작**: 설정 기간(예: 6개월) 이전 데이터 아카이브 또는 삭제
- **주기**: 매주 일요일 새벽 3시
- **상태**: 계획 중

### 5. Report Agent
- **목적**: 주간 통계 리포트 생성
- **동작**: 식당별 메뉴 등록률, 조회수 등 집계 후 Super Admin에게 보고
- **주기**: 매주 월요일 오전 8시
- **상태**: 계획 중

---

## Agent 아키텍처 (예정)

```
[ Scheduler (node-cron) ]
        │
        ▼
[ Agent Runner ]
        │
   ┌────┴────┐
   ▼         ▼
[Agent A] [Agent B] ...
   │
   ▼
[ DB / 외부 API / 알림 서비스 ]
```

---

## 기술 후보

| 항목 | 기술 |
|------|------|
| 스케줄링 | node-cron / bull (Redis 큐) |
| 크롤링 | Playwright / Cheerio |
| 알림 | Nodemailer / Slack API / 카카오 알림톡 |
| AI 연동 | Anthropic Claude API (메뉴 파싱, 자동 분류) |

---

## 노트

- Agent는 server/ 내의 별도 `agents/` 폴더로 관리 예정
- 각 Agent는 독립적으로 실행/중단 가능하도록 설계
- Claude API를 활용한 자연어 메뉴 파싱 실험 예정
