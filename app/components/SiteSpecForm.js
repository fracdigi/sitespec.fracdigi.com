'use client';

import { useState, useEffect } from 'react';
import PageContainer from './PageContainer';
import DataExporter from './DataExporter';
import TemplateSelector from './TemplateSelector';
import { FormProvider, useFormData } from './FormContext';

// 實際表單內容組件
const FormContent = () => {
  const { clearPageData, pagesData } = useFormData();
  // 固定只有一個主頁面
  const [mainPage] = useState({ id: 'main-1', level: 0, title: '網站結構' });
  
  // 全域控制展開狀態 - 用於同步所有層級
  const [expandedPageMap, setExpandedPageMap] = useState({
    'main-1': true // 主頁面預設展開
  });
  
  // 當 pagesData 發生變化時，自動展開所有頁面
  useEffect(() => {
    // 構建一個包含所有頁面 ID 的展開狀態 map
    const newExpandedMap = {};
    
    // 首先確保主頁面展開
    newExpandedMap['main-1'] = true;
    
    // 然後遍歷 pagesData 中的所有頁面 ID
    Object.keys(pagesData).forEach(pageId => {
      // 讓所有頁面預設為展開
      newExpandedMap[pageId] = true;
    });
    
    // 更新展開狀態 map
    setExpandedPageMap(newExpandedMap);
    
    console.log("頁面數據變更，已自動展開所有頁面");
  }, [pagesData]);
  
  // 由於只有一個主頁面，移除功能已不需要
  const handleRemoveMainPage = () => {
    // 空函數，保留以確保接口一致性
  };
  
  // 更新為全域頁面展開控制器
  const handleExpandPage = (pageId, parentId = null) => {
    setExpandedPageMap(prevState => {
      // 複製目前狀態
      const newState = { ...prevState };
      
      // 根據父頁面 ID 找出所有同級頁面
      const siblingPrefix = parentId ? `${parentId}-` : 'main-';
      
      // 將所有同級頁面設為收合
      Object.keys(newState).forEach(key => {
        if (key.startsWith(siblingPrefix) && key !== pageId) {
          newState[key] = false;
        }
      });
      
      // 切換目前頁面的展開狀態
      newState[pageId] = !prevState[pageId];
      
      return newState;
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 font-mono">
        網站架設需求規格文件
      </h1>
      <div className="max-w-3xl mx-auto">
        <PageContainer
          key={mainPage.id}
          id={mainPage.id}
          level={mainPage.level}
          title={mainPage.title}
          onRemove={handleRemoveMainPage}
          onExpandChild={(pageId) => handleExpandPage(pageId)}
          isExpanded={expandedPageMap[mainPage.id] || false}
          expandedPageMap={expandedPageMap}
          onToggleExpand={handleExpandPage}
        />
        
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex gap-4 items-stretch h-10">
            <TemplateSelector />
            <DataExporter />
          </div>
        </div>
      </div>
    </div>
  );
};

// 主表單組件包含 Context Provider
const SiteSpecForm = () => {
  return (
    <FormProvider>
      <FormContent />
    </FormProvider>
  );
};

export default SiteSpecForm;