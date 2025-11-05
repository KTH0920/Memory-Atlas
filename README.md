# Memory-Atlas

위치 기반 추억 관리 웹 애플리케이션

## 프로젝트 소개

Memory-Atlas는 사용자의 소중한 추억을 위치와 함께 저장하고 지도에서 시각화할 수 있는 웹 애플리케이션입니다.

## 기술 스택

### Frontend
- React 19.1.1
- Vite 7.1.7
- React Router Dom 7.9.4
- Axios

### Backend
- Node.js + Express 5.1.0
- MongoDB + Mongoose 8.19.1
- JWT 인증
- AWS S3 (파일 저장)
- Bcrypt (비밀번호 암호화)

## 프로젝트 구조

```
Memory-Atlas/
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── api/           # API 클라이언트
│   │   └── assets/        # 정적 리소스
│   └── package.json
│
├── backend/           # Express 백엔드
│   ├── src/
│   │   ├── config/        # 설정 파일 (DB, S3)
│   │   ├── controllers/   # 비즈니스 로직
│   │   ├── middleware/    # 미들웨어 (인증, 에러 처리)
│   │   ├── models/        # MongoDB 모델
│   │   ├── routes/        # API 라우트
│   │   └── utils/         # 유틸리티 함수
│   └── package.json
│
└── README.md
```

## 주요 기능

- 사용자 인증 (회원가입/로그인)
- 추억 추가 및 관리
- 지도 기반 추억 시각화
- 이미지 업로드 (AWS S3)
- 관리자 대시보드

## 설치 및 실행

### 사전 요구사항
- Node.js (v18 이상)
- MongoDB
- AWS S3 계정 (선택사항)

### Backend 설정

```bash
cd backend
npm install
```

`backend/.env` 파일 설정:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_bucket_name
```

Backend 실행:
```bash
npm run dev
```

### Frontend 설정

```bash
cd frontend
npm install
```

`frontend/.env` 파일 설정:
```env
VITE_API_URL=http://localhost:5000
```

Frontend 실행:
```bash
npm run dev
```

## 개발

### Backend 개발
- `npm run dev` - Nodemon으로 개발 서버 실행

### Frontend 개발
- `npm run dev` - Vite 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run lint` - ESLint 실행

## 라이센스

ISC
