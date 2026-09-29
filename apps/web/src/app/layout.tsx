import type { Metadata } from "next";
import { Archivo_Black } from "next/font/google";
import ThemeProvider from "@/components/providers/ThemeProvider";

/** 히어로 워드마크 전용 각진 디스플레이 서체. 본문 명조와 섞지 않는다. */
const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MINGLES — 블라인드 로테이션 데이트",
  description:
    "남녀 세 명씩 모이면 한 자리가 열립니다. 블라인드 대화 → 목소리 공개 → 얼굴 공개 순으로 돌아가며 이야기하고, 서로 골랐을 때만 채팅이 열립니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={display.variable}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
