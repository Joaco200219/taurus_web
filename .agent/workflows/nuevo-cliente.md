---
description: cómo hacer el onboarding de un nuevo cliente rebranding la plantilla
---

Este flujo automatiza la transición de la plantilla a un cliente específico utilizando el **Backbone Master Prompt** y la **Skill de Onboarding**.

1. **Recolección de Información**
   - Consulta el archivo `.agent/instructions.md` para entender las reglas del proyecto.
   - Si no tienes datos del cliente, usa la **Skill of Onboarding** para investigar su marca (Instagram, Web).
   - Datos mínimos: Nombre, Colores, URL de Google Sheet, WhatsApp y Horarios.

2. **Actualización de Estilos**
   // turbo
   - Actualiza el bloque `@theme` en `src/styles/global.css` (colores y fuentes).
   - Configura las fuentes externas en `src/layouts/Layout.astro`.

3. **Integración de Datos**
   // turbo
   - Reemplaza `GOOGLE_SHEET_URL` y `EXTRAS_SHEET_URL` en `src/lib/googleSheets.js`.
   - Ajusta `CATEGORY_MAP` y `EXTRAS_KEYWORDS` al lenguaje del cliente.

4. **Branding de Componentes**
   // turbo
   - Personaliza nombre, logo y horarios en `src/components/Header.astro`.
   - Configura el número de WhatsApp en `CartFloatingButton.astro`.

5. **Assets y SEO**
   // turbo
   - Actualiza `title` y `description` en `src/layouts/Layout.astro`.
   - Genera o sube `logo.png` y assets visuales a `/public`.

6. **Limpieza Final**
   // turbo
   - Ejecuta un reemplazo global de "Branco" (u otro cliente previo) por el nombre del nuevo cliente en los textos visibles.
