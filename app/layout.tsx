import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
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
  themeColor: "hsl(210 55% 38%)",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        <PwaRegister />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense
            fallback={
              <div className="mx-auto min-h-screen w-full max-w-mobile bg-background" />
            }
          >
            <MuiProvider>
              <div className="mx-auto min-h-screen w-full max-w-mobile bg-background">
                {children}
              </div>
            </MuiProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
