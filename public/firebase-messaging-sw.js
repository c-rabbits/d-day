// 자동 생성됨. scripts/generate-firebase-sw.js 실행 시 갱신.
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({"apiKey":"AIzaSyCAhbPTQWBnRj7b7aphoLS1CMW4TDiD6So","projectId":"d-day-5b1b9","authDomain":"d-day-5b1b9.firebaseapp.com","messagingSenderId":"1071006119191","appId":"1:1071006119191:web:7508c58cf9a9809225b352"});
const messaging = firebase.messaging();

// 백그라운드에서 푸시 수신 시 (선택)
messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || "디데이";
  const options = { body: payload.notification?.body || "" };
  self.registration.showNotification(title, options);
});
