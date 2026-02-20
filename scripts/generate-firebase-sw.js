/**
 * NEXT_PUBLIC_FIREBASE_* 값으로 public/firebase-messaging-sw.js 를 생성합니다.
 * - Vercel 빌드: process.env 에서 읽음 (배포 전 Vercel에 환경 변수 설정)
 * - 로컬: .env.local 에서 읽음
 * FCM 웹 푸시는 이 서비스 워커가 있어야 getToken()이 동작합니다.
 */

const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "public", "firebase-messaging-sw.js");

// 1) process.env (Vercel 빌드 시)
// 2) .env.local (로컬)
const env = {};
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  env.API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  env.PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  env.APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  env.AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  env.MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
} else {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.warn("[generate-firebase-sw] .env.local 없음. Firebase 설정 시 이 스크립트를 다시 실행하세요.");
    process.exit(0);
  }
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const m = trimmed.match(/^NEXT_PUBLIC_FIREBASE_(.+)=(.+)$/);
    if (m) env[m[1].trim()] = m[2].replace(/^["']|["']$/g, "").trim();
  });
}

const apiKey = env.API_KEY;
const projectId = env.PROJECT_ID;
const appId = env.APP_ID;
const authDomain = env.AUTH_DOMAIN || (projectId && `${projectId}.firebaseapp.com`);
const messagingSenderId = env.MESSAGING_SENDER_ID || projectId;

if (!apiKey || !projectId || !appId) {
  console.warn("[generate-firebase-sw] NEXT_PUBLIC_FIREBASE_API_KEY, PROJECT_ID, APP_ID 가 없어 스킵합니다.");
  process.exit(0);
}

const config = {
  apiKey,
  projectId,
  authDomain,
  messagingSenderId,
  appId,
};

const swContent = `// 자동 생성됨. scripts/generate-firebase-sw.js 실행 시 갱신.
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();

// 백그라운드에서 푸시 수신 시 (선택)
messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || "디데이";
  const options = { body: payload.notification?.body || "" };
  self.registration.showNotification(title, options);
});
`;

const publicDir = path.dirname(outPath);
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(outPath, swContent, "utf8");
console.log("public/firebase-messaging-sw.js 생성 완료.");
console.log("개발 서버를 재시작한 뒤 알림 켜기를 다시 시도하세요.");