import React, { createContext, useState, useContext } from 'react';
import translations from '../i18n/translations.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('zh'); // 預設中文

  // 翻譯函式：根據目前的語系與 key 取得字串，若找不到則退回中文或原 key
  const t = (key) => {
    return translations[language]?.[key] || translations['zh']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook 以方便元件呼叫
// eslint-disable-next-line
export const useLanguage = () => useContext(LanguageContext);
