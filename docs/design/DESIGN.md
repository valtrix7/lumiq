# Lumiq Design System

> Dark cinematic AI studio for live-commerce intelligence. Lumiq finds signal inside live media, turns moments into polished clips, and proves every output through visible lineage.

## 1. Brand Direction

**App name:** Lumiq  
**Meaning direction:** luminous + unique + premium AI intelligence.

Lumiq should feel like a dark, premium AI media studio. The first impression should be cinematic, focused, and intelligent: a black media canvas, deep royal-blue actions, crisp operational panels, and rare flat gradient treatments that signal AI value without becoming decorative noise.

The product is not just a creative playground. It is a live-commerce moment vault. The UI must balance two moods:

1. **Cinematic AI studio** — big video previews, polished media cards, dark surfaces, minimal noise.
2. **Operational provenance system** — timelines, lineage chains, B2 asset references, run IDs, status chips, QA states, and review controls.

Lumiq’s design language should never feel like a generic colorful AI dashboard. It should feel like **premium live-media infrastructure**.

---

## 2. Locked Design Decisions

```txt
1A  — Dark cinematic AI studio
2B  — Lumiq-specific deep royal/cobalt accent, with strict semantic statuses
3   — Lumiq = luminous + unique + premium AI-ish
4B  — Mostly monochrome with rare flat spectral gradient moments
5C  — Timeline + media cards
6C  — Adaptive density
7B  — Inter + mono for provenance/run IDs
8C  — Provenance as core visual motif
9B+C — Signal pulse + review card
10C — Precision glass
11  — Deep royal blue primary accent
12  — Flat linear gradients only; no glow, no blur, no aura
13  — Logo/mark direction intentionally undecided
14B — Two-tone headings only for marketing/empty states
15C — Live Studio: large preview + right signals + bottom timeline
16C — Moment Card: media + evidence/provenance split
17C — Raw/enhanced comparison: desktop side-by-side, mobile toggle
18B+C — Compact lineage chain + full node graph in detail
19C — Progressive disclosure for technical IDs
20B — Strict semantic status colors only
21C — Royal/cobalt hybrid accent
22B — Gradient reserved for brand/AI moments only
23C — Rare gradient text only in marketing/onboarding/empty states
24A — Dark mode only
25C — Hybrid shell: top bar + left sidebar
26C — Live Studio as creator control room
27C — Processing steps + lineage-aware artifact creation
28C — Pastel spectral primary gradient, hot pink/red rare
29A — Flat gradients only: no glow, no blur, no aura
30B — Precision dark cards + optional flat gradient hairline
31B — Royal blue controls primary actions + active live detection states
32C — Flat pastel gradient for hairlines and small surfaces only
33C — Pure black media canvas + near-black app shell panels
34C — Darker shell surfaces, readable elevated cards
35C — Borders for functional panels, none for pure media cards
36B — Selected/AI-active cards use flat gradient hairline
37B — Muted semantic status chips
38C — Signal tracks in detection screens, simple timeline elsewhere
39C — Catalog = precise tables + rich product/media cards
40C — Same design tokens, compact operational admin density
41B — shadcn-compatible + Tailwind v4
42B — Four files + component examples in this DESIGN.md
43C — Hex primary, future OKLCH metadata allowed
44C — Cinematic display scale + compact app labels
45B — Minimal motion tokens
46A — Reduced-motion required
47C — Line icons + filled media controls
48C — Operational charts use semantic colors; lineage can use gradient sequence
49C — Strict tokens + documented exceptions
```

---

## 3. Visual Principles

### 3.1 Dark-only

Lumiq is a dark-only product. No full light mode is planned for the core app.

Use pure black for cinematic media spaces and near-black panels for the app shell. Dark-only is part of the product identity: the UI should disappear so live video, clips, timeline signals, and provenance stand out.

### 3.2 Royal blue as action + live signal

The primary accent is a deep royal/cobalt blue. It is used for primary buttons, selected navigation, active controls, live-detection markers, current timeline segments, processing states, focus rings, and selected cards when gradient hairline is not appropriate.

It must not become a decorative wash.

### 3.3 Flat gradients, never glow

Lumiq uses flat linear gradients for premium AI/brand moments.

Allowed gradient uses:

- selected AI card hairline,
- empty-state mark,
- onboarding success element,
- small AI badge,
- lineage route highlight,
- marketing hero accent,
- rare gradient word in marketing/empty-state copy.

Forbidden gradient uses:

- blurred gradient blobs,
- glow effects,
- aura backgrounds,
- page-wide gradient backgrounds,
- neon edges,
- animated gradient haze,
- gradient shadows,
- noisy rainbow charts.

### 3.4 Provenance is visual, not buried

The product differentiator is not “AI made a clip.” It is:

```txt
raw source → live transformed → enhanced master → publish package
```

This chain should appear repeatedly: compact lineage chains inside moment cards, full node graphs inside detail views, processing state chains during generation, provenance badges on publish/share pages, and audit panels for admins.

### 3.5 Media-first, decision-aware

Every moment is both a piece of media and a decision record. Moment cards should not be only thumbnails. They must show evidence, score, state, product grounding, QA status, and lineage.

### 3.6 Premium operational density

Different surfaces have different density:

- **Marketing / empty states:** spacious, cinematic, two-tone headings.
- **Live Studio / Review:** medium density, large previews, visible timeline.
- **Admin / Recovery / Audit:** compact density, tables, logs, filters, IDs.

All densities use the same tokens.

---

## 4. Color System

## 4.1 Primitive Colors

| Name | Value | Role |
|---|---:|---|
| Canvas Black | `#000000` | Pure media canvas, page background, cinematic void |
| Shell Black | `#050506` | App shell background, sidebar/topbar foundation |
| Panel Black | `#0B0B0D` | Main workspace panels |
| Surface One | `#111114` | Default cards and secondary panels |
| Surface Two | `#18181D` | Raised cards, hover surfaces |
| Surface Three | `#212129` | High-emphasis panels, selected surfaces |
| Surface Four | `#292934` | Floating/popover surfaces |
| Border Subtle | `rgba(255,255,255,0.08)` | Subtle functional panel edges |
| Border Medium | `rgba(255,255,255,0.14)` | Stronger panel boundaries |
| Text Primary | `#FFFFFF` | Headings, high-emphasis labels, buttons |
| Text Secondary | `#B7B7C2` | Body copy, secondary labels |
| Text Muted | `#8C8C99` | Metadata, helper text |
| Text Faint | `#5E5E6B` | Lowest emphasis, disabled copy |
| Royal Blue | `#365CFF` | Primary actions, active live detection, selected states |
| Royal Blue Hover | `#4C6DFF` | Hover state |
| Royal Blue Pressed | `#2948D8` | Pressed state |
| Royal Blue Soft | `rgba(54,92,255,0.14)` | Active background tint |

## 4.2 Gradient System

### Spectral Pastel Gradient

Primary Lumiq gradient:

```css
linear-gradient(to right, #f6d1ac, #f3b5d2, #c7b8f5, #a7eadc, #afcdf6)
```

Use for AI-active hairline borders, onboarding success marks, empty-state illustration strokes, lineage route highlights, rare marketing text fill, and small AI badges.

### Ember Rose Gradient

Rare high-energy gradient:

```css
linear-gradient(to right, #fc6767, #ec008c)
```

Use sparingly for marketing experiments or rare “hot moment” badges. Do not use for errors or destructive actions.

### Gradient Rules

Do: use gradients flat, in 1px hairlines, in small chips, or in rare display text.  
Do not: blur gradients, add glow, add text shadow, use gradients as full-page backgrounds, use gradients for normal buttons, use gradients for operational charts, or use gradients for warning/error states.

## 4.3 Semantic Status Colors

Status colors are muted and functional.

| Status | Text | Background | Border |
|---|---:|---:|---:|
| Success | `#7BE7A1` | `rgba(123,231,161,0.10)` | `rgba(123,231,161,0.20)` |
| Warning | `#FFD27A` | `rgba(255,210,122,0.10)` | `rgba(255,210,122,0.20)` |
| Danger | `#FF7A8A` | `rgba(255,122,138,0.10)` | `rgba(255,122,138,0.20)` |
| Processing | `#8FA4FF` | `rgba(54,92,255,0.12)` | `rgba(54,92,255,0.24)` |
| Neutral | `#B7B7C2` | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.10)` |

Status colors should appear as chips, dots, timeline markers, or chart series. They should not become large tinted panels.

---

## 5. Typography

## 5.1 Font Families

### UI Font

**Inter**

Use for all app UI, body text, buttons, navigation, tables, and headings.

Fallback:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

### Mono Font

**Geist Mono / IBM Plex Mono**

Use for run IDs, asset IDs, B2 keys, checksums, timestamps, JSON preview snippets, manifest metadata, and audit logs.

Fallback:

```css
"Geist Mono", "IBM Plex Mono", "SFMono-Regular", Consolas, monospace
```

## 5.2 Type Scale

| Token | Size | Line Height | Weight | Tracking | Use |
|---|---:|---:|---:|---:|---|
| `display` | 52px | 1.08 | 700 | -3.1px | Marketing hero / empty-state hero |
| `heading-xl` | 40px | 1.12 | 700 | -1.9px | Major sections |
| `heading-lg` | 32px | 1.16 | 700 | -1.2px | Product page titles |
| `heading-md` | 24px | 1.22 | 650 | -0.7px | Panel titles / modal headers |
| `heading-sm` | 20px | 1.28 | 650 | -0.45px | Section headers |
| `body-lg` | 18px | 1.45 | 400 | -0.25px | Intro copy |
| `body` | 14px | 1.5 | 400 | -0.14px | Default app text |
| `body-sm` | 13px | 1.46 | 400 | -0.08px | Dense panels |
| `label` | 12px | 1.35 | 500 | -0.04px | Labels, chips, metadata |
| `caption` | 11px | 1.3 | 500 | 0px | Timestamps, tiny metadata |
| `micro` | 10px | 1.25 | 600 | 0.02em | Badges, status dots |

## 5.3 Two-tone Heading Rule

Use two-tone headings only for marketing pages, empty states, onboarding, hero panels, and “nothing here yet” moments.

Pattern:

```txt
Line 1: white statement
Line 2: muted gray context
```

Do not use large two-tone headings inside dense product screens where users need compact navigation.

---

## 6. Spacing, Radius, and Layout

## 6.1 Spacing Scale

Base unit: **4px**

| Token | Value |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |

## 6.2 Radius Scale

| Token | Value | Use |
|---|---:|---|
| `radius-xs` | 4px | tiny controls, table pills |
| `radius-sm` | 7px | buttons, badges |
| `radius-md` | 10px | cards, inputs |
| `radius-lg` | 14px | panels |
| `radius-xl` | 18px | media cards, large cards |
| `radius-2xl` | 24px | modals |
| `radius-full` | 999px | pills, circular avatars |

## 6.3 Layout Tokens

| Token | Value | Use |
|---|---:|---|
| `sidebar-width` | 248px | desktop app sidebar |
| `topbar-height` | 64px | app topbar |
| `workspace-max-width` | 1440px | main workspace |
| `content-max-width` | 1280px | marketing/content |
| `panel-padding` | 16px | standard panel |
| `card-padding` | 14px | card content |
| `section-gap` | 96px | marketing section gap |

---

## 7. Surface System

## 7.1 Surface Levels

| Level | Token | Value | Use |
|---:|---|---:|---|
| 0 | `surface-canvas` | `#000000` | media canvas, full-bleed preview, marketing background |
| 1 | `surface-shell` | `#050506` | app shell, sidebar/topbar base |
| 2 | `surface-panel` | `#0B0B0D` | workspace panels |
| 3 | `surface-card` | `#111114` | default functional cards |
| 4 | `surface-raised` | `#18181D` | hover/raised surfaces |
| 5 | `surface-elevated` | `#212129` | selected cards, modal content |
| 6 | `surface-floating` | `#292934` | popovers, dropdowns, tooltips |

## 7.2 Border System

Functional panels:

```css
border: 1px solid rgba(255, 255, 255, 0.08);
```

Selected panels:

```css
border: 1px solid rgba(255, 255, 255, 0.14);
```

AI-active panels:

```css
border: 1px solid transparent;
background:
  linear-gradient(var(--surface-card), var(--surface-card)) padding-box,
  var(--gradient-spectral-pastel) border-box;
```

Media cards have no border by default. Video/image content defines the edge.

## 7.3 Shadow System

Shadows are minimal.

Allowed: subtle floating menu shadow, media overlay shadow, modal shadow.  
Forbidden: glow shadows.

```css
--shadow-popover: 0 16px 40px rgba(0, 0, 0, 0.42);
--shadow-modal: 0 24px 80px rgba(0, 0, 0, 0.55);
```

---

## 8. Motion System

## 8.1 Motion Tokens

| Token | Value | Use |
|---|---:|---|
| `duration-fast` | 120ms | hover/focus |
| `duration-base` | 180ms | panels, chips |
| `duration-slow` | 280ms | modal/panel entrance |
| `ease-standard` | cubic-bezier(0.2, 0, 0, 1) | default |
| `ease-emphasized` | cubic-bezier(0.16, 1, 0.3, 1) | panel entrance |
| `ease-linear` | linear | progress loops |

## 8.2 Allowed Motion

Allowed: timeline pulse marker, processing step progress, candidate card entrance, panel fade/slide, hover border transition, video play/pause control state.

Forbidden: glowing pulsing gradients, large parallax backgrounds, constant distracting animation, animated rainbow backgrounds.

## 8.3 Reduced Motion

When `prefers-reduced-motion: reduce` is active:

- remove timeline pulses,
- replace loops with static states,
- remove panel slide movement,
- keep instant/fade-only transitions under 100ms,
- preserve state change through color/chip/text.

---

## 9. Iconography

Use mostly line icons.

Recommended style:

- Lucide-style line icons,
- 1.5px stroke,
- rounded stroke caps,
- 16px and 18px common sizes,
- 20px for sidebar,
- 24px for media controls.

Filled icons are allowed only for play, pause, record, capture, publish, and critical media controls.

---

## 10. Component System

## 10.1 Primary Button

Use for main actions: Start session, Capture moment, Generate clip, Approve, Create publish package.

Style:

```css
background: var(--color-royal-blue);
color: var(--color-text-primary);
border-radius: var(--radius-sm);
font-size: var(--text-body);
font-weight: 500;
height: 36px;
padding: 0 14px;
border: none;
```

Hover uses `--color-royal-blue-hover`. Pressed uses `--color-royal-blue-pressed`.

Do not use gradient primary buttons.

## 10.2 Secondary Button

Use for secondary actions: Rerender, Export, View manifest, Compare, Open details.

```css
background: var(--surface-raised);
color: var(--color-text-primary);
border: 1px solid var(--border-subtle);
border-radius: var(--radius-sm);
height: 36px;
padding: 0 14px;
```

## 10.3 Ghost Button

Use for tertiary actions.

```css
background: transparent;
color: var(--color-text-secondary);
border: 1px solid transparent;
```

Hover:

```css
background: var(--surface-card);
color: var(--color-text-primary);
```

## 10.4 Status Chip

Muted semantic chips.

```css
display: inline-flex;
align-items: center;
gap: 6px;
height: 24px;
padding: 0 9px;
border-radius: var(--radius-full);
font-size: var(--text-label);
font-weight: 500;
```

Statuses: Ready, Processing, QA passed, QA failed, Review required, Published, Failed, DLQ.

## 10.5 AI Badge

A small special badge for AI-generated or AI-selected states.

```css
background: var(--gradient-spectral-pastel);
color: #060607;
border-radius: var(--radius-full);
font-size: var(--text-caption);
font-weight: 700;
height: 22px;
padding: 0 8px;
```

Use sparingly.

## 10.6 Moment Card

A moment card must communicate:

- media preview,
- moment type,
- confidence score,
- product match,
- QA state,
- raw/enhanced status,
- lineage chain,
- primary action.

Recommended structure:

```txt
MomentCard
  Media preview
  Top-right status chip
  Title / moment type
  Evidence summary
  Product chip
  Lineage mini-chain
  Actions
```

Default card:

```css
background: var(--surface-card);
border: 1px solid var(--border-subtle);
border-radius: var(--radius-lg);
padding: var(--space-3);
```

AI-active card:

```css
border: 1px solid transparent;
background:
  linear-gradient(var(--surface-card), var(--surface-card)) padding-box,
  var(--gradient-spectral-pastel) border-box;
```

## 10.7 Lineage Chain

Compact chain inside cards:

```txt
Raw → Transform → Enhance → Publish
```

Rules:

- nodes are small circles or rounded chips,
- current step uses royal blue,
- completed steps use muted success,
- inactive steps use border-subtle,
- AI-active path may use a flat gradient line,
- no glow.

## 10.8 Full Provenance Graph

Detail view graph:

```txt
raw_source_clip
  ↓
live_transformed_clip optional
  ↓
raw_mezzanine
  ↓
genblaze_run
  ↓
enhanced_master
  ↓
publish_package
```

Each node shows asset role, short asset ID, status, checksum availability, provider/model if relevant, and a click target to expand technical details.

## 10.9 Live Studio Shell

Desktop layout:

```txt
Topbar:
  org/session controls, budget, publish status

Left Sidebar:
  Studio, Vault, Review, Catalog, Templates, Analytics, Admin, Settings

Main:
  large video preview

Right Rail:
  detected moments, signal feed, product context, active policy

Bottom:
  timeline with signal tracks and candidate markers
```

## 10.10 Timeline

Live Studio timeline:

- supports waveform-like signal tracks,
- detected moments show pulse markers,
- current capture window highlighted,
- active segment uses royal blue,
- candidate intelligence markers may use flat spectral gradient,
- no glow.

Review timeline:

- simpler,
- accepted/rejected markers,
- raw capture windows,
- transcript snippets,
- QA status markers.

## 10.11 Raw vs Enhanced Compare

Desktop:

```txt
Raw source player | Enhanced master player
```

Mobile/tight layout:

```txt
Single player with segmented toggle:
Raw / Enhanced / Published
```

## 10.12 Admin Tables

Admin/Recovery UI uses compact density.

Rules:

- 13px body,
- 11–12px metadata,
- mono IDs,
- sticky table header,
- status chips,
- expandable details,
- no gradient except AI/provenance indicators.

---

## 11. Page and Screen Patterns

## 11.1 App Shell

Use hybrid navigation:

- top bar for organization/session/global actions,
- left sidebar for sections.

Sidebar sections:

```txt
Studio
Vault
Review
Catalog
Campaigns
Templates
Analytics
Admin
Settings
```

## 11.2 Live Studio

Primary goals:

- make video dominant,
- show AI signal detection,
- expose candidate moments,
- allow capture/generation actions,
- show budget and connection health.

## 11.3 Moment Vault

Primary goals:

- browse captured/generated moments,
- search/filter,
- compare raw/enhanced,
- inspect lineage,
- approve/publish.

View options:

- grid cards,
- session timeline,
- product/campaign grouping.

## 11.4 Review Queue

Primary goals:

- approve/reject/rerender,
- inspect QA evidence,
- confirm product facts,
- promote canonical version,
- create publish package.

## 11.5 Catalog

Hybrid table + cards:

- tables for SKU, price, inventory, claims,
- cards for product media,
- campaign badges,
- snapshot history.

## 11.6 Admin / Recovery

Compact technical layout:

- DLQ viewer,
- stuck moments,
- failed runs,
- B2 reconciliation,
- budget anomalies,
- audit search.

---

## 12. Data Visualization

Operational charts use semantic colors: success, warning, danger, processing, neutral.

Use pastel gradient sequence only for provenance paths, AI/media lineage, and moment intelligence visualization. Do not use it for cost charts, error rates, or QA failure charts.

---

## 13. Accessibility

Minimum requirements:

- dark contrast ratios must support readable text,
- body text should not use `#5E5E6B` on black for important copy,
- focus states must be visible with royal blue ring,
- all icon-only buttons need accessible labels,
- timeline markers need text equivalents,
- status colors must be paired with labels/icons,
- reduced motion must disable pulses and loops,
- gradient text must not be used for essential dense UI labels.

Focus ring:

```css
outline: 2px solid var(--color-royal-blue);
outline-offset: 2px;
```

---

## 14. Agent Implementation Rules

Coding/design agents must follow these rules.

### 14.1 Strict Token Use

Agents must not introduce new colors, gradients, radii, shadows, fonts, background effects, or animation curves.

### 14.2 Allowed Exceptions

Agents may use non-token colors only inside user-uploaded media, video/image thumbnails, generated media previews, product photos, approved charts, and external logos.

### 14.3 Required Component Behavior

Agents must:

- use `variables.css` semantic variables for components,
- use `theme.css` Tailwind variables for utilities,
- use `tokens.json` as the source token inventory,
- use `DESIGN.md` for component and UX rules,
- keep gradients flat,
- avoid glow,
- keep primary actions royal blue,
- use mono font for technical IDs,
- show lineage for generated assets.

### 14.4 Forbidden Design Drift

Do not:

- add cyan/violet glow,
- add neon aura,
- use gradient buttons as default CTA,
- create a light mode,
- make admin UI colorful,
- use body text in pure white,
- hide provenance completely,
- use rounded values outside the radius scale,
- add random shadows to cards.

---

## 15. Quick Component Prompts for Agents

### Hero / Empty State

Create a dark-only Lumiq empty state on pure black. Use a two-line heading: first line white, second line muted gray. Add one rare gradient word only if it improves brand feel. Use a small flat spectral gradient badge or hairline. No glow, no blur.

### Primary Button

Create a 36px high button with deep royal blue background, white text, 7px radius, 14px Inter medium. No gradient, no shadow.

### AI-Active Moment Card

Create a dark card with media preview, evidence summary, QA status chip, product chip, and a compact lineage chain. Use a flat spectral 1px gradient hairline only for the selected/AI-active state. No glow.

### Provenance Detail

Create a node graph showing raw source → transformed optional → mezzanine → Genblaze run → enhanced master → publish package. Use small nodes, mono IDs, and expandable technical rows.

### Live Studio

Create a creator control room with topbar, left sidebar, large video preview, right signal feed, and bottom timeline. Active moment markers use royal blue. Candidate intelligence markers may use flat spectral gradient. No glow.

---

## 16. Design QA Checklist

Before shipping any Lumiq UI, check:

```txt
[ ] Dark mode only
[ ] No glow gradients
[ ] No blurred gradient backgrounds
[ ] Primary actions use royal blue
[ ] Gradients are rare and flat
[ ] Functional panels use subtle borders
[ ] Media cards do not have unnecessary frames
[ ] Moment cards show evidence/provenance
[ ] Technical IDs use mono
[ ] Status colors are muted and semantic
[ ] Reduced motion behavior exists
[ ] Tokens used instead of arbitrary values
[ ] Admin surfaces are compact but still Lumiq-branded
[ ] Product/catalog surfaces balance table precision and media cards
```
