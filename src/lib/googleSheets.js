import Papa from 'papaparse';

// TODO: Reemplazar con la URL del Google Sheet del nuevo cliente
// Pasos: Sheet > Archivo > Compartir > Publicar en la web > CSV > Copiar enlace
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUjYQ79c41cWdRQw_Ihm4UGnrzuxBIq9CIOQkVCIYsKku595csG9qypXFaaSpYABlRB2lqZ2hMxWjq/pub?output=csv';

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
                            imagen: null, // Deshabilitado por pedido
                            badge: cleanRow.badge || null
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

