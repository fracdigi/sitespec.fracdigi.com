'use client';

import { useFormData } from './FormContext';

const PathDisplay = ({ pageId, parentPath = '' }) => {
  const { pagesData } = useFormData();
  const pageData = pagesData[pageId] || {};
  
  // 取得英文名稱，如果沒有則使用預設值
  const englishName = pageData.englishName || '';
  
  // 建立完整路徑
  let fullPath = parentPath;
  if (englishName) {
    if (fullPath) {
      // 如果有父路徑，加上 /
      fullPath = `${fullPath}/${englishName}`;
    } else {
      // 如果沒有父路徑，直接使用英文名稱
      fullPath = `/${englishName}`;
    }
  }
  
  // 不再渲染整個路徑區塊，而是通過回傳 null 完全不顯示它
  return null;
};

export default PathDisplay;