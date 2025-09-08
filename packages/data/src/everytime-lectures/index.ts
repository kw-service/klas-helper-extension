export interface EverytimeLectureRate {
  average: number;
  count: number;
  items: { value: number; count: number }[];
}

export interface EverytimeLectureDetail {
  name: string;
  count: number;
  items: { text: string; count: number }[];
}

export interface EverytimeLecture {
  id: number;
  name: string;
  professor: string;
  rate: EverytimeLectureRate;
  details: EverytimeLectureDetail[];
}

// Runtime loader for everytime lectures data
let _everytimeLectures: EverytimeLecture[] | null = null;
let _loadingPromise: Promise<EverytimeLecture[]> | null = null;

/**
 * Get everytime lectures data with lazy loading
 * Uses cross-platform compatible approach to load external JSON
 */
export async function getEverytimeLectures(): Promise<EverytimeLecture[]> {
  if (_everytimeLectures !== null) {
    return _everytimeLectures;
  }

  if (_loadingPromise !== null) {
    return _loadingPromise;
  }

  _loadingPromise = loadEverytimeLecturesData();
  _everytimeLectures = await _loadingPromise;
  return _everytimeLectures;
}

/**
 * Synchronous getter for everytime lectures (returns empty array if not loaded)
 * Use getEverytimeLectures() for async loading
 */
export function getEverytimeLecturesSync(): EverytimeLecture[] {
  return _everytimeLectures || [];
}

/**
 * Load everytime lectures data from external JSON file
 * Uses fetch with relative URL that works in both Chrome and Firefox extensions
 */
async function loadEverytimeLecturesData(): Promise<EverytimeLecture[]> {
  try {
    // Construct URL relative to extension root
    // This works in both Chrome and Firefox without chrome.runtime.getURL
    const baseUrl = getExtensionBaseUrl();
    const dataUrl = `${baseUrl}data/everytime-lectures.json`;
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error(`Failed to load everytime lectures data: ${response.status}`);
    }
    const data: EverytimeLecture[] = await response.json();
    console.log(`Loaded ${data.length} everytime lectures`);
    return data;
  }
  catch (error) {
    console.error('Error loading everytime lectures data:', error);
    // Return empty array as fallback
    return [];
  }
}

/**
 * Get extension base URL in a cross-platform way
 */
function getExtensionBaseUrl(): string {
  // Try to get the current script URL and derive base from it
  if (typeof document !== 'undefined') {
    // In content script context, find extension resources
    const scripts = document.querySelectorAll('script[src*="app.js"], script[src*="content-main.js"]');
    for (const script of scripts) {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('extension://') || src.includes('moz-extension://')) {
        // Extract base URL
        const match = src.match(/(.*:\/\/[^\/]+\/)/);
        if (match) {
          return match[1];
        }
      }
    }
  }
  // Fallback: try to construct from current location if in extension context
  if (typeof location !== 'undefined' &&
      (location.protocol === 'chrome-extension:' || location.protocol === 'moz-extension:')) {
    return `${location.protocol}//${location.host}/`;
  }
  // Last resort: return relative path (may work in some contexts)
  return './';
}
// Backward compatibility: synchronous export (will be empty until loaded)
export const everytimeLectures: EverytimeLecture[] = getEverytimeLecturesSync();
