import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <main className="flex-grow container mx-auto px-6 py-12 flex flex-col items-center justify-center">
        <h1 className="text-xl font-bold mb-8">
          品數位網站規格系統
        </h1>
        
        <h1 className="text-3xl font-bold text-center mb-4">
          網站架設需求規格系統
        </h1>
        
        <p className="text-center max-w-lg mb-8 text-gray-600">
          這個系統可以幫助您填寫和管理網站架設需求規格表單。您可以記錄頁面詳情、上傳相關檔案並建立多層級的網站結構。
        </p>

        <Link
          href="/form"
          className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          開始填寫規格表單
        </Link>
      </main>
      
      <footer className="border-t border-gray-200 py-4">
        <div className="container mx-auto flex justify-center items-center gap-8">
          <Link
            href="/form"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <Image
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            填寫表單
          </Link>
          
          <span className="text-gray-400">|</span>
          
          <p className="text-gray-600">
            &copy; {new Date().getFullYear()} FracDigi
          </p>
        </div>
      </footer>
    </div>
  );
}
