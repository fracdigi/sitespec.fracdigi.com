'use client';

import { useState } from 'react';
import { useFormData } from './FormContext';
import JSZip from 'jszip';

const DataExporter = () => {
  const { pagesData, exportData, getPageHierarchy } = useFormData();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const handleExport = () => {
    setIsExportModalOpen(true);
  };
  
  const closeModal = () => {
    setIsExportModalOpen(false);
  };
  
  // 建立下載檔案
  const downloadJson = () => {
    const dataStr = exportData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `網站規格_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    closeModal();
  };
  
  // 建立並下載 ZIP 檔案
  const downloadZip = async () => {
    const zip = new JSZip();
    const pageHierarchy = getPageHierarchy();
    
    // 遍歷所有頁面數據並創建資料夾結構
    Object.entries(pageHierarchy).forEach(([path, pageData]) => {
      // 直接使用路徑做為資料夾結構
      // 對首頁特殊處理，放置在根目錄
      const folderPath = path === '/' ? '' : path;
      
      // 為每個頁面創建 README.md 檔案，包含所有欄位資訊
      const readmeContent = `# ${pageData.title || '無標題'}

## 文字內容
${pageData.textContent || '無文字內容'}

## 排版與樣式描述
${pageData.styleDescription || '無樣式描述'}

## 相關圖片
${pageData.files && pageData.files.length > 0 
  ? pageData.files.map(file => `- ${file.name}`).join('\n')
  : '無圖片素材'}`;
      
      // 對 README.md 路徑特殊處理
      // 如果是根路徑，直接放在根目錄下
      if (folderPath === '') {
        zip.file('readme.md', readmeContent);
      } else {
        zip.file(`${folderPath}/readme.md`, readmeContent);
      }

      // 如果有相關檔案，也加入到 ZIP 中
      if (pageData.files && pageData.files.length > 0) {
        pageData.files.forEach(file => {
          if (file instanceof File) {
            // 處理實際的 File 物件 (從 input type="file" 上傳)
            const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
            zip.file(filePath, file);
          } else if (typeof file === 'object' && file.name) {
            // 處理自定義格式的檔案物件
            const content = file.content || '';
            const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
            zip.file(filePath, content);
          }
        });
      }
    });
    
    // 生成 ZIP 檔案並下載
    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `網站需求_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 釋放 URL 物件
      URL.revokeObjectURL(url);
      
      closeModal();
    } catch (error) {
      console.error("ZIP 檔案生成失敗:", error);
      alert("匯出失敗，請再試一次");
    }
  };
  
  // 檢查是否有資料
  const hasData = Object.keys(pagesData).length > 0;
  
  return (
    <>
      <button
        onClick={handleExport}
        disabled={!hasData}
        className={`h-full px-4 py-2 flex items-center gap-2 rounded ${
          hasData 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        匯出需求
      </button>
      
      {isExportModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-4">匯出網站需求</h3>
            <div className="mb-4">
              <p className="mb-2">選擇您想要的匯出格式：</p>
              <div className="bg-gray-100 p-3 rounded max-h-60 overflow-auto text-xs">
                <p className="mb-2">預覽需求文件結構：</p>
                <ul className="space-y-1">
                  {Object.keys(getPageHierarchy())
                    .sort((a, b) => {
                      // 確保根路徑 '/' 排在最前面
                      if (a === '/') return -1;
                      if (b === '/') return 1;
                      return a.localeCompare(b);
                    })
                    .map((path, index) => {
                      const pageData = getPageHierarchy()[path];
                      const displayPath = path === '/' 
                        ? '/readme.md' 
                        : `${path}/readme.md`;
                      
                      return (
                        <li key={index} className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>
                            <span className="font-medium">{displayPath}</span>
                            <span className="text-gray-600"> - {pageData.title || '無標題'}</span>
                            {pageData.files && pageData.files.length > 0 && (
                              <span className="text-gray-500"> (含 {pageData.files.length} 個檔案)</span>
                            )}
                          </span>
                        </li>
                      );
                    })
                  }
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                取消
              </button>
              <button
                onClick={downloadJson}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                下載 JSON
              </button>
              <button
                onClick={downloadZip}
                className="px-4 py-2 bg-gray-800 text-white rounded"
              >
                下載 ZIP
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataExporter;