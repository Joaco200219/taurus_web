---
name: onboarding
description: Automatiza la personalización estética y de datos para nuevos clientes del Backbone.
---

# Skill: Onboarding de Clientes

Esta skill permite a Antigravity actuar como un Diseñador y Desarrollador Senior para "clonar" la marca de un cliente en la plantilla Backbone.

## 🛠️ Capacidades

### 1. Investigación de Marca
Si solo tienes el nombre del cliente o su Instagram:
- Usa `search_web` para encontrar su presencia online.
- Usa `read_browser_page` para analizar su paleta de colores dominante y tipografía.
- Identifica el "vibe" de la marca: ¿Es elegante? ¿Es fast-food agresivo? ¿Es artesanal?

### 2. Generación de Identidad
Si el cliente no tiene assets:
- Usa `generate_image` para crear un logo minimalista o un patrón de fondo (ej: `burger-pattern.png`).
- Define una paleta de 3 colores (Brand, Base, Accent).

### 3. Aplicación Técnica
Sigue estos pasos para aplicar la marca:
1. **Colores**: Actualiza el bloque `@theme` en `src/styles/global.css`.
2. **Tipografía**: Busca en Google Fonts una combinación que encaje y actualiza `Layout.astro`.
3. **Imágenes**: Genera o descarga assets y colócalos en `/public`.
4. **Textos**: Personaliza `Header.astro` y metadatos SEO.

## 📋 Prompt de Activación sugerido
"Usa la skill de onboarding para investigar a [Nombre del Cliente] y aplicar su identidad a este proyecto. Su Instagram es [URL]."
