import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import { MuiProvider } from "@/components/mui-provider";
import { PwaRegister } from "@/components/pwa-register";
import { Suspense } from "react";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "머니게임 — 세상의 모든 알림",
  description: "불필요한 지출을 줄여주는 구독 알림 앱",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "머니게임" },
};

export const viewport: Viewport = {
  themeColor: "hsl(0 0% 14%)",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${notoSansKR.variable} font-sans antialiased bg-background overscroll-none`} suppressHydrationWarning>
        {/* 구글 로그인 리다이렉트 직후 뷰포트 줌아웃 방지 + 새로고침 전 화면 숨김 */}
        <Script
          id="viewport-first-paint"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var c='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover';function fix(){var m=document.querySelector('meta[name=viewport]');if(m){m.setAttribute('content',c);}else{var e=document.createElement('meta');e.name='viewport';e.content=c;document.head.appendChild(e);}}fix();document.addEventListener('DOMContentLoaded',fix);window.addEventListener('pageshow',fix);if(location.search.indexOf('from=oauth')!==-1&&!sessionStorage.getItem('__viewport_reloaded')){document.documentElement.style.visibility='hidden';}})();`,
          }}
        />
        <PwaRegister />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Suspense
            fallback={
              <div className="mx-auto min-h-screen w-full sm:max-w-[430px] bg-background" />
            }
          >
            <MuiProvider>
              <div className="mx-auto min-h-screen w-full sm:max-w-[430px] overflow-x-hidden overflow-y-auto bg-background overscroll-none">
                {children}
              </div>
            </MuiProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
