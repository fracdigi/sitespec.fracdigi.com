'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useFormData } from './FormContext';

const PageForm = ({ pageId, onSubmit, onCancel }) => {
  const { pagesData, updatePageData } = useFormData();
  const initialData = pagesData[pageId] || {};
  
  const { register, handleSubmit, formState: { errors }, reset, control } = useForm({
    defaultValues: initialData,
    mode: 'onChange' // 啟用即時驗證
  });
  
  const [files, setFiles] = useState(initialData.files || []);
  
  // 監視表單欄位變化，自動儲存
  const chineseName = useWatch({ control, name: 'chineseName' });
  const englishName = useWatch({ control, name: 'englishName' });
  const textContent = useWatch({ control, name: 'textContent' });
  const styleDescription = useWatch({ control, name: 'styleDescription' });
  
  // 使用 ref 來追蹤最近的表單數據，避免無限循環
  const formValuesRef = useRef({
    chineseName: chineseName || '',
    englishName: englishName || '',
    textContent: textContent || '',
    styleDescription: styleDescription || '',
  });
  
  // 為根頁面設置固定值
  useEffect(() => {
    // 只在 root 頁面時執行
    if (pageId === 'main-1') {
      // 確保根頁面始終有固定的名稱和路徑
      if (chineseName !== '首頁' || englishName !== '') {
        // 直接更新 FormData
        updatePageData(pageId, {
          ...initialData,
          chineseName: '首頁',
          englishName: '',  // 空值，將顯示為 "/"
          textContent: initialData.textContent || '',
          styleDescription: initialData.styleDescription || '',
          files: initialData.files || []
        });
      }
    }
  }, [pageId]);

  // 當表單數據變更時自動保存 - 使用防抖以避免過於頻繁的更新
  useEffect(() => {
    // 檢查是否為根頁面
    const isRootPage = pageId === 'main-1';
    
    // 如果是根頁面，則固定中文名稱和英文名稱
    let updatedChineseName = isRootPage ? '首頁' : (chineseName || '');
    let updatedEnglishName = isRootPage ? '' : (englishName || '');
    
    // 檢查是否有真正的變化發生
    const hasChanges = 
      formValuesRef.current.chineseName !== updatedChineseName ||
      formValuesRef.current.englishName !== updatedEnglishName ||
      formValuesRef.current.textContent !== (textContent || '') ||
      formValuesRef.current.styleDescription !== (styleDescription || '');
    
    // 如果有真正的變化，才更新數據
    if (pageId && hasChanges) {
      // 更新參考值
      formValuesRef.current = {
        chineseName: updatedChineseName,
        englishName: updatedEnglishName,
        textContent: textContent || '',
        styleDescription: styleDescription || '',
      };
      
      const formData = {
        ...formValuesRef.current,
        files
      };
      
      // 延遲更新以減少頻繁更新
      const timeoutId = setTimeout(() => {
        updatePageData(pageId, formData);
        
        // 觸發回調
        if (onSubmit) {
          onSubmit(formData);
        }
      }, 300);
      
      // 清理函數
      return () => clearTimeout(timeoutId);
    }
  }, [pageId, chineseName, englishName, textContent, styleDescription, files]);
  
  // 當頁面ID變更時重置表單
  useEffect(() => {
    const currentData = pagesData[pageId];
    if (currentData) {
      // 向後兼容：如果有舊的 pageDescription 欄位，但沒有新的 textContent 欄位
      if (currentData.pageDescription && !currentData.textContent) {
        currentData.textContent = currentData.pageDescription;
      }
      reset(currentData);
      setFiles(currentData.files || []);
    } else {
      reset({});
      setFiles([]);
    }
  }, [pageId, pagesData, reset]);
  
  // 處理檔案上傳
  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => {
        const combined = [...prev, ...newFiles];
        
        // 當檔案變更時立即更新頁面數據
        const formData = {
          chineseName: chineseName || '',
          englishName: englishName || '',
          textContent: textContent || '',
          styleDescription: styleDescription || '',
          files: combined
        };
        
        updatePageData(pageId, formData);
        return combined;
      });
    }
  };
  
  // 處理拖放檔案
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => {
        const combined = [...prev, ...droppedFiles];
        
        // 當檔案變更時立即更新頁面數據
        const formData = {
          chineseName: chineseName || '',
          englishName: englishName || '',
          textContent: textContent || '',
          styleDescription: styleDescription || '',
          files: combined
        };
        
        updatePageData(pageId, formData);
        return combined;
      });
    }
  };

  // 表單提交處理器 (仍保留以防止表單默認提交行為)
  const handleFormSubmit = (data) => {
    // 由於自動保存，實際上這裡不需要做任何事情
    // 但我們保留這個函數以防止表單的默認提交行為
  };

  // 檢查是否為根頁面（main-1）
  const isRootPage = pageId === 'main-1';

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)}
      className="bg-white p-6 rounded border border-gray-200 mb-4"
    >
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          中文名稱
          {isRootPage ? (
            <input
              type="text"
              value="首頁"
              readOnly
              className="border rounded w-full py-2 px-3 mt-1 text-gray-700 bg-gray-100 leading-tight font-mono"
            />
          ) : (
            <input
              {...register('chineseName', { required: '中文名稱是必填的' })}
              className="border rounded w-full py-2 px-3 mt-1 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          )}
        </label>
        {!isRootPage && errors.chineseName && <p className="text-red-500 text-xs">{errors.chineseName.message}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          英文名稱
          {isRootPage ? (
            <input
              type="text"
              value=""
              readOnly
              placeholder="根路徑"
              className="border rounded w-full py-2 px-3 mt-1 text-gray-700 bg-gray-100 leading-tight font-mono"
            />
          ) : (
            <input
              {...register('englishName', { 
                required: '英文名稱是必填的',
                pattern: {
                  value: /^[a-zA-Z0-9-_]+$/,
                  message: '只能包含英文、數字、連字符或底線'
                }
              })}
              className="border rounded w-full py-2 px-3 mt-1 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="example-page"
            />
          )}
        </label>
        {!isRootPage && errors.englishName && <p className="text-red-500 text-xs">{errors.englishName.message}</p>}
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          文字內容
          <textarea
            {...register('textContent')}
            className="border rounded w-full py-2 px-3 mt-1 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-gray-400"
            rows="3"
            placeholder="頁面需要顯示的文字內容"
          />
        </label>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          排版與樣式描述
          <textarea
            {...register('styleDescription')}
            className="border rounded w-full py-2 px-3 mt-1 text-gray-700 leading-tight focus:outline-none focus:ring-1 focus:ring-gray-400"
            rows="3"
            placeholder="頁面的排版、字體、顏色等樣式要求"
          />
        </label>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          圖片素材
          <div 
            className={`mt-1 flex items-center justify-center border-2 border-dashed rounded-md p-4 ${
              isDragging 
                ? 'border-gray-500 bg-gray-50'
                : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor={`file-upload-${pageId}`}
                  className="relative cursor-pointer bg-white rounded-md font-medium text-gray-600 hover:text-gray-500 focus-within:outline-none"
                >
                  <span>選擇檔案</span>
                  <input
                    id={`file-upload-${pageId}`}
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">或拖曳至此處</p>
              </div>
              <p className="text-xs text-gray-500">可上傳頁面所需的圖片素材 (PNG, JPG, SVG 等格式)</p>
            </div>
          </div>
        </label>
        {files.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">已選擇的圖片：</p>
            <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center">
                  <span>{file.name} ({Math.round(file.size / 1024)} KB)</span>
                  <button 
                    type="button"
                    onClick={() => {
                      const newFiles = [...files];
                      newFiles.splice(index, 1);
                      setFiles(newFiles);
                      
                      // 更新頁面數據
                      const formData = {
                        chineseName: chineseName || '',
                        englishName: englishName || '',
                        textContent: textContent || '',
                        styleDescription: styleDescription || '',
                        files: newFiles
                      };
                      
                      updatePageData(pageId, formData);
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Submit buttons removed as requested */}
    </form>
  );
};

export default PageForm;