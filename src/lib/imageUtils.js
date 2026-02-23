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

    // If it's already a direct link to an image (ends with png, jpg, etc) 
    // or comes from common CDNs like Postimages, return it as is.
    const isDirect = trimmed.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)([?#].*)?$/i) ||
        trimmed.includes('postimg.cc') ||
        trimmed.startsWith('https://lh3.googleusercontent.com');

    if (isDirect) return trimmed;

    /**
     * OPTIMIZACIÓN DE GOOGLE DRIVE:
     * Usamos el endpoint de googleusercontent que permite redimensionar y comprimir.
     * =w800: Ancho de 800px (suficiente para retina y modals).
     * El servidor de Google genera un WebP comprimido automáticamente.
     */
    return fileId ? `https://lh3.googleusercontent.com/d/${fileId}=w800` : null;
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
