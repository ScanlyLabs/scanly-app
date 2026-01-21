# Scanly App

QR 코드 기반 디지털 명함 교환 앱

## 소개

이 앱은 [Scanly 백엔드](https://github.com/ScanlyLabs/scanly-back)의 API를 시연하기 위한 클라이언트 앱입니다.

## 주요 기능

- 디지털 명함 생성 및 수정
- QR 코드 스캔을 통한 명함 조회
- 명함첩 그룹 관리

## 기술 스택

- React Native (Expo)
- TypeScript
- Expo Router

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npx expo start
```

### 환경 변수

`.env` 파일 생성:

```
API_BASE_URL=http://localhost:8080
```

## 참고사항

프론트엔드 코드는 [Claude Code](https://claude.ai/download)를 활용하여 생성되었습니다.
