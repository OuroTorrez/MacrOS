<!-- BEGIN:design-agent-rules -->
Design a complete UI design system and key screens for "MacrOS", a dark-mode-only 
PWA gym progress tracker. The name evokes an operating system aesthetic — precise, 
technical, but with personality.

─────────────────────────────────────────────
DESIGN PHILOSOPHY
─────────────────────────────────────────────
Minimal but not sterile. Every element earns its place. 
The interface should feel like high-end hardware UI — like 
looking through dark matte glass at a glowing system beneath.
No light mode. No compromise.

─────────────────────────────────────────────
TYPOGRAPHY
─────────────────────────────────────────────
Use ONLY sans-serif typefaces. Select two:

1. Display / Headings: A geometric sans-serif with strong character 
   — options: "Syne", "Outfit", "Space Grotesk", or "Barlow Condensed".
   Should feel structured and assertive, not loud.

2. Body / Data: A clean monospaced or tabular-figure sans — options: 
   "DM Mono", "IBM Plex Mono", or "JetBrains Mono" (only for numbers/data), 
   paired with "Inter" or "DM Sans" for labels and descriptive text.

TYPOGRAPHIC SCALE — COMPACT:
  --text-label:    0.625rem  ← labels, table headers, compact controls
  --text-meta:     0.6875rem ← metadata and mono data
  --text-body:     0.8125rem ← default body copy
  --text-ui:       0.875rem  ← readable UI copy and messages
  --text-title-sm: 1.125rem  ← card and section titles
  --text-title:    clamp(1.25rem, 4.5vw, 1.75rem) ← page titles
  --text-hero:     clamp(1.5rem, 6vw, 2.25rem)    ← home/auth hero only

Use these tokens rather than one-off sizes. The initial-emphasis rule raises
only the initial to 1.4×; therefore no regular heading may exceed
`--text-hero`. Keep weights at 400–600 and let whitespace carry hierarchy.

All visible PWA copy is rendered in uppercase with `text-transform: uppercase`,
including headings, labels, buttons, helper text, empty states, and readable
data values. The stored value and accessible name keep their original casing.
Never transform passwords, email addresses, code/token fields, URLs, or any
value where changing the visual characters could be confusing or unsafe.

INITIAL EMPHASIS:
  - The first letter of each visible title, paragraph, sentence after `.`, `!`,
    or `?`, list item, and proper name is optically 1.4× the surrounding text.
  - Use a semantic inline `.initial` span when content has more than one
    sentence; CSS `::first-letter` is sufficient only for the first letter of
    a standalone block.
  - Keep the initial on the same baseline and use the current font family and
    color. It is a scale cue, not a drop cap: no extra weight, color, or space.
  - Proper brands retain their meaningful segments through the same treatment;
    for example, render `MacrOS` visually as an enlarged `M`, smaller `ACR`,
    then enlarged `OS` when it appears as a brand word.

─────────────────────────────────────────────
COLOR SYSTEM — STRICTLY LIMITED
─────────────────────────────────────────────
Maximum 6 tokens. No more.

  --color-void:    #0A0A0B    ← true near-black background base
  --color-ink:     #111114    ← card/surface base
  --color-glass:   rgba(255,255,255,0.04)  ← glass layer fill
  --color-bone:    #E8E4DC    ← primary text / high contrast
  --color-mist:    #A09A91    ← secondary text / labels
  --color-glow:    #C8C0B4    ← subtle accent, borders, focus rings

No saturated colors. No neon. If a "success" state is needed 
(e.g. PR achieved), use --color-bone at full brightness with a 
stronger glow — not a different hue.

─────────────────────────────────────────────
BACKGROUND TEXTURE
─────────────────────────────────────────────
Backgrounds must NOT be flat black. Apply a subtle noise/grain texture 
that reads like aged paper, matte carbon fiber, or rough concrete — 
barely visible but tactile. Implementation:

  - SVG feTurbulence filter OR CSS background with a repeating 
    micro-noise pattern at 3–8% opacity
  - The texture should be denser/coarser in the outermost background 
    layer and fade as you go into foreground cards
  - When combined with glass overlays, this creates natural depth 
    and subtle gradient shifts at glancing angles

─────────────────────────────────────────────
GLASSMORPHISM SYSTEM (DARK-ADAPTED)
─────────────────────────────────────────────
Glass in dark mode ≠ white frosted glass. Adapt it:

  - Fill: rgba(255,255,255,0.03) to rgba(255,255,255,0.06) 
    depending on elevation (higher = slightly more opaque)
  - Backdrop-filter: blur(12px) to blur(20px)
  - Border: 1px solid rgba(255,255,255,0.07) on top and left edges only 
    (simulates a light source from top-left)
  - Box-shadow for glow: 
      0 0 0 1px rgba(255,255,255,0.04),
      0 8px 32px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.06)
  - Never pure white edges. Never colored glows unless showing a PR moment.

─────────────────────────────────────────────
SHAPE SYSTEM — SQUIRCLE-BASED RADII
─────────────────────────────────────────────
Use a consistent squircle-inspired border-radius ratio system. 
Squircles use a superellipse curve (Apple iOS icon shape). 
Approximate with these fixed tokens:

  --radius-xs:   8px    ← chips, tags, small buttons
  --radius-sm:   14px   ← input fields, small cards
  --radius-md:   22px   ← standard cards, modals
  --radius-lg:   32px   ← bottom sheets, hero panels
  --radius-full: 9999px ← pill buttons, avatar rings

The ratio between consecutive steps is roughly ×1.5–1.6 — 
this makes nesting feel harmonious (a card at --radius-md 
containing elements at --radius-sm looks intentionally designed).

─────────────────────────────────────────────
GLASS CONTAINMENT
─────────────────────────────────────────────
Children and indicators inside a glass surface must remain visually contained
within the parent bounds at rest and during interaction. Use an appropriate
inset, clipping (`overflow: clip` or `hidden`), and transforms that do not
visibly bleed outside the glass. A nav droplet should be a compact circular
indicator, only slightly larger than its icon, rather than filling its slot.

─────────────────────────────────────────────
FLUID MEASUREMENTS
─────────────────────────────────────────────
Prioritize dynamic sizing and positioning. Do not use `px` for element width,
height, or positional layout values (`top`, `right`, `bottom`, `left`) unless a
fixed optical detail is strictly required. Prefer `rem`, `%`, `fr`, `clamp()`,
`min()`, `max()`, viewport units, `calc()`, flexbox, and grid so layouts adapt
to viewport, text scale, safe areas, and future content changes.

Pixel values remain appropriate for borders, hairlines, radius tokens, and
small visual details whose physical consistency is intentional. When an
exception is needed, keep it local and do not let it define the component's
overall geometry.

─────────────────────────────────────────────
SPACING SYSTEM
─────────────────────────────────────────────
Base unit: 4px. Use multiples: 4, 8, 12, 16, 24, 32, 48, 64.
Internal card padding: always 20px or 24px (5–6 base units).
Section gaps: 16–24px.
Screen edge margins: 20px.
Dense data rows: 12px vertical padding.

─────────────────────────────────────────────
SCREENS TO DESIGN
─────────────────────────────────────────────
Deliver these views:

1. HOME / DASHBOARD
   - Greeting + current streak (racha) shown prominently
   - Today's split card (glass, elevated) — tap to start session
   - Weekly activity ring or bar strip (compact)
   - Quick stats: total sessions, last PR, best streak

2. ACTIVE SESSION SCREEN
   - Current exercise name (large display type)
   - Set counter: e.g. "3 / 5 SETS" in monospaced type
   - Weight + reps input — large tap targets, minimal chrome
   - Rest timer: circular progress, countdown in large mono type
   - Swipe or button to log set and advance
   - PR indicator: subtle bone-glow pulse if a new max is hit

3. EXERCISE HISTORY / DETAIL
   - Header: muscle group tag + exercise name
   - Volume/weight chart — minimalist line chart on dark glass
   - Session log list: date · weight · reps · sets per row
   - Estimated 1RM trend line (secondary, muted)

4. SPLITS BROWSER
   - Horizontal or vertical list of user's splits
   - Each card shows: name, muscle groups, last performed date
   - Floating action button to create new split (pill, glass style)

5. SETTINGS / PROFILE STUB
   - Unit toggle: KG / LB
   - Streak info
   - Minimal — treated as a system panel, not a feature screen

─────────────────────────────────────────────
MOTION & INTERACTION HINTS
─────────────────────────────────────────────
- Transitions: 120–220ms, with a soft deceleration and no visible rebound. Velocity comes from immediate response, never from a long animation.
- Cards on press: scale(0.975) with reduced glow.
- Sheet entrances: slide-up with blur-in.
- Loading states: skeleton shimmer using glass layer animated horizontally.
- PR moment: brief glow pulse (keyframe: box-shadow intensifies then fades, 600ms).

─────────────────────────────────────────────
MOTION PRINCIPLES
─────────────────────────────────────────────
The animation language must match the glass aesthetic: 
fluid, physical, unhurried but never slow. 

Three rules govern every motion in MacrOS:

  1. FAST RESPONSE — input feedback under 80ms. 
     The UI must never feel laggy after a tap/click.

  2. SHORT DURATION — transitions 150–280ms max. 
     Nothing lingers. The content is the experience, not the animation.

  3. PHYSICAL EASING — use spring-based or cubic-bezier curves 
     that suggest real mass and surface tension, not linear slides.

Recommended easing tokens:

  --ease-snap:     cubic-bezier(0.2, 0.8, 0.3, 1)       ← immediate, controlled entry
  --ease-settle:   cubic-bezier(0.22, 0.9, 0.32, 1)      ← quick liquid settling, no bounce
  --ease-out-soft: cubic-bezier(0.18, 0.88, 0.32, 1)     ← smooth deceleration for sheets/pages
  --ease-glass:    cubic-bezier(0.2, 0.9, 0.3, 1)        ← primary curve for glass elements

If using a JS animation library, use spring physics:
  stiffness: 400–440, damping: 36–42, mass: 1
  This produces fast, critically damped settling that reads as fluid glass without a bounce.

─────────────────────────────────────────────
NAVIGATION BAR — LIQUID INDICATOR SYSTEM
─────────────────────────────────────────────
The nav bar is a single glass pill anchored at the bottom 
(or top on desktop). Icons are evenly distributed inside it.

STRUCTURE:
  - Outer container: glass card style (see glass system), 
    --radius-lg, full-width minus screen margins.
  - Icons: sit on an invisible grid. No individual backgrounds. 
    No per-icon active states via color change.
  - Liquid indicator: an absolutely-positioned element 
    layered BEHIND the icons, same height as the nav bar 
    (slightly inset top/bottom by 6px), width proportional 
    to the icon slot. This is the "droplet."

DROPLET APPEARANCE:
  - Fill: rgba(255,255,255,0.08) — slightly brighter than base glass
  - Blur: backdrop-filter blur(16px)
  - Border: 1px solid rgba(255,255,255,0.10), top-left edges only
  - Border-radius: --radius-sm (follows squircle system)
  - Box-shadow: 
      0 0 12px rgba(200,192,180,0.08),  ← subtle bone glow
      inset 0 1px 0 rgba(255,255,255,0.08)
  - The droplet has NO color. It is purely a glass density shift.

HOVER BEHAVIOR (pointer devices):
  - On mouseenter over any icon slot, the droplet translates 
    its X position toward the hovered slot.
  - Duration: 150ms, --ease-glass. It must feel immediate, then decelerate softly without overshoot.
  - The icon being hovered scales to 1.08 — subtle, not dramatic.
  - On mouseleave (leaving the nav bar entirely), the droplet 
    snaps back to the active route's slot.
    Duration: 180ms, --ease-out-soft.

CLICK / TAP BEHAVIOR:
  - During horizontal movement on pointer devices, the droplet stretches toward travel (scaleX up to 1.28, scaleY down proportionally) and tilts up to 2°. It relaxes within 70ms after motion stops, like surface tension.
  - On pointerdown: droplet compresses slightly (scaleY: 0.92,
    scaleX: 1.04) — like pressing into liquid. Duration: 80ms.
  - On pointerup / navigation commit: droplet returns to its resting circle and translates to the new slot. Duration: 150ms, --ease-glass.
  - No color shifts. No underlines. No opacity changes on icons.
  - Active icon: scale 1.0, color --color-bone (full brightness).
  - Inactive icons: color --color-mist.

IMPLEMENTATION NOTE:
  Track the droplet position as a single CSS custom property 
  --droplet-x (translateX value) and animate it via 
  CSS transition or a WAAPI animation. 
  Avoid re-rendering the entire nav on every hover.

  Example approach (conceptual):
    navIndicator.style.setProperty('--droplet-x', `${targetSlot.offsetLeft}px`);
    // CSS: transform: translateX(var(--droplet-x)); transition: transform 180ms var(--ease-settle);

─────────────────────────────────────────────
PAGE / ROUTE TRANSITIONS
─────────────────────────────────────────────
Transitions exist to orient the user — not to impress them. 
Keep them fast. Every ms of unnecessary delay compounds 
into perceived sluggishness.

APPROACH: Shared-axis slide with blur + opacity.

  OUTGOING page:
    - translateX: 0 → -24px, opacity: 1 → 0, filter: blur(0 → 4px)
    - Duration: 140ms, ease-in (content leaves fast)

  INCOMING page:
    - translateX: 24px → 0, opacity: 0 → 1, filter: blur(4px → 0)
    - Duration: 200ms, --ease-out-soft
    - Begins after 80ms (slight overlap with outgoing exit)
    - Total perceived transition time: ~240ms

DIRECTION LOGIC (optional but recommended):
  - Navigating "deeper" (Home → Session): slide left
  - Navigating "back": slide right
  - Switching tabs via navbar: no slide — only opacity + blur fade
    (prevents disorientation from lateral movement matching 
    bottom nav left/right positions)

GLASS ELEMENTS during transition:
  - Cards within the page inherit the page transition.
  - Do NOT add individual staggered animations on page cards 
    during route changes — this multiplies perceived load time.
  - Stagger (3–4 cards, 30ms apart) ONLY on first load / cold start.

REDUCED MOTION:
  Always respect prefers-reduced-motion:
    - Set all durations to 0ms or near-instant
    - Remove blur filters from transitions
    - Keep opacity fade (it's the least disorienting motion)

─────────────────────────────────────────────
MICRO-INTERACTIONS — INVENTORY
─────────────────────────────────────────────
  LOG SET BUTTON (primary action in session screen)
    - Tap: scale 0.95 → 1.0, 120ms, --ease-settle
    - Success confirm: brief ring-pulse on border 
      (box-shadow expands then fades, 400ms, once)

  REST TIMER (circular progress)
    - Progress arc: CSS stroke-dashoffset animated via 
      linear transition only (timer must be perfectly linear)
    - At 5s remaining: border glow intensifies (--color-glow 
      at higher opacity) — warning without color change

  PR ACHIEVEMENT
    - Card border glow: keyframe from current glow → 
      rgba(232,228,220,0.35) → back to rest. 600ms, ease-in-out.
    - Text "PR" label: scale 0 → 1.1 → 1.0, 300ms, --ease-settle
    - No sound. No particle effects. Glass restraint.

  INPUT FIELDS (weight/reps)
    - Focus: border transitions from rgba(255,255,255,0.07) 
      to rgba(255,255,255,0.16). Duration 150ms.
    - No box shadow bloom on focus. Subtle is enough.

  STREAK COUNTER
    - On increment (new day streak confirmed): 
      number rolls up via translateY clip animation
      Old number exits up, new number enters from below.
      Duration: 220ms per digit, staggered 40ms if multi-digit.

─────────────────────────────────────────────
PERFORMANCE CONSTRAINTS
─────────────────────────────────────────────
  - Animate ONLY: transform, opacity, filter (blur).
    Never animate: width, height, top, left, background-color, 
    box-shadow directly (if box-shadow must animate, 
    use opacity on a pseudo-element instead).

  - All animated elements: will-change: transform or 
    will-change: opacity. Remove after animation completes.

  - Backdrop-filter is expensive. Limit glass layers 
    visible simultaneously to 4–6 max. Avoid animating 
    backdrop-filter blur values directly.

  - For the nav droplet on touch devices: 
    disable hover tracking entirely. Only respond to 
    pointerdown/up to avoid ghost states on mobile.

  - Target 60fps on mid-range Android. If a device reports 
    low frame rate, disable blur filters on transitions 
    (detect via navigator.hardwareConcurrency < 4 as proxy).

─────────────────────────────────────────────
WHAT TO AVOID
─────────────────────────────────────────────
✗ Colored gradients (purple/blue neon is a cliché)
✗ Emoji or decorative icons as UI chrome
✗ Flat solid fills with no texture
✗ More than 2 typefaces
✗ Inconsistent radii (mixing sharp corners with rounded siblings)
✗ Text over glass without sufficient contrast check
✗ Busy illustrations or background art
<!-- END:design-agent-rules -->
