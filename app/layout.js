import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "網站架設需求規格系統 | FracDigi",
  description: "一個動態表單系統，用來填寫和管理網站架設需求規格",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* 
          注意：這裡的 title 是靜態的初始標題
          動態標題會在客戶端通過 FormContext 的數據在頁面中更新
        */}
        <title>網站架設需求規格系統 | FracDigi</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-mono`}
      >
        {children}
      </body>
    </html>
  );
}
