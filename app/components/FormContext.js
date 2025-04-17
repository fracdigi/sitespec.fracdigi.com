'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// 創建一個表單內容的上下文
const FormContext = createContext();

// 從 localStorage 加載數據的函數
const loadPagesDataFromStorage = () => {
  if (typeof window === 'undefined') return {};
  
  try {
    const savedData = localStorage.getItem('sitespec_pages_data');
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('從 localStorage 加載數據失敗:', error);
  }
  
  return {};
};

// 將數據保存到 localStorage 的函數
const savePagesDataToStorage = (data) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('sitespec_pages_data', JSON.stringify(data));
  } catch (error) {
    console.error('保存數據到 localStorage 失敗:', error);
  }
};

// 提供表單數據的 Provider 元件
export function FormProvider({ children }) {
  // 用來存儲所有頁面數據的狀態，初始值從 localStorage 加載
  const [pagesData, setPagesData] = useState({});
  
  // 組件掛載時從 localStorage 加載數據
  useEffect(() => {
    const savedData = loadPagesDataFromStorage();
    if (Object.keys(savedData).length > 0) {
      setPagesData(savedData);
      console.log('已從 localStorage 加載數據');
    }
  }, []);
  
  // 更新特定頁面的數據
  const updatePageData = (pageId, data) => {
    // 確保 pageId 不為空
    if (!pageId) {
      console.error('更新頁面數據失敗: pageId 不能為空');
      return;
    }
    
    // 使用函數式更新以確保始終基於最新狀態
    setPagesData(prev => {
      // 創建一個新的狀態物件
      const newData = { ...prev };
      // 更新指定頁面的數據
      newData[pageId] = { ...data };
      
      // 同步保存到本地存儲
      savePagesDataToStorage(newData);
      
      return newData;
    });
  };
  
  // 獲取所有頁面數據
  const getAllPagesData = () => {
    return pagesData;
  };
  
  // 將頁面 ID 轉換為路徑
  const getPathFromPageId = (pageId) => {
    // 處理根頁面 (main-1)
    if (pageId === 'main-1') {
      return '/';
    }
    
    // 處理主頁面
    if (pageId.startsWith('main-') && pageId !== 'main-1') {
      const pageData = pagesData[pageId];
      if (pageData && pageData.englishName) {
        return `/${pageData.englishName}`;
      }
      return '/';
    }
    
    // 處理子頁面：遞迴組合路徑
    const parts = pageId.split('-');
    let currentId = '';
    let pathComponents = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (i === 0) {
        currentId = 'main-' + parts[i];
        
        // 如果第一部分是根頁面，完全跳過
        if (currentId === 'main-1') {
          continue;
        }
      } else {
        currentId = currentId + '-' + parts[i];
      }
      
      const currentPageData = pagesData[currentId];
      if (currentPageData && currentPageData.englishName) {
        pathComponents.push(currentPageData.englishName);
      }
    }
    
    // 組合完整路徑，確保開頭有 /
    const path = pathComponents.length > 0 
      ? '/' + pathComponents.join('/')
      : '';
    
    return path || '/';
  };
  
  // 獲取階層式的頁面結構
  const getPageHierarchy = () => {
    const result = {};
    
    Object.keys(pagesData).forEach(pageId => {
      const path = getPathFromPageId(pageId);
      const pageData = pagesData[pageId];
      
      // 檢查路徑，如果有必要英文名稱但沒有設置，則跳過
      if (path === '/' && pageId.startsWith('main-') && pageId !== 'main-1') {
        // 對於子頁面，必須有有效的英文名稱
        if (!pageData.englishName) return;
      }
      
      // 特殊處理根頁面
      if (pageId === 'main-1') {
        result[path] = {
          ...pageData,
          title: '首頁',
          textContent: pageData.textContent || pageData.pageDescription || '', // 兼容舊格式
          styleDescription: pageData.styleDescription || '',
          id: pageId
        };
      } else {
        // 儲存頁面資料及路徑
        result[path] = {
          ...pageData,
          title: pageData.chineseName || '',
          textContent: pageData.textContent || pageData.pageDescription || '', // 兼容舊格式
          styleDescription: pageData.styleDescription || '',
          id: pageId
        };
      }
    });
    
    return result;
  };
  
  // 清除特定頁面的數據
  const clearPageData = (pageId) => {
    setPagesData(prev => {
      const newData = { ...prev };
      delete newData[pageId];
      
      // 同步保存到本地存儲
      savePagesDataToStorage(newData);
      
      return newData;
    });
  };
  
  // 清除所有頁面數據
  const clearAllData = () => {
    return new Promise(resolve => {
      // 直接設置為空物件，徹底清除所有數據
      setPagesData({});
      
      // 清除本地存儲中的數據
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sitespec_pages_data');
      }
      
      // 控制台記錄以便調試
      console.log('已清除所有頁面數據');
      
      // 確保狀態更新後再返回，額外添加 setTimeout 確保 React 更新完成
      setTimeout(() => {
        resolve();
      }, 50);
    });
  };
  
  // 導出為JSON字符串
  const exportData = () => {
    return JSON.stringify(pagesData, null, 2);
  };
  
  // 提供的上下文值
  const value = {
    pagesData,
    updatePageData,
    getAllPagesData,
    clearPageData,
    clearAllData,
    exportData,
    getPathFromPageId,
    getPageHierarchy
  };
  
  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

// 自定義 Hook 用於訪問表單內容
export function useFormData() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormProvider');
  }
  return context;
}