/**
 * Firebase 앱 초기화. NEXT_PUBLIC_FIREBASE_* 설정 시에만 사용.
 * FCM 푸시용.
 */
export function getFirebaseApp() {
  if (typeof window === "undefined") return null;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  if (!apiKey || !projectId || !appId) return null;
  return import("firebase/app").then(({ getApps, initializeApp }) => {
    const apps = getApps();
    if (apps.length > 0) return apps[0];
    return initializeApp({
      apiKey,
      projectId,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || projectId,
      appId,
    });
  });
}
