import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "서귀포대신중학교 협업 보드 (School Board)",
  description: "선생님과 학생이 함께 만드는 안전하고 편리한 학급 패들릿 공간",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-slate-50 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
