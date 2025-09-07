export const browser = (typeof window !== 'undefined') ? ((typeof window.chrome !== 'undefined' || typeof window.browser !== 'undefined') ? (window.browser || window.chrome) : chrome) : chrome;
