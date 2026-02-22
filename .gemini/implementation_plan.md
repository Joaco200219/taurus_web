# Plan de Implementación — Mejoras Branco Burgers

## Estado de cambios anteriores (ya completados ✅)
1. ✅ URL de Extras configurada correctamente (gid=103651600)
2. ✅ Badge Abierto/Cerrado con horario real de Argentina
3. ✅ Campo "Aclaración" por producto en ModalExtras
4. ✅ Campo "Preferencias generales" eliminado del carrito
5. ✅ Aclaraciones incluidas en mensaje de WhatsApp
6. ✅ Build exitoso

---

## Nuevos cambios a implementar

### Tarea 1: Ocultar mensaje "No hay extras configurados" en el modal
**Archivo:** `src/components/ModalExtras.astro`
- Cuando no hay extras disponibles para un producto, NO mostrar el mensaje "No hay extras configurados aún".
- Solo mostrar el campo de aclaración y el botón de confirmar.
- La sección de checkboxes queda vacía y el `emptyMsg` queda oculto.

### Tarea 2: Utilidad de conversión de enlaces de Google Drive
**Archivo nuevo:** `src/lib/imageUtils.js`
- Crear función `getDriveDirectLink(url)`.
- Usar regex para extraer el ID del archivo de una URL como `https://drive.google.com/file/d/[ID]/view...`.
- Retornar `https://drive.google.com/uc?export=view&id=[ID]`.
- Retornar `null` si el enlace es inválido o nulo.

### Tarea 3: Habilitar columna `url` (imagen) en Google Sheets
**Archivo:** `src/lib/googleSheets.js`
- Cambiar `imagen: null` por `imagen: cleanRow.url || null` (o el nombre correcto de la columna).
- **Nota:** Actualmente el CSV tiene columnas sin header después de `badge`. El cliente necesitará agregar el header `url` en la columna correspondiente del Sheet. Si la columna ya existe con otro nombre, adaptaremos.

### Tarea 4: Configurar Astro para imágenes externas
**Archivo:** `astro.config.mjs`
- Agregar `image.domains: ['drive.google.com']` a la configuración de Astro.
- Esto permite a Vercel optimizar las imágenes de Google Drive.

### Tarea 5: Mostrar imagen del producto en el ModalExtras
**Archivo:** `src/components/ModalExtras.astro`
- El evento `open-extras-modal` ahora también recibe la propiedad `imagen` del producto.
- **ProductCard.astro**: Agregar `data-product-imagen` al botón y enviarlo en el custom event.
- **ModalExtras.astro**: 
  - Agregar un contenedor `<div>` para la imagen debajo del header.
  - Si hay imagen válida, procesarla con `getDriveDirectLink()` y renderizarla como `<img>` con `loading="lazy"`.
  - **Nota sobre `<Image />` de Astro**: El componente `<Image />` de `astro:assets` **solo funciona en el template estático de Astro**, no funciona para URLs dinámicas inyectadas vía JS en runtime. Como la imagen se carga dinámicamente en el modal vía JavaScript del lado cliente, usaremos un `<img>` nativo con `loading="lazy"` y dejaremos que Vercel Image Optimization maneje la conversión a WebP via su CDN automáticamente.
  - La imagen se muestra con `object-cover`, con esquinas redondeadas, y estilos consistentes con el diseño brutalista.

### Tarea 6: Pasar `imagen` a través de todo el flujo de datos
- **index.astro**: Ya pasa `products` a CategorySection, que pasa a ProductCard. El objeto `product` ya tiene el campo `imagen`.
- **ProductCard.astro**: Agregar `data-product-imagen={imagen || ''}` al botón y al evento custom.
- **ModalExtras.astro**: Recibir `imagen` en el evento `open-extras-modal` y renderizarla.

---

## Orden de ejecución
1. Tarea 1 (ocultar mensaje vacío)
2. Tarea 2 (imageUtils.js)
3. Tarea 3 (habilitar columna url en googleSheets)
4. Tarea 4 (astro.config.mjs)
5. Tarea 5 + 6 (flujo de imagen completo en los componentes)
6. Build y verificación
