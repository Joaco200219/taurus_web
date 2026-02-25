# The Backbone Master Prompt

Este archivo define las reglas y la arquitectura técnica del proyecto "Columna Vertebral" usado para crear PWAs de menús digitales para múltiples clientes.

## 🏗️ Arquitectura Técnica
- **Framework**: [Astro](https://astro.build/)
- **Estilos**: Tailwind CSS v4 (usando `@theme` para variables en `src/styles/global.css`)
- **Datos**: Google Sheets (CSV) procesado en `src/lib/googleSheets.js`
- **Carrito**: Nano Stores para gestión de estado reactivo.

## 🧩 Reglas de Personalización (Industrialización)
Cada vez que se duplica este proyecto para un nuevo cliente, se deben seguir estas prioridades:

1.  **Identidad Visual**:
    - Las variables maestras están en `src/styles/global.css` dentro del bloque `@theme`.
    - No se deben usar colores "hardcoded" en componentes; siempre usar variables `--color-*`.
    - La estética (Retro, Minimalista, Moderna) se define mediante la combinación de fuentes en `Layout.astro` y estilos en `global.css`.

2.  **Configuración de Datos**:
    - `GOOGLE_SHEET_URL` y `EXTRAS_SHEET_URL` en `src/lib/googleSheets.js` son los únicos puntos de entrada de datos.
    - El `CATEGORY_MAP` y `EXTRAS_KEYWORDS` deben ajustarse al lenguaje del cliente.

3.  **Componentes Clave**:
    - `Header.astro`: Contiene el nombre, logo y la lógica de horarios.
    - `CartFloatingButton.astro`: Contiene la lógica de checkout y el número de WhatsApp.

## 🏭 Flujo de Onboarding
Para un nuevo cliente, utiliza el workflow `/nuevo-cliente`. Si el cliente no provee logo o colores, utiliza la skill `onboarding` para investigar su marca (Instagram/Web) o generar una propuesta visual inicial.

## 🧠 Filosofía de Desarrollo: "Eficiencia ante todo"
Para que este Backbone sea escalable y rentable, cada decisión técnica debe seguir estos pilares:

1.  **Optimización de Recursos (Bandwidth & Performance)**:
    - La PWA debe cargar instantáneamente incluso en conexiones móviles lentas.
    - **Imágenes**: Priorizar siempre la optimización. Usar servicios de transformación (como el de Vercel o CDNs) para servir tamaños adecuados. Nunca cargar imágenes de 5MB si se van a mostrar en 100px.
    - **Código**: Mantener el bundle lo más pequeño posible. Evitar añadir paquetes `npm` pesados si se puede resolver con lógica simple en JS nativo.

2.  **Criterio de Herramientas**:
    - **Livianas**: Si hay dos formas de hacer algo, elige la que consuma menos memoria y CPU.
    - **Open Source**: Priorizar bibliotecas de código abierto con buen soporte de la comunidad para evitar lock-ins y costos innecesarios.

3.  **Calidad Visual sin Sacrificio**:
    - La optimización no debe comprometer la estética. El objetivo es "Alta Calidad, Bajo Peso".

## ⚠️ Restricciones
- **No romper la lógica de Sheets**: El parsing de CSV en `googleSheets.js` debe mantenerse genérico. Si un cliente necesita una columna extra, agrégala de forma opcional.
- **Optimización de Imágenes**: Es obligatorio tratar las URLs de imágenes (especialmente de Google Drive o Postimages) para asegurar que se sirven versiones optimizadas.
- **Performance**: Mantener el bundle liviano. Evitar librerías pesadas si se puede resolver con Vanilla JS.
