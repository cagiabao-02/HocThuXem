import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Lang } from '../lib/i18n';
import { t as translate } from '../lib/i18n';
import { useAuth } from './AuthContext';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error('useLang must be used within LangProvider');
  return context;
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const { profile, updateProfile } = useAuth();
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) || 'vi';
  });

  // Sync with profile preference
  useEffect(() => {
    if (profile?.preferred_lang) {
      setLangState(profile.preferred_lang as Lang);
    }
  }, [profile?.preferred_lang]);

  const setLang = async (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    if (profile) {
      await updateProfile({ preferred_lang: newLang });
    }
  };

  const t = (key: string) => translate(key, lang);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}
