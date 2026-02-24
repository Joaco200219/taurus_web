---
description: how to onboard a new client by rebranding the template
---

This workflow automates the transition from the template to a specific client.

1. **Information Collection**
   - Check the `Master Prompt` provided by the user.
   - If missing, ask for: Client Name, Colors (Primary/BG), Google Sheet URLs, and Working Hours.

2. **Style Update**
   // turbo
   - Update `--color-brand-orange`, `--color-bg`, and `--color-text` in `src/styles/global.css`.
   - Update font imports in `src/layouts/Layout.astro` and families in `global.css`.

3. **Data Source Integration**
   // turbo
   - Replace URLs in `src/lib/googleSheets.js`.
   - Update `CATEGORY_MAP` to match the new client's spreadsheet categories and emojis.
   - Update `EXTRAS_KEYWORDS` if the new menu uses different terms.

4. **Component Branding**
   // turbo
   - Update `clientName` and slogan in `src/components/Header.astro`.
   - Update the working hours logic in the `<script>` section of `Header.astro`.
   - Update the WhatsApp number in the checkout process (check `CartFloatingButton.astro` or relevant store).

5. **SEO & Assets**
   // turbo
   - Update `title` and `description` in `src/layouts/Layout.astro`.
   - Remind the user to upload `logo.png` and `burger-pattern.png` to `/public`.

6. **Sanitization**
   // turbo
   - Run a global search for "Branco" and replace with the new client name in non-code strings.
