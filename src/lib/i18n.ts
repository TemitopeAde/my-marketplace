export const supportedLocales = ['en','zh','es','hi','ar','pt','fr','bn','ru','ja','pa','de','jv','ko','vi','te','tr','mr','ta','ur'] as const;
export type Locale = typeof supportedLocales[number];
const en = { search: 'Search listings', noListings: 'No listings found.', messageSeller: 'Message Seller', save: 'Save', share: 'Share', report: 'Report', createListing: 'Create listing', myListings: 'My listings' } as const;
export type TranslationKey = keyof typeof en;
export function translate(locale: string, key: TranslationKey): string { return supportedLocales.includes(locale as Locale) ? en[key] : en[key]; }
