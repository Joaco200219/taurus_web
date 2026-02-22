/**
 * Convierte un enlace de Google Drive a una URL directa de imagen (thumbnail).
 *
 * Usa el endpoint /thumbnail que no requiere autenticación.
 * sz=w480 → 480px de ancho, suficiente para el modal (max ~448px).
 *
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function getDriveDirectLink(url) {
    if (!url || typeof url !== 'string') return null;

    const trimmed = url.trim();
    if (!trimmed) return null;

    let fileId = null;

    // /file/d/ID/view...
    const m1 = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m1) fileId = m1[1];

    // /open?id=ID
    if (!fileId) {
        const m2 = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
        if (m2) fileId = m2[1];
    }

    // /uc?...id=ID
    if (!fileId) {
        const m3 = trimmed.match(/drive\.google\.com\/uc\?.*[?&]id=([a-zA-Z0-9_-]+)/);
        if (m3) fileId = m3[1];
    }

    // Already direct (lh3.googleusercontent.com)
    if (!fileId && trimmed.startsWith('https://lh3.googleusercontent.com')) {
        return trimmed;
    }

    if (!fileId) return null;

    // w480 ≈ retina 240px — suficiente para el modal (sm:max-w-md = 448px)
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w480`;
}

/**
 * Pre-carga la imagen en el browser cache ANTES de que se abra el modal.
 * Se llama al hover/touchstart del botón "AGREGAR" en ProductCard.
 * Si la imagen ya está en cache, esta llamada es instantánea.
 *
 * @param {string|null|undefined} driveUrl — Enlace original de Google Drive
 */
export function prefetchDriveImage(driveUrl) {
    const directUrl = getDriveDirectLink(driveUrl);
    if (!directUrl) return;
    // new Image() dispara la descarga sin bloquear la UI
    const img = new Image();
    img.src = directUrl;
}
