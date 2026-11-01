/**
 * DB-MANAGER.JS - Gestión de IndexedDB
 * Guardar análisis con timestamp, comparar históricos
 */

const DB_NAME = 'StockAnalyzerDB';
const DB_VERSION = 1;
const STORE_NAME = 'analyses';

let db = null;
let dbReady = false;
let dbInitPromise = null;

// Inicializar IndexedDB
function initDB() {
    if (dbInitPromise) return dbInitPromise;

    dbInitPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('❌ IndexedDB error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            dbReady = true;
            console.log('✅ IndexedDB inicializada');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('market', 'market', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('✅ Object store creado');
            }
        };
    });

    return dbInitPromise;
}

// Guardar análisis
function saveAnalysis(market, companies) {
    return new Promise((resolve, reject) => {
        if (!dbReady) {
            initDB().then(() => saveAnalysis(market, companies)).then(resolve).catch(reject);
            return;
        }

        const timestamp = new Date().toISOString();
        const id = `${market}_${Date.now()}`;

        const analysis = {
            id,
            market,
            timestamp,
            companies: companies.map(c => ({
                ticker: c.ticker,
                name: c.name,
                price: c.price,
                level1Score: c.level1Score || 0,
                level2Score: c.level2Score || 0,
                level1Pass: c.level1Pass || false,
                level2Pass: c.level2Pass || false
            }))
        };

        try {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(analysis);

            request.onerror = () => {
                console.error('❌ Error guardando:', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                console.log(`✅ Análisis guardado: ${id}`);
                resolve(analysis);
            };
        } catch (err) {
            console.error('❌ Error en transacción:', err);
            reject(err);
        }
    });
}

// Obtener análisis de un mercado
function getAnalysesByMarket(market) {
    return new Promise((resolve, reject) => {
        if (!dbReady) {
            initDB().then(() => getAnalysesByMarket(market)).then(resolve).catch(reject);
            return;
        }

        try {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onerror = () => {
                console.error('❌ Error obteniendo análisis:', request.error);
                reject(request.error);
            };
            request.onsuccess = () => {
                const allAnalyses = request.result || [];
                const filtered = allAnalyses.filter(a => a.market === market);
                const analyses = filtered.sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                console.log(`✅ ${analyses.length} análisis encontrados para ${market}`);
                resolve(analyses);
            };
        } catch (err) {
            console.error('❌ Error en transacción:', err);
            reject(err);
        }
    });
}

// Comparar dos análisis
function compareAnalyses(analysis1, analysis2) {
    const map1 = new Map(analysis1.companies.map(c => [c.ticker, c]));
    const map2 = new Map(analysis2.companies.map(c => [c.ticker, c]));

    const newEntries = [];
    const exitedEntries = [];
    const improved = [];
    const declined = [];

    for (const [ticker, company] of map2) {
        if (!map1.has(ticker)) {
            newEntries.push({ ticker, ...company, label: '✨ NUEVA' });
        }
    }

    for (const [ticker, company] of map1) {
        if (!map2.has(ticker)) {
            exitedEntries.push({ ticker, ...company, label: '❌ SALIÓ' });
        }
    }

    for (const [ticker, company2] of map2) {
        const company1 = map1.get(ticker);
        if (company1) {
            const diff = (company2.level2Score || 0) - (company1.level2Score || 0);
            if (diff > 5) {
                improved.push({ ticker, ...company2, scoreDiff: diff, label: `🔼 SUBIÓ ${diff}%` });
            } else if (diff < -5) {
                declined.push({ ticker, ...company2, scoreDiff: diff, label: `🔽 BAJÓ ${Math.abs(diff)}%` });
            }
        }
    }

    return { newEntries, exitedEntries, improved, declined, totalNow: map2.size, totalBefore: map1.size, netChange: map2.size - map1.size };
}

// Obtener último análisis
function getLatestAnalysis(market) {
    return getAnalysesByMarket(market).then(analyses => analyses.length > 0 ? analyses[0] : null);
}

// Eliminar análisis
function deleteAnalysis(id) {
    return new Promise((resolve, reject) => {
        if (!dbReady) {
            initDB().then(() => deleteAnalysis(id)).then(resolve).catch(reject);
            return;
        }

        try {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                console.log(`✅ Análisis eliminado: ${id}`);
                resolve();
            };
        } catch (err) {
            reject(err);
        }
    });
}

// Inicializar al cargar
initDB().catch(err => console.error('Error inicializando IndexedDB:', err));
