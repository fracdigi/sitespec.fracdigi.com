'use client';

import { useEffect, useRef } from 'react';
import { useFormData } from './FormContext';

const DynamicPageTitle = ({ pageId, baseTitle = '網站架設需求規格系統 | FracDigi' }) => {
  const { pagesData } = useFormData();
  const prevTitleRef = useRef(baseTitle);
  
  useEffect(() => {
    // 避免無限更新循環
    let newTitle = baseTitle;
    
    // 只有當 pageId 存在且該頁面有數據時才處理
    if (pageId && pagesData[pageId]) {
      const { chineseName } = pagesData[pageId];
      
      // 只使用中文名稱更新頁面標題
      if (chineseName) {
        newTitle = `${chineseName} | ${baseTitle}`;
      }
    }
    
    // 只有在標題真正變更時才更新 document.title
    if (prevTitleRef.current !== newTitle) {
      document.title = newTitle;
      prevTitleRef.current = newTitle;
    }
    
    // 組件卸載時恢復標題
    return () => {
      if (document.title !== baseTitle) {
        document.title = baseTitle;
      }
    };
  }, [pagesData, pageId, baseTitle]);
  
  // 這個組件不需要渲染任何內容，只是為了更新頁面標題
  return null;
};

export default DynamicPageTitle;