type Messages = Record<string, string>;

const dictionaries: Record<string, Messages> = { pt: {} };
let currentLocale = 'pt';

export function t(key: string) {
  const dict = dictionaries[currentLocale] || {};
  return dict[key] ?? key;
}

export function setLocale(locale: string) {
  currentLocale = locale;
}
