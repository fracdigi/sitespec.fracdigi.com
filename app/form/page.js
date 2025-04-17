'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

// 動態引入表單組件以避免 SSR 問題
const SiteSpecForm = dynamic(() => import('../components/SiteSpecForm'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
    </div>
  ),
});

export default function FormPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold">品數位網站規格系統</span>
          </Link>
          <nav>
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-900"
            >
              回到首頁
            </Link>
          </nav>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <SiteSpecForm />
      </div>
      
      <footer className="border-t border-gray-200 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} FracDigi</p>
        </div>
      </footer>
    </div>
  );
}