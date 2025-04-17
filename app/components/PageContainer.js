'use client';

import { useState, useEffect } from 'react';
import PageForm from './PageForm';
import DynamicPageTitle from './DynamicPageTitle';
import { useFormData } from './FormContext';

const PageContainer = ({ 
  id, 
  level = 0, 
  title, 
  onRemove,
  parentId = null, 
  parentPath = '', 
  expandedPageMap = {}, 
  onToggleExpand,
  onExpandChild
}) => {
  const { pagesData, clearPageData } = useFormData();
  const [children, setChildren] = useState([]);
  const [nextChildId, setNextChildId] = useState(1);
  const [currentPath, setCurrentPath] = useState(parentPath);
  
  // 檢查並加載模板中的子頁面 - 簡化為更直接的實現
  useEffect(() => {
    // 只有在 pagesData 有數據時才處理
    if (Object.keys(pagesData).length === 0) return;
    
    // 掃描 pagesData 尋找屬於這個頁面的直接子頁面
    const childPrefix = `${id}-`;
    const childPageIds = Object.keys(pagesData).filter(pageId => {
      // 必須以父頁面 ID 為前綴
      if (!pageId.startsWith(childPrefix)) return false;
      
      // 只包含比父頁面多一級的 ID (即直接子頁面)
      const parentSegments = id.split('-').length;
      const childSegments = pageId.split('-').length;
      return childSegments === parentSegments + 1;
    });

    // 只在有子頁面時進行處理
    if (childPageIds.length > 0) {
      console.log(`[${id}] 找到 ${childPageIds.length} 個子頁面`);
      
      // 找出最大的子頁面編號，確保新頁面不會和現有頁面衝突
      const childNumbers = childPageIds.map(childId => {
        const parts = childId.split('-');
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart, 10) || 0;
      });
      
      const maxChildNumber = Math.max(...childNumbers);
      
      // 更新下一個子頁面 ID
      if (maxChildNumber >= nextChildId) {
        setNextChildId(maxChildNumber + 1);
      }
      
      // 構建最新的子頁面列表
      const latestChildren = childPageIds.map(childId => {
        const childData = pagesData[childId] || {};
        return {
          id: childId,
          level: level + 1,
          title: childData.chineseName || '新頁面'
        };
      });
      
      // 檢查子頁面列表是否有變化
      const currentIds = children.map(child => child.id).sort().join(',');
      const newIds = latestChildren.map(child => child.id).sort().join(',');
      
      // 只有在子頁面發生變化時才更新
      if (currentIds !== newIds) {
        console.log(`[${id}] 更新子頁面列表`);
        setChildren(latestChildren);
      }
    } else if (children.length > 0) {
      // 如果 pagesData 中沒有子頁面，但 children 中有，則清空 children
      console.log(`[${id}] 清空子頁面列表`);
      setChildren([]);
    }
  }, [id, level, pagesData]);
  
  // 從全域狀態讀取此頁面的展開狀態
  const isExpanded = expandedPageMap[id] || false;
  
  const handleAddChild = () => {
    const childId = `${id}-${nextChildId}`;
    setChildren([...children, { 
      id: childId, 
      level: level + 1,
      title: `新頁面` // 更改預設標題，實際顯示將根據中文名稱
    }]);
    setNextChildId(nextChildId + 1);
    
    // 自動展開新增的子頁面
    if (onToggleExpand) {
      onToggleExpand(childId, id);
    }
  };
  
  const handleRemoveChild = (childId) => {
    // 從列表中移除子頁面
    setChildren(children.filter(child => child.id !== childId));
    
    // 從全局數據存儲中移除頁面數據
    clearPageData(childId);
    
    // 遞迴移除該頁面的所有子頁面數據
    Object.keys(pagesData)
      .filter(key => key.startsWith(`${childId}-`))
      .forEach(key => clearPageData(key));
  };
  
  // 切換當前頁面的展開/收合狀態
  const toggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand(id, parentId);
    }
  };
  
  // 獲取當前頁面的英文名稱並更新路徑
  useEffect(() => {
    // 如果是根頁面 (main-1)，則固定路徑為 "/"
    if (id === 'main-1') {
      setCurrentPath('/');
      return;
    }
    
    const pageData = pagesData[id];
    if (pageData && pageData.englishName) {
      if (parentPath) {
        setCurrentPath(`${parentPath}/${pageData.englishName}`);
      } else {
        setCurrentPath(`/${pageData.englishName}`);
      }
    } else {
      setCurrentPath(parentPath);
    }
  }, [pagesData, id, parentPath]);

  const handleFormSubmit = (data) => {
    console.log(`頁面 ${id} 提交的數據:`, data);
  };
  
  // 從全局數據中獲取中文名稱、英文名稱來生成標題
  const pageData = pagesData[id] || {};
  
  // 檢查是否為根頁面 (main-1)
  const isRootPage = id === 'main-1';
  
  // 如果是根頁面，則固定標題為"首頁"，路徑為"/"
  const chineseName = isRootPage ? '首頁' : (pageData.chineseName || '');
  const englishName = isRootPage ? '' : (pageData.englishName || '');
  
  // 從 pagesData 獲取當前頁面的路徑
  const path = isRootPage ? '/' : (currentPath || (englishName ? `/${englishName}` : '/'));
  
  // 完整標題 - 所有頁面都根據中文名稱顯示
  let displayTitle;
  
  if (chineseName) {
    // 如果有中文名稱，直接使用中文名稱作為標題
    displayTitle = chineseName;
  } else {
    // 如果沒有中文名稱，顯示預設標題
    displayTitle = level > 0 ? `未命名頁面` : title;
  }
  
  // 對子頁面（非根頁面且有英文名稱），添加路徑顯示
  if (level > 0 && englishName) {
    displayTitle = `${displayTitle} - ${path}`;
  }
  
  // 根頁面不添加特殊標識
  // 移除此處的特殊標識代碼
  
  return (
    <div className={`relative ${level > 0 ? 'ml-8 pl-4 border-l border-gray-300' : ''}`}>
      {/* 使用 DynamicPageTitle 組件來更新頁面標題 */}
      {isExpanded && <DynamicPageTitle pageId={id} />}
      
      <div className="mb-2 flex justify-between items-center">
        <button 
          onClick={toggleExpand}
          className="flex items-center gap-2 text-left w-full"
          aria-expanded={isExpanded}
        >
          <span className="flex-shrink-0 w-5 h-5 text-gray-500">
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            )}
          </span>
          <h3 className="text-lg font-semibold text-gray-800 font-mono">
            {displayTitle}
          </h3>
        </button>
        {/* 只在子頁面上顯示刪除按鈕，主頁面不可刪除 */}
        {level > 0 && (
          <button
            onClick={() => onRemove(id)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Remove page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {isExpanded && (
        <>
          <PageForm
            pageId={id}
            onSubmit={handleFormSubmit}
          />
          
          <div className="pl-4">
            {children.map(child => (
              <PageContainer
                key={child.id}
                id={child.id}
                level={child.level}
                title={child.title}
                parentId={id}
                parentPath={currentPath}
                onRemove={handleRemoveChild}
                expandedPageMap={expandedPageMap}
                onToggleExpand={onToggleExpand}
                onExpandChild={onExpandChild}
              />
            ))}
          </div>
          
          <button
            type="button"
            onClick={handleAddChild}
            className="mb-6 flex items-center gap-1 text-gray-600 hover:text-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新增頁面
          </button>
        </>
      )}
    </div>
  );
};

export default PageContainer;