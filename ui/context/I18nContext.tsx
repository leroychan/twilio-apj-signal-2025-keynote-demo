import React, { createContext, useContext, useState, useEffect } from "react";

// Supported languages
const languages = ["en", "es"];

// Type for translation function
type Translations = Record<string, string>;
type I18nContextType = {
  t: (key: string, vars?: Record<string, string | number>) => string;
  lang: string;
  setLang: (lang: string) => void;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLang] = useState("en-AU");
  const [dict, setDict] = useState<Translations>({});

  useEffect(() => {
    import(`../locales/${lang}.json`)
      .then((mod) => setDict(mod.default ?? mod))
      .catch(() => setDict({}));
  }, [lang]);

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = dict[key] || key;
    // very basic variable replacement
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replace(new RegExp(`{{${k}}}`, "g"), String(vars[k]));
      });
    }
    return str;
  };

  return (
    <I18nContext.Provider value={{ t, lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
