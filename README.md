# AI 에이전트 플랫폼 (VEO3 비디오 생성)

Discord 스타일의 UI를 가진 n8n 워크플로우 통합 플랫폼입니다. Google의 VEO3 AI 모델을 사용하여 텍스트 프롬프트로부터 고품질 비디오를 생성합니다.

## 주요 기능

- 🎬 **VEO3 비디오 생성**: 텍스트 프롬프트로 AI 비디오 생성
- 💬 **실시간 채팅 인터페이스**: Discord 스타일의 직관적인 UI
- � **n8en 워크플로우 통합**: 복잡한 AI 워크플로우 자동화
- 📊 **실행 이력 관리**: 모든 생성 작업의 이력 추적
- 🎯 **에이전트 관리**: 여러 AI 에이전트 동시 관리
- 🌙 **다크/라이트 모드**: 사용자 선호도에 따른 테마 지원

## 기술 스택

### 프론트엔드
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **shadcn/ui**: 고품질 UI 컴포넌트
- **Zustand**: 상태 관리
- **next-themes**: 테마 관리

### 백엔드
- **Next.js API Routes**: 서버리스 API
- **n8n**: 워크플로우 자동화 엔진
- **Docker Compose**: 컨테이너 오케스트레이션

### 외부 서비스
- **Google Vertex AI**: VEO3 비디오 생성 API
- **Google Gemini**: 프롬프트 생성 AI

## 설치 및 실행

### 필수 요구사항

- Node.js 18+
- Docker & Docker Compose
- Google Cloud 계정 (VEO3 API 사용 시)

### 1단계: 저장소 클론

```bash
git clone <repository-url>
cd veo3
```

### 2단계: 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 수정:

```bash
# n8n 설정
N8N_BASE_URL=http://localhost:5678
NEXT_PUBLIC_N8N_BASE_URL=http://localhost:5678

# 애플리케이션 설정
NEXT_PUBLIC_APP_NAME="AI Agent Platform"
NEXT_PUBLIC_MAX_EXECUTION_TIME=300000
```

### 3단계: Docker로 n8n 시작

```bash
# n8n 컨테이너 시작
docker-compose -f docker-compose.simple.yml up -d

# ngrok으로 HTTPS 터널 추가 (선택사항)
docker-compose -f docker-compose.simple.yml --profile ngrok up -d
```

n8n 접속: http://localhost:5678

### 4단계: n8n 워크플로우 설정

1. n8n에서 "Import from File" 클릭
2. `workflow.json` 파일 선택
3. 워크플로우 활성화 (Active 토글)

### 5단계: Next.js 개발 서버 시작

```bash
npm install
npm run dev
```

앱 접속: http://localhost:3000

## 사용 방법

### 비디오 생성

1. **앱 접속**: http://localhost:3000
2. **에이전트 선택**: 왼쪽 사이드바에서 "VEO3 Video Generator" 선택
3. **프롬프트 입력**: 생성하고 싶은 비디오 설명 입력
4. **생성 시작**: 엔터 키 또는 전송 버튼 클릭
5. **대기**: 3-5분 소요 (자동 폴링으로 완료 시 표시)
6. **다운로드**: 생성된 비디오 다운로드 또는 재생

### 실행 이력 확인

- 오른쪽 패널에서 생성된 모든 비디오의 이력 확인
- 각 실행의 상태, 시간, 프롬프트 정보 표시

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 앱 (3000)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │  프론트엔드: React + TypeScript + Tailwind CSS   │   │
│  │  - 채팅 인터페이스                               │   │
│  │  - 실행 이력 관리                                │   │
│  │  - 테마 관리                                     │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  백엔드: Next.js API Routes                      │   │
│  │  - /api/webhook/* : n8n 웹훅 프록시             │   │
│  │  - /api/poll-execution : 실행 결과 폴링         │   │
│  │  - /api/health : 헬스 체크                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│              n8n 워크플로우 엔진 (5678)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Webhook → Gemini AI → VEO3 API → 비디오 생성   │   │
│  │  - 프롬프트 생성                                 │   │
│  │  - 비디오 생성                                   │   │
│  │  - 파일 변환                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────┐
│           Google Cloud Vertex AI (외부)                  │
│  - VEO3 비디오 생성 API                                 │
│  - Gemini 프롬프트 생성 API                             │
└─────────────────────────────────────────────────────────┘
```

## 워크플로우 구조

```
Webhook (POST /webhook/veo3-video-generate)
  ↓
Ideas & Prompt AI Agent (Gemini로 프롬프트 개선)
  ↓
Setting (API 설정 및 변수 준비)
  ↓
Vertex AI VEO3 (비디오 생성 API 호출)
  ↓
Wait (작업 완료 대기)
  ↓
Vertex AI fetch (생성 결과 조회)
  ↓
Convert to File (비디오 파일로 변환)
```

## 개발 가이드

### 프로젝트 구조

```
veo3/
├── app/                          # Next.js 앱 디렉토리
│   ├── api/                      # API 라우트
│   │   ├── webhook/              # n8n 웹훅 프록시
│   │   ├── poll-execution/       # 실행 결과 폴링
│   │   └── health/               # 헬스 체크
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지
├── components/                   # React 컴포넌트
│   ├── chat/                     # 채팅 관련 컴포넌트
│   ├── layout/                   # 레이아웃 컴포넌트
│   ├── agents/                   # 에이전트 컴포넌트
│   └── ui/                       # shadcn/ui 컴포넌트
├── lib/                          # 유틸리티 및 서비스
│   ├── api/                      # API 클라이언트
│   ├── store/                    # Zustand 스토어
│   ├── agents/                   # 에이전트 설정
│   └── utils/                    # 유틸리티 함수
├── public/                       # 정적 파일
├── docker-compose.yml            # Docker 설정
├── workflow.json                 # n8n 워크플로우
└── README.md                     # 이 파일
```

### 주요 파일 설명

- **`lib/api/execution-service.ts`**: 에이전트 실행 로직
- **`lib/api/webhook-client.ts`**: n8n 웹훅 클라이언트
- **`lib/store/agent-store.ts`**: 에이전트 상태 관리
- **`lib/store/ui-store.ts`**: UI 상태 관리
- **`components/chat/ChatContainer.tsx`**: 메인 채팅 인터페이스

## 문제 해결

### n8n 웹훅 404 에러

**문제**: "Webhook not found" 에러

**해결**:
1. n8n에서 워크플로우가 활성화되어 있는지 확인
2. 웹훅 경로가 `veo3-video-generate`인지 확인
3. HTTP 메서드가 `POST`로 설정되어 있는지 확인

```bash
# 테스트
./scripts/check-n8n.sh
```

### 비디오 생성 시간 초과

**문제**: 10분 이상 대기해도 비디오가 생성되지 않음

**해결**:
1. n8n Executions 탭에서 실행 로그 확인
2. Google Cloud 인증 토큰 만료 확인
3. VEO3 API 할당량 확인

## 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### Docker 배포

```bash
# 이미지 빌드
docker build -t veo3-app .

# 컨테이너 실행
docker run -p 3000:3000 veo3-app
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `N8N_BASE_URL` | n8n 서버 URL (서버 사이드) | `http://localhost:5678` |
| `NEXT_PUBLIC_N8N_BASE_URL` | n8n 서버 URL (클라이언트 사이드) | `http://localhost:5678` |
| `NEXT_PUBLIC_APP_NAME` | 앱 이름 | `AI Agent Platform` |
| `NEXT_PUBLIC_MAX_EXECUTION_TIME` | 최대 실행 시간 (ms) | `300000` |

## 성능 최적화

- ✅ 이미지 최적화 (Next.js Image)
- ✅ 코드 분할 (Dynamic Import)
- ✅ 상태 관리 최적화 (Zustand)
- ✅ 폴링 간격 최적화 (10초)

## 보안

- ✅ 환경 변수 보호
- ✅ API 프록시로 CORS 처리
- ✅ 입력 검증
- ✅ 에러 메시지 최소화

## 참고 및 출처

이 프로젝트는 **패스트캠퍼스 대모산개발단 오픈세미나** 강의를 참고하여 제작되었습니다.

- 강의: 패스트캠퍼스 대모산개발단 오픈세미나
- 주제: 콘텐츠 자동화 + 바이브코딩 (feat. Veo3로 만든 AI 영상)
- 기술: Next.js, n8n, Google Vertex AI

## 라이선스

MIT

## 기여

버그 리포트 및 기능 제안은 이슈를 통해 제출해주세요.

## 지원

문제가 발생하면:

1. **로그 확인**: 브라우저 콘솔 및 n8n 실행 로그
2. **문제 해결 가이드**: `TROUBLESHOOTING.md` 참고
3. **Docker 설정**: `DOCKER-SETUP.md` 참고

## 변경 이력

### v1.0.0 (2025-11-02)
- 초기 릴리스
- VEO3 비디오 생성 기능
- n8n 워크플로우 통합
- Discord 스타일 UI
- 실시간 폴링 시스템
