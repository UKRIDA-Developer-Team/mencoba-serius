# Chef on Pointe — UI Style Guidelines

> **Brand essence:** Artisanal warmth meets ballet-inspired elegance. Every screen should feel like a beautifully plated dessert — refined, inviting, and made with love.

---

## 1. Color Palette

The palette is drawn directly from the logo: rich chocolate brown, soft lavender, and creamy whites. Together they evoke warmth, femininity, and handcrafted quality.

### Primary Colors

| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary | Chocolate Brown | `#3D1A1A` | Brand text, headings, outlines, key icons |
| Accent | Lavender | `#A48BBF` | Silhouettes, illustrations, active states, highlights |
| Surface | Lavender Mist | `#D6C8E8` | Ribbon backgrounds, card tints, subtle section fills |

### Neutral / Background Colors

| Role | Name | Hex | Usage |
|---|---|---|---|
| Background | Ivory White | `#FDFAF7` | Page/app background — warm, not harsh white |
| Surface | Cream | `#F5EFE6` | Card backgrounds, input fields |
| Border | Blush Beige | `#E8DDD0` | Dividers, input borders, subtle separators |

### Semantic Colors

| Role | Name | Hex | Usage |
|---|---|---|---|
| Success | Sage Mint | `#7BAE8F` | Confirmations, order success states |
| Warning | Warm Amber | `#D4935A` | Alerts, low-stock notices |
| Error | Dusty Rose | `#C0646C` | Validation errors, destructive actions |
| Info | Periwinkle | `#8899C4` | Informational banners, tooltips |

### Color Usage Rules

- **Never** place Chocolate Brown text on the Lavender Mist surface without checking contrast (minimum 4.5 : 1 for body text).
- The Ivory White background should be the default; Cream surfaces create depth for cards and modals.
- Lavender is an accent — use it to draw attention, not as a background for long reading passages.
- Maintain at least one "breathing" neutral between two accent elements.

---

## 2. Typography

The logo combines a flowing script for the brand name with spaced uppercase lettering for the tagline. The type system mirrors this contrast: expressive display faces paired with a clean, readable body face.

### Typeface Stack

| Role | Typeface | Fallback | Source |
|---|---|---|---|
| Display / Brand | **Dancing Script** | cursive | Google Fonts |
| Heading | **Playfair Display** | Georgia, serif | Google Fonts |
| Body | **Lato** | Helvetica Neue, sans-serif | Google Fonts |
| Label / Tag | **Montserrat** | Arial, sans-serif | Google Fonts |

> **Why these choices?**
> - *Dancing Script* echoes the hand-lettered "Chef on Pointe" wordmark.
> - *Playfair Display* adds editorial elegance to section titles without feeling heavy.
> - *Lato* keeps body copy clean and legible across all screen sizes.
> - *Montserrat* (all-caps, letter-spaced) mirrors the "MADE WITH LOVE" banner style for labels and tags.

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display-xl` | 56px / 3.5rem | 700 | 1.15 | Hero headlines, brand moments |
| `display-lg` | 40px / 2.5rem | 700 | 1.2 | Page titles (Playfair Display) |
| `heading-1` | 32px / 2rem | 600 | 1.25 | Section headings |
| `heading-2` | 24px / 1.5rem | 600 | 1.3 | Card titles, modal headers |
| `heading-3` | 20px / 1.25rem | 600 | 1.35 | Sub-sections |
| `body-lg` | 18px / 1.125rem | 400 | 1.6 | Lead paragraphs |
| `body` | 16px / 1rem | 400 | 1.6 | Default body copy |
| `body-sm` | 14px / 0.875rem | 400 | 1.55 | Captions, helper text |
| `label` | 12px / 0.75rem | 600 | 1.4 | Labels, tags, badges — Montserrat, all caps, letter-spacing: 0.08em |
| `micro` | 10px / 0.625rem | 500 | 1.4 | Legal text, timestamps |

### Typography Rules

- Use **Dancing Script** exclusively for decorative display moments (hero, logo lockups, pull quotes). Never for body or UI labels.
- **Playfair Display** headings should be set in Chocolate Brown `#3D1A1A` on light backgrounds.
- Body text minimum size is **16px**; never go below 14px for functional UI text.
- All-caps labels (Montserrat) must include `letter-spacing: 0.08em` minimum.
- Avoid bold + italic combined in body copy; use one or the other for emphasis.

---

## 3. Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro gaps (icon + text) |
| `space-2` | 8px | Inner component padding (tight) |
| `space-3` | 12px | Between related elements |
| `space-4` | 16px | Default inner padding |
| `space-5` | 24px | Section sub-divisions |
| `space-6` | 32px | Card padding, modal padding |
| `space-8` | 48px | Between major sections |
| `space-10` | 64px | Page-level vertical rhythm |
| `space-12` | 80px | Hero vertical padding |

- **Base grid:** 8px. All spacing values are multiples of 8px (or 4px for micro adjustments).
- **Max content width:** 1200px, centered, with 24px horizontal gutter on mobile.
- **Column grid:** 12-column on desktop, 4-column on mobile.

---

## 4. Corner Radius & Shape

Rounded, soft shapes mirror the swirling flourishes in the logo.

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Badges, tags, small chips |
| `radius-md` | 12px | Buttons, input fields |
| `radius-lg` | 20px | Cards, modals |
| `radius-xl` | 32px | Hero panels, image containers |
| `radius-full` | 9999px | Pill buttons, avatars, toggles |

---

## 5. Elevation & Shadow

Shadows are warm-tinted (a hint of brown) rather than cold grey, keeping them on-brand.

| Token | Shadow value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(61, 26, 26, 0.08)` | Subtle card lift |
| `shadow-md` | `0 4px 12px rgba(61, 26, 26, 0.12)` | Cards, dropdowns |
| `shadow-lg` | `0 8px 24px rgba(61, 26, 26, 0.16)` | Modals, floating panels |
| `shadow-xl` | `0 16px 48px rgba(61, 26, 26, 0.20)` | Overlays, drawers |

---

## 6. Iconography

- **Style:** Thin-to-medium line icons (1.5–2px stroke). Prefer icons with slightly rounded caps to match the brand warmth.
- **Recommended library:** [Lucide](https://lucide.dev/) or [Heroicons](https://heroicons.com/) (outline style).
- **Color:** Icons inherit the text color of their context. Accent icons use Lavender `#A48BBF`.
- **Size tokens:** 16px (inline), 20px (default UI), 24px (feature icons), 40px (empty-state illustrations).
- Decorative flourish motifs (swirls, vines) from the logo can be used as SVG dividers or section accents — use sparingly and in Chocolate Brown or Lavender only.

---

## 7. Buttons

### Variants

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary | `#3D1A1A` | `#FDFAF7` | — | Main CTA (Order Now, Add to Cart) |
| Secondary | `#A48BBF` | `#FDFAF7` | — | Supporting actions |
| Outline | Transparent | `#3D1A1A` | `1.5px #3D1A1A` | Tertiary / low-emphasis |
| Ghost | Transparent | `#A48BBF` | — | Inline / icon-adjacent actions |
| Danger | `#C0646C` | `#FDFAF7` | — | Destructive actions only |

### States

- **Hover:** 10% lighter background (use `opacity: 0.9` or a tinted variant).
- **Active/Pressed:** 10% darker background + `scale(0.97)` transform.
- **Disabled:** `opacity: 0.4`, `cursor: not-allowed`.
- **Focus:** `outline: 2.5px solid #A48BBF`, `outline-offset: 3px`.

### Sizing

| Size | Height | Padding (H) | Font size | Radius |
|---|---|---|---|---|
| Small | 32px | 12px | 13px | `radius-md` |
| Medium | 40px | 20px | 15px | `radius-md` |
| Large | 48px | 28px | 16px | `radius-md` |
| XL | 56px | 36px | 18px | `radius-lg` |

---

## 8. Form Elements

- **Input fields:** Cream `#F5EFE6` background, Blush Beige `#E8DDD0` border, `radius-md`, 16px body font.
- **Focus ring:** `2px solid #A48BBF`.
- **Label:** Montserrat, 12px, all-caps, Chocolate Brown, `letter-spacing: 0.08em`, 8px above the input.
- **Placeholder:** `#B0A499` (muted warm grey).
- **Error state:** Dusty Rose `#C0646C` border + error message below in 13px body font.
- **Select / Dropdown:** Same styling as inputs; custom chevron icon in Chocolate Brown.
- **Checkbox / Radio:** Custom styled in Lavender `#A48BBF` when checked, Blush Beige border when unchecked.

---

## 9. Cards

```
Background:   #F5EFE6  (Cream)
Border:       1px solid #E8DDD0
Border-radius: radius-lg (20px)
Padding:      space-6 (32px)
Shadow:       shadow-md
```

- **Product cards** may include a thin top border accent in Lavender `#A48BBF` (4px, top edge only).
- Card images use `radius-lg` on top corners, flush to card edges.
- Card titles use **Playfair Display**, `heading-2` scale.

---

## 10. Navigation

- **Top nav background:** Ivory White `#FDFAF7` with `shadow-sm` on scroll.
- **Brand wordmark** in the nav: Dancing Script, 28px, Chocolate Brown.
- **Nav links:** Lato, 15px, Chocolate Brown. Active link has a 2px Lavender underline.
- **Mobile nav:** Full-screen drawer, Cream background, links stacked with 24px vertical spacing.
- **CTA button** in nav (e.g. "Order Now"): Primary button variant, Medium size.

---

## 11. Imagery & Illustrations

- **Photography:** Warm, golden-hour lighting. Avoid cold/blue-toned images. Food photography should feel artisanal and personal.
- **Image overlays:** Use a soft Chocolate Brown gradient (`rgba(61, 26, 26, 0.35)`) for text-over-image situations.
- **Illustrations:** Flat or semi-flat style. Use the brand palette only. Silhouette illustrations (like the ballerina) are always in Lavender `#A48BBF`.
- **Decorative dividers:** Vine/swirl SVGs in Chocolate Brown `#3D1A1A` at 30–40% opacity as section separators.

---

## 12. Motion & Animation

Keep animations graceful — like a ballet performance: deliberate, smooth, never abrupt.

| Type | Duration | Easing | Usage |
|---|---|---|---|
| Micro (hover, focus) | 150ms | `ease-out` | Button hover, link underlines |
| Short (state change) | 250ms | `ease-in-out` | Dropdown open, input focus |
| Medium (transition) | 400ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Page transitions, modal enter |
| Long (entrance) | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero animations, card reveals |

- Use `transform` and `opacity` for all animations (GPU-accelerated).
- Avoid rapid bouncing or harsh snap animations — prefer smooth ease curves.
- Respect `prefers-reduced-motion` — disable or simplify all animations when set.

---

## 13. Accessibility

- **Color contrast:** All body text must meet WCAG AA (4.5 : 1). Large text / UI components must meet 3 : 1.
- Chocolate Brown `#3D1A1A` on Ivory White `#FDFAF7` achieves **~14 : 1** — exceeds AAA. ✅
- Lavender `#A48BBF` on Ivory White achieves **~3.2 : 1** — use only for large text / decorative labels, not body copy.
- Never communicate information through color alone (always pair with an icon or label).
- All interactive elements must have a visible focus indicator.
- Minimum touch target size: **44 × 44px**.

---

## 14. Do's and Don'ts

### ✅ Do
- Use Dancing Script only for brand moments and display headlines.
- Pair Chocolate Brown with Ivory White for maximum readability.
- Incorporate subtle vine/flourish decorative elements to reinforce brand personality.
- Keep white space generous — elegance lives in breathing room.
- Use Lavender as a hero accent to draw the eye to the most important element on a page.

### ❌ Don't
- Don't use more than two typefaces on a single screen (excluding the brand wordmark).
- Don't use pure black (`#000000`) or pure white (`#FFFFFF`) — always use warm-tinted neutrals.
- Don't place Lavender text on Cream backgrounds for body copy (insufficient contrast).
- Don't add more than one "primary" CTA per viewport.
- Don't use more than three colors in a single UI component.
- Don't break the rounded-corner principle — avoid sharp 0px radius elements.

---

## 15. Quick Reference Tokens

```css
/* Colors */
--color-primary:        #3D1A1A;
--color-accent:         #A48BBF;
--color-accent-light:   #D6C8E8;
--color-bg:             #FDFAF7;
--color-surface:        #F5EFE6;
--color-border:         #E8DDD0;
--color-success:        #7BAE8F;
--color-warning:        #D4935A;
--color-error:          #C0646C;
--color-info:           #8899C4;

/* Typography */
--font-display:   'Dancing Script', cursive;
--font-heading:   'Playfair Display', Georgia, serif;
--font-body:      'Lato', 'Helvetica Neue', sans-serif;
--font-label:     'Montserrat', Arial, sans-serif;

/* Spacing */
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 24px;  --space-6: 32px;
--space-8: 48px;  --space-10: 64px; --space-12: 80px;

/* Radius */
--radius-sm:   6px;    --radius-md: 12px;
--radius-lg:   20px;   --radius-xl: 32px;
--radius-full: 9999px;
```

---

*Chef on Pointe UI Style Guidelines — v1.0 · April 2026*