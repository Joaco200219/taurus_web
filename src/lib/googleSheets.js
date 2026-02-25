import Papa from 'papaparse';

// TODO: Reemplazar con la URL del Google Sheet del nuevo cliente
// Pasos: Sheet > Archivo > Compartir > Publicar en la web > CSV > Copiar enlace
const GOOGLE_SHEET_URL = '';

// TODO: Reemplazar con la URL del Google Sheet de Extras (pestaña "Extras")
// Columnas esperadas: id, nombre, precio, categoria_aplica
// categoria_aplica es un string separado por comas, ej: "hamburguesas,lomos,combos"
const EXTRAS_SHEET_URL = '';

// Palabras clave para determinar si un producto admite extras (case-insensitive)
// Incluye "hamburguesas mas papas" como una keyword completa
const EXTRAS_KEYWORDS = ['hamburguesa', 'combo', 'lomo', 'hamburguesas mas papas'];

// Fallback de emojis para categorías conocidas (se usa solo si el Sheet NO incluye emoji)
const CATEGORY_MAP = {
    'Promos del dia': { id: 'promos', emoji: '🔥', label: '🔥 Promos del Día' },
    'Combos': { id: 'combos', emoji: '🎁', label: '🎁 Combos' },
    'Hamburguesas': { id: 'hamburguesas', emoji: '🍔', label: '🍔 Hamburguesas' },
    'Hamburguesas mas papas': { id: 'hamburguesaspap', emoji: '🍔', label: '🍔 Hamburguesas + Papas' },
    'Lomos': { id: 'lomos', emoji: '🥩', label: '🥩 Lomos' },
    'Guarniciones': { id: 'guarniciones', emoji: '🍟', label: '🍟 Guarniciones' },
    'Bebidas': { id: 'bebidas', emoji: '🥤', label: '🥤 Bebidas' },
};

// Regex para detectar emojis al inicio de un string
const EMOJI_REGEX = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u;

/**
 * Analiza un string de categoría y extrae emoji + nombre.
 * Si el string ya trae emoji (ej: "🔥 Promos"), lo usa directamente.
 * Si no, busca en CATEGORY_MAP o usa un emoji por defecto.
 * @param {string} catKey - El valor crudo de la columna 'categoria'
 * @returns {{ id: string, emoji: string, label: string }}
 */
function resolveCategory(catKey) {
    // 1. Si hay un match exacto en CATEGORY_MAP y el Sheet NO trae emoji, usar el mapa
    const hasEmoji = EMOJI_REGEX.test(catKey);

    if (hasEmoji) {
        // Separar emoji del nombre
        const match = catKey.match(/^(.+?)\s+(.*)/);
        const emoji = match ? match[1] : catKey;
        const name = match ? match[2] : catKey;
        return {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            emoji,
            label: catKey // Usar tal cual viene del Sheet
        };
    }

    // 2. Buscar en CATEGORY_MAP como fallback
    if (CATEGORY_MAP[catKey]) {
        return CATEGORY_MAP[catKey];
    }

    // 3. Categoría totalmente nueva sin emoji ni mapa — emoji por defecto
    return {
        id: catKey.toLowerCase().replace(/\s+/g, '-'),
        emoji: '🍽️',
        label: `🍽️ ${catKey}`
    };
}

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

                    // 2. Group by Category — preservando orden de aparición en el Sheet
                    const categoryOrder = []; // Mantiene el orden de primera aparición
                    const groupedData = {};

                    activeRows.forEach(row => {
                        // Clean keys and values to avoid issues with hidden spaces in CSV
                        const cleanRow = {};
                        Object.keys(row).forEach(k => { cleanRow[k.trim()] = row[k] ? row[k].trim() : ''; });

                        const catKey = cleanRow.categoria || 'Otros';

                        if (!groupedData[catKey]) {
                            const resolved = resolveCategory(catKey);

                            groupedData[catKey] = {
                                id: resolved.id,
                                category: resolved.label,
                                emoji: resolved.emoji,
                                products: []
                            };
                            categoryOrder.push(catKey); // Registrar orden de aparición
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

                    // Orden final = orden de primera aparición en el Sheet
                    const sortedCategories = categoryOrder.map(key => groupedData[key]);

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
                            tipo: (cleanRow.tipo || 'extra').trim().toLowerCase(),
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
