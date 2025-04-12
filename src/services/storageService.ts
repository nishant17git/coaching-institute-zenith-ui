
// Storage service to persist data across page reloads

// Get data with a default fallback if not exists
export function getStoredData<T>(key: string, defaultData: T): T {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultData;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultData;
  }
}

// Save data to localStorage
export function storeData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
  }
}

// Storage keys
export const STORAGE_KEYS = {
  STUDENTS: 'infinity_classes_students',
  FEES: 'infinity_classes_fees',
  ATTENDANCE: 'infinity_classes_attendance',
  SETTINGS: 'infinity_classes_settings'
};
