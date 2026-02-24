---
description: cómo hacer el onboarding de un nuevo cliente rebranding la plantilla
---

Este flujo automatiza la transición de la plantilla a un cliente específico.

1. **Recolección de Información**
   - Revisa el `Master Prompt` provisto por el usuario.
   - Si falta información, solicita: Nombre del Cliente, Colores, URLs de Google Sheet y Horarios.

2. **Actualización de Estilos**
   // turbo
   - Actualiza `--color-brand-orange`, `--color-bg` y `--color-text` en `src/styles/global.css`.
   - Actualiza las fuentes en `src/layouts/Layout.astro` y las familias en `global.css`.

3. **Integración de Datos**
   // turbo
   - Reemplaza las URLs en `src/lib/googleSheets.js`.
   - Actualiza el `CATEGORY_MAP` para que coincida con las categorías y emojis del nuevo cliente.
   - Actualiza `EXTRAS_KEYWORDS` si el nuevo menú usa términos diferentes.

4. **Branding de Componentes**
   // turbo
   - Actualiza el nombre del cliente y el slogan en `src/components/Header.astro`.
   - Actualiza la lógica de horarios en la sección `<script>` de `Header.astro`.
   - Actualiza el número de WhatsApp en el proceso de checkout (ver `CartFloatingButton.astro`).

5. **SEO y Assets**
   // turbo
   - Actualiza `title` y `description` en `src/layouts/Layout.astro`.
   - Recuerda al usuario subir `logo.png` y `burger-pattern.png` a `/public`.

6. **Saneamiento**
   // turbo
   - Realiza una búsqueda global de "Branco" y reemplázalo por el nombre del nuevo cliente en textos que no sean código.
