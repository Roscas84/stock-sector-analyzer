import { useState, useEffect } from 'react';
import { SectorAnalysis, UserPreferences } from '../types/index';

export function useIndexedDB() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [ready, setReady] = useState(false);

  // Inicializar IndexedDB
  useEffect(() => {
    const initDB = async () => {
      const request = indexedDB.open('StockAnalyzer', 1);

      request.onerror = () => console.error('IndexedDB error:', request.error);

      request.onsuccess = () => {
        const database = request.result;
        setDb(database);
        setReady(true);
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        // Object stores
        if (!database.objectStoreNames.contains('analyses')) {
          database.createObjectStore('analyses', { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains('favorites')) {
          database.createObjectStore('favorites', { keyPath: 'ticker' });
        }
        if (!database.objectStoreNames.contains('userNotes')) {
          database.createObjectStore('userNotes', { keyPath: 'ticker' });
        }
        if (!database.objectStoreNames.contains('preferences')) {
          database.createObjectStore('preferences', { keyPath: 'id' });
        }
      };
    };

    initDB();
  }, []);

  // Guardar análisis
  const saveAnalysis = async (analysis: SectorAnalysis): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('DB not ready');
        return;
      }

      const transaction = db.transaction(['analyses'], 'readwrite');
      const store = transaction.objectStore('analyses');
      const request = store.put(analysis);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // Obtener análisis por sector
  const getAnalysisBySector = async (
    sector: string
  ): Promise<SectorAnalysis[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('DB not ready');
        return;
      }

      const transaction = db.transaction(['analyses'], 'readonly');
      const store = transaction.objectStore('analyses');
      const request = store.getAll();

      request.onsuccess = () => {
        const all = request.result;
        const filtered = all.filter((a) => a.sector === sector);
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  };

  // Obtener todos los análisis
  const getAllAnalyses = async (): Promise<SectorAnalysis[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('DB not ready');
        return;
      }

      const transaction = db.transaction(['analyses'], 'readonly');
      const store = transaction.objectStore('analyses');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  // Agregar favorita
  const addFavorite = async (ticker: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('DB not ready');
        return;
      }

      const transaction = db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');
      const request = store.put({ ticker, timestamp: new Date().toISOString() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // Obtener favoritas
  const getFavorites = async (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('DB not ready');
        return;
      }

      const transaction = db.transaction(['favorites'], 'readonly');
      const store = transaction.objectStore('favorites');
      const request = store.getAll();

      request.onsuccess = () => {
        const tickers = request.result.map((f) => f.ticker);
        resolve(tickers);
      };
      request.onerror = () => reject(request.error);
    });
  };

  // Guardar nota del usuario
  const saveNote = async (ticker: string, note: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('DB not ready');
        return;
      }

      const transaction = db.transaction(['userNotes'], 'readwrite');
      const store = transaction.objectStore('userNotes');
      const request = store.put({ ticker, note });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  // Obtener nota del usuario
  const getNote = async (ticker: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('DB not ready');
        return;
      }

      const transaction = db.transaction(['userNotes'], 'readonly');
      const store = transaction.objectStore('userNotes');
      const request = store.get(ticker);

      request.onsuccess = () => {
        resolve(request.result?.note || null);
      };
      request.onerror = () => reject(request.error);
    });
  };

  // Guardar preferencias
  const savePreferences = async (prefs: UserPreferences): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('DB not ready');
        return;
      }

      const transaction = db.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');
      const request = store.put({ id: 'default', ...prefs });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  };

  return {
    ready,
    saveAnalysis,
    getAnalysisBySector,
    getAllAnalyses,
    addFavorite,
    getFavorites,
    saveNote,
    getNote,
    savePreferences,
  };
}
