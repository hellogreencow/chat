// Mock electron interface
interface ElectronAPI {
  app?: {
    getPath: (name: string) => string;
  };
  // Add other electron APIs as needed
}

let electronAPI: ElectronAPI | null = null;

// Only try to load electron if we're in electron mode
if (process.env.ELECTRON === 'true') {
  try {
    // Dynamic import for electron in electron mode
    electronAPI = (globalThis as any).require?.('electron') || null;
  } catch (e) {
    console.warn('Failed to load electron:', e);
  }
}

export const getElectron = () => electronAPI;

export const isElectron = () => process.env.ELECTRON === 'true';

// Safe path joining function that works in both environments
export const joinPath = (...parts: string[]) => {
  // Simple path joining for web environments
  return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
}; 