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
  title: "디데이 — 생활 계약 만료 알림",
  description: "내가 맺은 계약의 끝을 대신 기억해주는 앱",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "디데이" },
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
        {/* 구글 로그인 리다이렉트 직후 첫 로드에서 뷰포트가 늦게 적용되는 문제 방지 - 가능한 한 먼저 실행 */}
        <Script
          id="viewport-first-paint"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var m=document.querySelector('meta[name=viewport]');var c='width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover';if(m){m.setAttribute('content',c);}else{var e=document.createElement('meta');e.name='viewport';e.content=c;document.head.appendChild(e);}})();`,
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
