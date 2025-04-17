'use client';

import { useState, useEffect } from 'react';
import { useFormData } from './FormContext';
import { useRouter } from 'next/navigation';

const TemplateSelector = () => {
  const [templates, setTemplates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { updatePageData, clearAllData, pagesData } = useFormData();
  const router = useRouter();

  // 載入模板數據
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/templates.json');
        if (!response.ok) {
          throw new Error('無法載入模板數據');
        }
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('載入模板失敗:', error);
      }
    };

    loadTemplates();
  }, []);

  // 打開模板選擇對話框
  const openTemplateModal = () => {
    setIsModalOpen(true);
  };

  // 關閉模板選擇對話框
  const closeTemplateModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  // 選擇模板
  const handleSelectTemplate = (templateKey) => {
    setSelectedTemplate(templateKey);
  };

  // 應用選定的模板
  const applyTemplate = async () => {
    if (!selectedTemplate || !templates[selectedTemplate]) {
      return;
    }

    setIsLoading(true);

    try {
      // 先清除所有現有數據 (已改為異步函數)
      await clearAllData();

      // 應用選定模板中的頁面數據
      const templateData = templates[selectedTemplate];
      
      console.log(`開始套用「${templateData.name}」模板...`);
      console.log(`模板包含 ${templateData.pages.length} 個頁面`);
      
      // 為確保階層結構正確加載，先處理父頁面，再處理子頁面
      // 1. 按照 ID 長度排序，確保父頁面先處理
      const sortedPages = [...templateData.pages].sort((a, b) => 
        a.id.split('-').length - b.id.split('-').length
      );
      
      // 2. 逐一應用每個頁面的數據
      for (const page of sortedPages) {
        console.log(`更新頁面數據: ${page.id} (${page.chineseName})`);
        
        updatePageData(page.id, {
          chineseName: page.chineseName,
          englishName: page.englishName,
          textContent: page.textContent,
          styleDescription: page.styleDescription,
          files: []
        });
        
        // 在每個頁面更新後短暫延遲，確保狀態更新
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // 延遲確保數據更新完成
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 最後刷新頁面以完全重置組件狀態
      // 這是最可靠的方式，確保子頁面結構正確顯示
      console.log("模板套用完成，正在刷新頁面...");
      
      // 關閉模態窗
      setIsLoading(false);
      closeTemplateModal();
      
      // 提示用戶模板套用成功
      alert(`已成功套用「${templateData.name}」模板！`);
      
      // 不再刷新頁面，而是直接關閉模態窗口即可
      // 模板數據已經保存到本地存儲，即使頁面刷新也不會丟失
      
    } catch (error) {
      console.error("套用模板失敗:", error);
      setIsLoading(false);
      alert("套用模板失敗，請再試一次");
    }
  };

  return (
    <>
      <button
        onClick={openTemplateModal}
        className="h-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
        </svg>
        使用模板
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
            <h3 className="text-xl font-bold mb-4">選擇網站模板</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.keys(templates).map((key) => (
                <div 
                  key={key}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplate === key 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleSelectTemplate(key)}
                >
                  <h4 className="font-bold text-lg mb-2">{templates[key].name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{templates[key].description}</p>
                  <div className="text-xs text-gray-500">
                    包含 {templates[key].pages.length} 個頁面
                  </div>
                </div>
              ))}
            </div>

            {selectedTemplate && (
              <div className="mb-6 border-t border-b border-gray-200 py-4">
                <h4 className="font-bold mb-2">模板頁面結構：</h4>
                <ul className="text-sm space-y-1">
                  {templates[selectedTemplate].pages.map((page) => (
                    <li key={page.id} className="flex items-start">
                      <span className="mr-2">&bull;</span>
                      <span>
                        <span className="font-medium">{page.chineseName}</span> 
                        <span className="text-gray-500"> (/{page.englishName})</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeTemplateModal}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                取消
              </button>
              <button
                onClick={applyTemplate}
                disabled={!selectedTemplate || isLoading}
                className={`px-4 py-2 ${
                  !selectedTemplate || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } rounded flex items-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    套用中...
                  </>
                ) : (
                  <>
                    套用模板
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateSelector;