# Litune

책의 분위기에 어울리는 음악을 찾아주는 웹앱.

책 바코드를 스캔하거나 제목을 검색하면 Claude가 소개글을 분석해 Spotify 플레이리스트와 트랙을 추천한다. 결과는 페이지 안에서 바로 재생 가능하다.

## 기능

- **바코드 스캔** — 카메라로 ISBN 바코드를 스캔해 책 인식
- **텍스트 검색** — 제목으로 책 검색
- **무드 분석** — Claude Haiku가 책 소개글에서 음악 분위기 키워드 추출
- **Spotify 플레이리스트** — 분위기 기반 플레이리스트 추천, 페이지 내 임베드 재생
- **트랙 추천** — Last.fm 태그 기반 트랙 목록, Spotify 임베드로 재생
- **재추천** — 같은 책으로 다른 키워드 조합의 새로운 음악 발견
- **URL 공유** — 결과가 DB에 캐싱되어 공유된 URL은 항상 동일한 결과 표시

## 스택

- **Frontend** — Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **AI** — Claude Haiku (Anthropic)
- **음악** — Spotify Web API, Last.fm API
- **책** — Naver 책 검색 API
- **DB** — Neon (서버리스 PostgreSQL)
- **바코드** — ZXing.js

## 시작하기

### 환경변수 설정

`.env.example`을 참고해 `.env` 파일을 생성한다.

```bash
cp .env.example .env
```

| 변수 | 발급처 |
|------|--------|
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | [Naver Developers](https://developers.naver.com/apps) |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | [Spotify Dashboard](https://developer.spotify.com/dashboard) |
| `LASTFM_API_KEY` | [Last.fm API](https://www.last.fm/api/account/create) |
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com) |
| `DATABASE_URL` | [Neon Console](https://console.neon.tech) |

### DB 초기화

Neon 콘솔 SQL 에디터에서 `src/lib/migrations/001_init.sql`을 실행한다.

### 실행

```bash
pnpm install
pnpm dev
```

