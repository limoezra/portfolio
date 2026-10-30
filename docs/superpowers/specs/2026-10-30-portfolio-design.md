# Portfolio + Profile README: "Noise → Forecast"

Date: 2026-10-30 · Owner: Ezra Kiplimo Kipruto (limoezra) · Reviewer: bravomesh

## Goal

A professional, animated portfolio that tells one story:
**"I teach models to turn noise into rainfall forecasts for the Greater Horn of Africa, and I map who is most at risk."**
Machine Learning Scientist, GIS Analyst and Statistician at IGAD-ICPAC, Nairobi.

The core metaphor comes from Ezra's cGAN work: the generator turns coarse forecasts plus random noise into sharp rainfall fields.
The site does the same visually: things start as noise and settle into clear pictures.

## Decisions (approved 2026-10-30)

| Topic | Decision |
|---|---|
| Direction | "Noise → Forecast": rain-field canvas hero, scroll-driven downscaling, vulnerability layer stack |
| Stack | Astro 7 (static) + GSAP 3.15 (ScrollTrigger, ScrambleText) + Lenis. Same toolkit as bravomesh's site so he can review it; different design |
| Address | `limoezra/portfolio` → `https://limoezra.github.io/portfolio/`. Old `limoezra.github.io` becomes a redirect once the new site is live (CV link keeps working) |
| Reviews | bravomesh = collaborator (write) on `portfolio` and `limoezra`. `CODEOWNERS` = `* @bravomesh`. `main` protected: PR + 1 code-owner approval, enforced for admins too |
| Git auth | One-off GitHub CLI login as limoezra; credential helper set per repo only. Remove after (`gh auth logout`, `brew uninstall gh`) |
| Commits | Author `Ezra Kiplimo Kipruto <ezralimo548@gmail.com>`, set in each repo's local config |

## What is different from bravomesh's site

No globe, no amber, no serif display font, no custom cursor, no preloader, no slide-up SplitText.
Ours: flat raster maps, rain colour ramp, grotesque display font, scramble-to-text headings, cursor adds rain to the map.

## Visual system

- **Themes:** "Night rain" (default dark: deep indigo `#0a0d1f`-ish bg, cool off-white text) and "Morning bulletin" (light: pale blue-white paper, ink text). Toggle stored in `localStorage` (wrapped in try/catch), default from `prefers-color-scheme`.
- **Accent:** precipitation ramp cyan `#3fd0f0` → blue → violet `#8b5cf6`, used for data and highlights. Hazard ramp (yellow → orange → red) only in the vulnerability section.
- **Type:** Bricolage Grotesque Variable (display), IBM Plex Sans (body), IBM Plex Mono (data labels, coordinates). Self-hosted via Fontsource.
- **Texture:** faint 0.1° model grid in the background; mono labels like `0.1° · 384×352` as ornaments.
- Contrast AA in both themes, visible focus, no horizontal scroll at 360 px.

## Signature motion

1. **Hero rain field.** Canvas map of the 11 ICPAC countries. Cells start as grey static and settle (per-cell random delay) into a rainfall field coloured with the ramp; then the field drifts slowly. Pointer over the map adds rain locally (decays). Button **"New sample (n/5)"** re-seeds the field, like a GAN ensemble member.
2. **Scramble headings.** Section titles resolve from random glyphs into words (GSAP ScrambleText), once, on enter.
3. **Downscaling (pinned on desktop).** Same field rendered at ~1° → 0.25° → 0.1° blocks as you scroll, with labels "IFS forecast" → "cGAN output". Copy tells the SEWAA RFE2 story. Mobile: no pin, steps through on enter.
4. **Vulnerability stack.** Three isometric layers (Exposure, Susceptibility, Resilience) separate in 3D, then collapse into one Vulnerability layer as you scroll. Labelled "illustrative data". Ezra's real Somalia exposure map shown beside it.
5. **Experience.** Each role's marker drops in like a raindrop along the timeline.
6. Count-up stats, gentle fade-ins, Lenis smooth scroll.
7. `prefers-reduced-motion: reduce` → no Lenis, no pinning, no scramble; everything rendered in its final state.

## Page structure (single page)

1. **Nav:** `EK` monogram · Work · Research · Experience · Contact · theme toggle.
2. **Hero:** name, "Machine Learning Scientist · GIS · Statistician", one-line pitch, CTAs (See my work / Get in touch), "IGAD-ICPAC · Nairobi", rain-field canvas + sample button.
3. **About:** photo (`passport 2.jpg`), short bio, quick facts (5+ years, BSc Statistics JKUAT, trains member states in Python, 11 countries).
4. **Downscaling: SEWAA cGAN (centrepiece 1):** WGAN-GP retrained on RFE2 daily rainfall; 8 input channels (tp, t2m, tcwv, sp × mean/std) + elevation + land-sea mask; 384×352 grid at 0.1°; trained 2018–2021, test 2023+; CRPS/RMSE evaluation. Link: github.com/limoezra/SEWAA-forecasts-RFE2.
5. **Vulnerability profiles (centrepiece 2):** flood and drought layers for IGAD countries from Exposure, Susceptibility, Resilience; data from MODIS, Sentinel, Landsat, GEE, CDI/VCI; QGIS, ArcGIS, R tmap; automation in R and Python. Real Somalia exposure map. Ties to the UNU-EHS publication.
6. **More work:** INAR model for childhood obesity prevalence (Sep 2023), house price factors analysis (Jun 2023), GAO Tek e-commerce site (Feb 2024).
7. **Publications:**
   - Pfeiffer, S., Kiplimo, E. et al. (2025). *Bridging the gaps: Vulnerability profiles to strengthen impact-based early warning and early action for floods and droughts in Kenya.* UNU-EHS, Bonn.
   - Sabiiti, G., Amdihun, A., Wekesa, K., Igbokwe, V., Kiplimo, E. (2026). *Towards Anticipatory Disaster Risk Financing and Index Insurance Mechanisms for Resilience Building in Eastern Africa.*
8. **Experience & education:** ML Scientist, ICPAC (Oct 2025–) · GIS Analyst, ICPAC (Oct 2024–) · Data Contributor, DataForce (Aug 2024–) · Field Data Officer, Ministry of Labour (May–Jul 2024) · Data Intern / Statistician, Elgeyo Marakwet County (May–Aug 2023) · Clerk, IEBC (Aug–Sep 2022) · Data Analyst, Upwork (Dec 2020–Feb 2021). BSc Statistics, JKUAT (2020–2024). Certifications: ECMWF Earth System Modelling, RCMRD GIS in Conservation Mapping, WISER climate partnership, Tata data visualisation simulation, freeCodeCamp data analysis.
9. **Toolbox:** ML (TensorFlow/Keras, cGAN/WGAN-GP, scikit-learn) · Geospatial (QGIS, ArcGIS/ArcMap, Google Earth Engine, Sentinel/MODIS/Landsat, NetCDF, R tmap) · Data (Python, pandas, NumPy, R, SQL) · Visualisation (Matplotlib, ggplot2, Tableau, Power BI).
10. **Contact:** email `ezralimo548@gmail.com` (copy button + mailto), LinkedIn, GitHub. Footer with back-to-top.

**Privacy:** no phone number, no references, no CV PDF (it contains referees' personal contacts).

## Architecture

```
astro.config.mjs        site: https://limoezra.github.io, base: /portfolio
src/
  data/site.ts          ALL copy and facts: one place to correct
  data/horn.ts          build-time: world-atlas 50m → 11 ICPAC countries → land mask grid + SVG outline (d3-geo); nothing heavy ships to the browser
  layouts/Base.astro    head, fonts, theme bootstrap
  components/           one .astro per section
  scripts/
    field.ts            pure: seeded RNG, value-noise rain field, block-average downscale, colour ramps
    rain.ts             canvas renderer: denoise intro, drift, pointer rain, re-seed, downscale steps
    motion.ts           Lenis + GSAP setup, scramble headings, reveals, counters, vulnerability stack
  styles/global.css     tokens (both themes), base, utilities
  assets/               ezra.jpg (from passport 2.jpg), somalia-exposure.png (resized)
test/field.test.ts      node --test: block average, ramp bounds, seeded determinism
.github/workflows/deploy.yml   withastro/action → deploy-pages on push to main
.github/CODEOWNERS      * @bravomesh
```

- Field grid ~ 176 × 192 cells over lon 19.15–54.25, lat −13.65–24.65 (the cGAN domain), masked to land.
- Canvas draws at cell resolution into an offscreen buffer, scaled up with `imageSmoothingEnabled = false` for crisp pixels. Animation pauses when off-screen (IntersectionObserver) and when the tab is hidden.
- No framework islands; vanilla TS in Astro `<script>` tags.
- Pages source set to "GitHub Actions" via API (`POST /repos/limoezra/portfolio/pages`, `build_type=workflow`).

## Profile README (`limoezra/limoezra`)

- `assets/banner.svg`: animated SVG (CSS keyframes inside the SVG, which GitHub renders in `<img>`). Rain pixels fall and settle into "Ezra Kiplimo"; subtitle "ML Scientist · GIS · Statistician". Dark/light variants via `<picture>`.
- Badges: Portfolio, LinkedIn, Email.
- Sections: Now (ICPAC, SEWAA cGAN, vulnerability profiles, training member states) · Featured work (table linking repos) · Publications · Toolbox (shields.io badges).
- Different layout from bravomesh's README: no workstation GIF, no two-column stack table.

## Rollout order

1. Invite bravomesh (write) to `portfolio` and `limoezra`.
2. First commit to `main` in each repo (`CODEOWNERS`, `.gitignore`, this spec); push.
3. Protect `main` in both repos.
4. Build the site on `feat/site`; open PR; reviewer bravomesh.
5. Build the README on `feat/readme`; open PR; reviewer bravomesh.
6. After approval + merge, the workflow deploys the site. Verify it is live.
7. Replace `limoezra.github.io/index.html` with a redirect to `/portfolio/` (direct commit; that repo is not protected).
8. Remind owner: `gh auth logout`, `brew uninstall gh`.

## Quality bar

- `npm run build` and `npm test` pass.
- Checked in Chrome on desktop and 360 px width, both themes, reduced motion.
- Keyboard navigable, semantic landmarks, alt text.

## Content to verify (owner)

All in `src/data/site.ts`:
- Pitch line and bio wording.
- Stats (5+ years, 11 countries, number of member states trained).
- Descriptions of INAR, house prices and GAO Tek projects (no public links known).
- Toolbox list (TensorFlow/Keras inferred from the cGAN repo).
- Whether the 2026 publication has a link/DOI.
