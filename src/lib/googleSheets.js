import Papa from 'papaparse';

// TODO: Reemplazar con la URL del Google Sheet del nuevo cliente
// Pasos: Sheet > Archivo > Compartir > Publicar en la web > CSV > Copiar enlace
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUjYQ79c41cWdRQw_Ihm4UGnrzuxBIq9CIOQkVCIYsKku595csG9qypXFaaSpYABlRB2lqZ2hMxWjq/pub?output=csv';

// TODO: Reemplazar con la URL del Google Sheet de Extras (pestaña "Extras")
// Columnas esperadas: id, nombre, precio, categoria_aplica
// categoria_aplica es un string separado por comas, ej: "hamburguesas,lomos,combos"
const EXTRAS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUjYQ79c41cWdRQw_Ihm4UGnrzuxBIq9CIOQkVCIYsKku595csG9qypXFaaSpYABlRB2lqZ2hMxWjq/pub?gid=103651600&output=csv';

// Palabras clave para determinar si un producto admite extras (case-insensitive)
// Incluye "hamburguesas mas papas" como una keyword completa
const EXTRAS_KEYWORDS = ['hamburguesa', 'combo', 'lomo', 'hamburguesas mas papas'];

// Keys deben coincidir EXACTAMENTE con la columna 'categoria' del Google Sheet (respeta mayúsculas)
const CATEGORY_MAP = {
    'Promos del dia': { id: 'promos', emoji: '🔥', label: '🔥 Promos del Día' },
    'Combos': { id: 'combos', emoji: '🎁', label: '🎁 Combos' },
    'Hamburguesas': { id: 'hamburguesas', emoji: '🍔', label: '🍔 Hamburguesas' },
    'Hamburguesas mas papas': { id: 'hamburguesaspap', emoji: '🍔', label: '🍔 Hamburguesas + Papas' },
    'Lomos': { id: 'lomos', emoji: '🥩', label: '🥩 Lomos' },
    'Guarniciones': { id: 'guarniciones', emoji: '🍟', label: '🍟 Guarniciones' },
    'Bebidas': { id: 'bebidas', emoji: '🥤', label: '🥤 Bebidas' },
};

export async function getMenuData() {
    // Guard: if no Sheet URL is configured, fall back to local menu.json
    if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL.trim() === '') {
        console.warn('[googleSheets.js] GOOGLE_SHEET_URL no configurada. Usando menu.json local como fallback.');
        try {
            const localMenu = await import('../data/menu.json');
            return localMenu.default || [];
        } catch {
            return [];
        }
    }

    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const rows = results.data;

                    // 1. Filter by disponible = "TRUE" (case-insensitive and trimmed)
                    const activeRows = rows.filter(row => {
                        const disp = row.disponible ? row.disponible.trim().toUpperCase() : '';
                        return disp === 'TRUE';
                    });

                    // 2. Group by Category
                    const groupedData = {};

                    activeRows.forEach(row => {
                        // Clean keys and values to avoid issues with hidden spaces in CSV
                        const cleanRow = {};
                        Object.keys(row).forEach(k => { cleanRow[k.trim()] = row[k] ? row[k].trim() : ''; });

                        const catKey = cleanRow.categoria || 'Otros';

                        if (!groupedData[catKey]) {
                            const mapData = CATEGORY_MAP[catKey] || {
                                id: catKey.toLowerCase().replace(/\s+/g, '-'),
                                emoji: '🍽️',
                                label: catKey
                            };

                            groupedData[catKey] = {
                                id: mapData.id,
                                category: mapData.label,
                                emoji: mapData.emoji,
                                products: []
                            };
                        }

                        // 3. Map CSV columns to Product Object
                        groupedData[catKey].products.push({
                            id: cleanRow.id,
                            nombre: cleanRow.nombre,
                            descripcion: cleanRow.descripcion,
                            precio: parseInt(cleanRow.precio, 10) || 0,
                            imagen: cleanRow.url || null, // URL de imagen (Google Drive link)
                            badge: cleanRow.badge || null,
                            categoria: catKey // Necesario para evaluar extras
                        });
                    });

                    // Sort categories by CATEGORY_MAP order, then append unmapped ones
                    const sortedCategories = Object.keys(CATEGORY_MAP)
                        .filter(key => groupedData[key])
                        .map(key => groupedData[key]);

                    Object.keys(groupedData).forEach(key => {
                        if (!CATEGORY_MAP[key]) {
                            sortedCategories.push(groupedData[key]);
                        }
                    });

                    resolve(sortedCategories);
                },
                error: (err) => {
                    reject(err);
                }
            });
        });

    } catch (error) {
        console.error('[googleSheets.js] Error al obtener datos del Sheet:', error);
        return [];
    }
}

/**
 * Fetch extras from the Google Sheet CSV (pestaña "Extras").
 * Columns: id, nombre, precio, categoria_aplica
 * Returns: Array<{ id, nombre, precio, categorias: string[] }>
 */
export async function getExtras() {
    if (!EXTRAS_SHEET_URL || EXTRAS_SHEET_URL.trim() === '' || EXTRAS_SHEET_URL.includes('EXTRAS_GID')) {
        console.warn('[googleSheets.js] EXTRAS_SHEET_URL no configurada. Retornando extras vacíos.');
        return [];
    }

    try {
        const response = await fetch(EXTRAS_SHEET_URL);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const extras = results.data.map(row => {
                        const cleanRow = {};
                        Object.keys(row).forEach(k => { cleanRow[k.trim()] = row[k] ? row[k].trim() : ''; });

                        return {
                            id: cleanRow.id || '',
                            nombre: cleanRow.nombre || '',
                            precio: parseInt(cleanRow.precio, 10) || 0,
                            categorias: (cleanRow.categoria_aplica || '')
                                .split(',')
                                .map(c => c.trim().toLowerCase())
                                .filter(Boolean)
                        };
                    }).filter(e => e.id && e.nombre);

                    resolve(extras);
                },
                error: (err) => reject(err)
            });
        });
    } catch (error) {
        console.error('[googleSheets.js] Error al obtener extras del Sheet:', error);
        return [];
    }
}

/**
 * Determina si un producto admite extras basándose en su categoría.
 * Regla: si la categoría contiene "hamburguesa", "combo", "lomo" o
 * "hamburguesas mas papas" (case-insensitive).
 * @param {string} categoria - La categoría del producto
 * @returns {boolean}
 */
export function productHasExtras(categoria) {
    if (!categoria) return false;
    const catLower = categoria.toLowerCase();
    return EXTRAS_KEYWORDS.some(keyword => catLower.includes(keyword));
}

/**
 * Filtra los extras disponibles para una categoría específica.
 * @param {Array} allExtras - Todos los extras del Sheet
 * @param {string} categoria - La categoría del producto
 * @returns {Array} Los extras que aplican a esa categoría
 */
export function getExtrasForCategory(allExtras, categoria) {
    if (!categoria || !allExtras || allExtras.length === 0) return [];
    const catLower = categoria.toLowerCase();

    return allExtras.filter(extra =>
        extra.categorias.some(ec => catLower.includes(ec) || ec.includes(catLower.replace(/\s+/g, '')))
    );
}
