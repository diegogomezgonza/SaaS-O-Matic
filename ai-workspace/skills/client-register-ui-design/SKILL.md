---
name: client-register-ui-design
description: Design and implement distinctive, responsive React interfaces and production-style UI copy for SaaS-O-Matic using Tailwind CSS and shadcn/ui. Use for screens, visual changes, component work, interface text, responsive behavior, and UI reviews.
---

# SaaS-O-Matic UI Design

Apply this skill when creating or changing the SaaS-O-Matic interface. The product is an internal commercial console: a salesperson should be able to find a corporate client, understand its saved simulations, adjust usage, and trust the resulting quote quickly.

## Design before implementation

For a new screen or substantial visual change, decide a compact direction before coding:

- **Purpose:** what decision or action should the screen support?
- **Palette:** use the existing semantic tokens first; introduce a new color only when it carries meaning.
- **Typography:** choose a clear hierarchy and readable line lengths. Use sentence case and avoid styling every label as metadata.
- **Layout:** define the dominant alignment, information density, responsive collapse, and the one memorable visual idea.
- **Interaction:** specify loading, empty, validation-error, server-error, success, focus, and reduced-motion behavior.

The current visual foundation uses semantic CSS variables in `src/styles/globals.css`. Keep the product's restrained indigo-and-ink direction coherent rather than creating a new palette for each feature.

## Avoid generic AI visual defaults

Do not add these patterns without a product-specific reason:

- Identical rounded cards for every piece of information.
- Gradient washes, glassmorphism, excessive blur, or soft shadows used as decoration.
- An all-caps eyebrow above every heading, arbitrary `01 / 02 / 03` markers, or labels that add no information.
- Center-aligning the whole page, oversized hero copy, or a dashboard assembled from interchangeable stat cards.
- Purple-on-white gradients, random accent colors, monospace labels, and decorative arrows as default styling.
- Hover animations on every element or repeated fade-and-slide entrances.

Spend visual boldness in one intentional place and keep the supporting interface quiet. Borders, dividers, badges, and numbering must communicate structure or state, not fill empty space.

## Tailwind and shadcn conventions

- Use Tailwind utilities for layout, spacing, responsive behavior, state, and small local adjustments.
- Prefer semantic utilities such as `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, and `bg-primary` over arbitrary hex values in JSX.
- Define reusable colors, radii, and typography tokens in `src/styles/globals.css`; do not scatter design tokens across component files.
- Use `cn` from `@/lib/utils.js` for conditional or composed classes.
- Use and extend primitives in `src/components/ui`. Add variants to an existing shadcn component before creating another button, input, card, or dialog implementation.
- Keep feature-specific composition in `src/features/<feature>` and keep shared UI primitives free of customer or simulation business rules.
- Avoid inline styles unless a value is genuinely data-driven and cannot be expressed safely through the token system.
- Keep repeated class groups in a named component or variant rather than copying long strings across files.

## Responsive and accessible behavior

- Design mobile-first. Check the layout at a narrow phone width, a tablet width, and a wide desktop width.
- Preserve readable line lengths, deliberate spacing, and clear hierarchy as columns collapse.
- Make controls keyboard reachable with visible focus states. Use labels, semantic elements, accessible names, and appropriate ARIA only when native semantics are insufficient.
- Ensure text and controls have sufficient contrast in both light and dark modes if dark mode is exposed.
- Respect `prefers-reduced-motion`; motion should explain a state change or user action, not decorate the page.
- Keep touch targets comfortable and never rely on hover to reveal essential information.

## Interface writing and states

- Write every user-facing text as part of a finished business application. Apply this to headings, descriptions, navigation, forms, empty states, notifications, errors, tooltips, and footers.
- Prefer functional titles and concrete instructions. Each text must identify information, explain an action, clarify a cost or state, or help the user make a decision. Remove text that only decorates the interface.
- Do not generate filler slogans, promotional promises, motivational phrases, or generic AI-style copy. For example, use “Clientes y presupuestos” instead of “Cada suscripción, a medida”. Do not replace a removed slogan with another slogan.
- Do not describe the application in the interface as a demo, prototype, technical test, developer project, or local environment. Avoid labels such as “Espacio comercial local”, “para esta prueba”, or “datos guardados en este equipo” when they merely expose development context.
- Keep implementation limitations and evaluation context in the README and engineering documentation. Preserve user-relevant qualifications about estimated prices, taxes, exchange rates, or service availability in neutral product language. A production tone must not invent capabilities, security guarantees, or regulatory compliance.
- Preserve wording explicitly approved by the user. In the current empty state, keep “El siguiente presupuesto empieza con un cliente” unless the user later asks to change it; this specific exception does not authorize new slogans elsewhere.
- Use plain Spanish or the project's established language consistently. Name actions by their outcome: “Guardar simulación”, “Buscar cliente”, or “Reintentar”.
- Keep one action name consistent from button to toast and confirmation message.
- Make empty states useful by explaining what is missing and what the user can do next.
- Make errors specific and actionable without exposing implementation details or sensitive data.
- Do not use fake customer data as if it were real. Label fixtures and placeholder content clearly.

## Visual review before handoff

- Review visible copy as well as layout: remove filler slogans and development/demo references, check that every sentence serves a user task, and preserve explicitly approved wording.
- Review the rendered screen at mobile, tablet, and desktop widths.
- Check overflow, clipping, wrapping, focus visibility, contrast, empty/loading/error states, and the visual hierarchy of the primary action.
- Remove one decorative element if it does not improve comprehension.
- Run `npm run build` after UI changes and report any unverified interaction or accessibility assumption.
