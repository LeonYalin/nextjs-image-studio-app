---
name: imagegallery-design
description: Generate well-branded ImageGallery interfaces and assets — production code or throwaway prototypes. Contains design guidelines, tokens, fonts, assets, and UI components. Use whenever building or restyling any ImageGallery screen, component, slide, or mock.
user-invocable: true
---

Read `design-system/README.md`, then explore `design-system/colors_and_type.css` and
`design-system/ui_kits/imagegallery/`.

When writing **production code** in this repo: use the shadcn/ui components in
`src/components/ui` and style them with the tokens in `src/app/globals.css` (the v2
"Aperture" theme). Never invent colors — every value has a token.

When making **throwaway artifacts** (mocks, slides, prototypes): copy assets out and
produce static HTML referencing `design-system/colors_and_type.css`, or lift the JSX
components from the UI kit.

After any UI work, invoke the **design-reviewer** subagent to check brand consistency.

## Non-negotiables (full detail in design-system/README.md)

- Keep shadcn components; restyle via tokens only.
- Two surfaces: light app/gallery, ink (`#0c0d0f`) immersive lightbox.
- One interactive accent — **blue-600**. Quartet (blue/green/amber/red) is brand sparkle
  only. Destructive = red, tinted until confirm.
- Bricolage Grotesque headings + Geist UI/body + Geist Mono.
- Justified-rows gallery (real aspect ratios) · mosaic album covers · 12px radius base ·
  full-pill nav/avatars · soft elevation · ease-out motion (~150–350ms), no bounces.
- Lucide icons (2px). Copy: sentence case, "you"-voiced, calm, no emoji.

If invoked with no other guidance, ask what the user wants to build, ask a few questions,
and act as an expert designer outputting HTML artifacts or production code as needed.
