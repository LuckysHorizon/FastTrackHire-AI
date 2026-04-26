# FastTrackHire — Premium UI/UX Design Document
### Complete Frontend Rebuild Specification for Gemini 2.5 Flash Agent

---

## 0. Document Purpose

This document is a complete, self-contained build specification for the FastTrackHire web application frontend. It is written for an autonomous AI coding agent and contains zero ambiguity. Every screen, component, interaction, color, font, and animation is defined here. The agent should build this as a **React + Vite + TailwindCSS** single-page application with the backend remaining Python/FastAPI (replacing Streamlit).

---

## 1. Design Philosophy & Aesthetic Direction

### 1.1 Core Aesthetic: "Editorial Precision"

FastTrackHire targets ambitious developers and engineers. The design must feel like a high-end career platform — think *Linear meets Stripe meets a premium fintech product*. Not corporate. Not startup-generic. **Quietly confident and razor-sharp.**

**Tone:** Calm authority. Like walking into a Goldman Sachs interview room that was designed by a Bauhaus architect.

**What makes it unforgettable:** A signature horizontal progress ticker at the top of every interview screen — like a stock market feed — showing the current question status, company name, and elapsed time. Pure editorial energy.

---

### 1.2 Design Pillars

1. **Typographic Hierarchy is the UI** — Large, decisive type. Every screen's focal point is a beautifully set headline.
2. **Restraint, then one bold move** — 90% clean white space. 10% a single stunning accent.
3. **Motion with purpose** — Transitions feel like turning pages in a luxury magazine, not loading spinners.
4. **Information density at the right moment** — Sparse during the interview. Rich during feedback.

---

## 2. Design Tokens

### 2.1 Color System

```
/* ──────────────────────────────────────────
   LIGHT THEME — FastTrackHire Design System
   ────────────────────────────────────────── */

/* Neutrals */
--color-bg-base:        #FAFAF8;   /* Warm off-white canvas */
--color-bg-surface:     #FFFFFF;   /* Card/panel white */
--color-bg-subtle:      #F4F3F0;   /* Subtle section tint */
--color-bg-muted:       #EBEBЕ7;   /* Borders, dividers */

/* Text */
--color-text-primary:   #0D0D0B;   /* Near-black, warm */
--color-text-secondary: #5C5B57;   /* Secondary labels */
--color-text-tertiary:  #9B9A95;   /* Placeholders, hints */
--color-text-inverse:   #FAFAF8;   /* Text on dark bg */

/* Accent — Signature Color */
--color-accent:         #1A1A2E;   /* Deep navy — primary CTA */
--color-accent-hover:   #16213E;   /* Darker on hover */
--color-accent-light:   #E8E8F5;   /* Tinted backgrounds */

/* Status */
--color-success:        #1C7A4A;   /* Verdant green */
--color-success-light:  #EDFAF4;
--color-warning:        #A85C00;   /* Warm amber */
--color-warning-light:  #FFF8EC;
--color-error:          #C0392B;   /* Clear red */
--color-error-light:    #FDF2F0;
--color-info:           #1565C0;   /* Informational blue */
--color-info-light:     #EEF4FC;

/* Company Brand Colors (for pill badges) */
--brand-google:         #4285F4;
--brand-amazon:         #FF9900;
--brand-microsoft:      #00A4EF;
--brand-apple:          #555555;
--brand-meta:           #0082FB;
--brand-netflix:        #E50914;

/* Shadows */
--shadow-xs:  0 1px 2px rgba(13,13,11,0.06);
--shadow-sm:  0 2px 8px rgba(13,13,11,0.08);
--shadow-md:  0 4px 16px rgba(13,13,11,0.10);
--shadow-lg:  0 8px 32px rgba(13,13,11,0.12);
--shadow-xl:  0 16px 48px rgba(13,13,11,0.14);
```

### 2.2 Typography

**Font Stack:**

```
/* Display / Hero Headlines */
font-family: 'Playfair Display', Georgia, serif;
/* Used for: Hero H1, Section titles, Score numbers */

/* UI / Body / Labels */
font-family: 'DM Sans', -apple-system, sans-serif;
/* Used for: Navigation, buttons, body text, form labels */

/* Code / Technical */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
/* Used for: Code snippets, DSA question blocks, session IDs */

/* Import via Google Fonts: */
/* Playfair Display: 400, 500, 700 */
/* DM Sans: 300, 400, 500, 600 */
/* JetBrains Mono: 400, 500 */
```

**Type Scale:**

```
--text-xs:   11px / 1.4  — Metadata, tags
--text-sm:   13px / 1.5  — Secondary labels, hints
--text-base: 15px / 1.6  — Body copy
--text-md:   17px / 1.5  — Emphasized body
--text-lg:   20px / 1.4  — Subheadings
--text-xl:   24px / 1.3  — Section headings
--text-2xl:  32px / 1.2  — Page headings
--text-3xl:  42px / 1.15 — Hero subheadings
--text-4xl:  56px / 1.1  — Hero headlines (DM Sans)
--text-5xl:  72px / 1.0  — Landing hero (Playfair Display)
--text-6xl:  96px / 0.95 — Oversized display text
```

### 2.3 Spacing & Layout

```
/* Grid: 12-column, max-width 1280px, 24px gutters */
--max-width: 1280px;
--gutter: 24px;

/* Border Radius */
--radius-sm:  4px
--radius-md:  8px
--radius-lg:  12px
--radius-xl:  16px
--radius-2xl: 24px
--radius-full: 9999px

/* Spacing Scale (multiples of 4px) */
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 128px
```

### 2.4 Animation Tokens

```css
--ease-out-quart:  cubic-bezier(0.25, 1, 0.5, 1);
--ease-in-out:     cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);

--duration-fast:   120ms;
--duration-normal: 240ms;
--duration-slow:   400ms;
--duration-page:   600ms;
```

---

## 3. Component Library

### 3.1 Button System

```
PRIMARY BUTTON
  Background: var(--color-accent)
  Text: var(--color-text-inverse)
  Font: DM Sans 500, 14px, tracking 0.01em
  Height: 44px
  Padding: 0 24px
  Radius: var(--radius-md)
  Hover: background → var(--color-accent-hover), translateY(-1px), shadow-md
  Active: translateY(0)
  Transition: 200ms ease-out-quart
  Disabled: opacity 0.4, cursor not-allowed

SECONDARY BUTTON
  Background: transparent
  Border: 1.5px solid var(--color-bg-muted)
  Text: var(--color-text-primary)
  Hover: border-color → var(--color-accent), background → var(--color-accent-light)

GHOST BUTTON
  No border, no background
  Text: var(--color-text-secondary)
  Hover: text → var(--color-text-primary), background → var(--color-bg-subtle)

ICON BUTTON
  Size: 40x40px, radius: var(--radius-md)
  Ghost variant by default

DANGER BUTTON
  Background: var(--color-error)
  Use only for destructive actions
```

### 3.2 Input Fields

```
TEXT INPUT
  Height: 48px
  Background: var(--color-bg-surface)
  Border: 1.5px solid var(--color-bg-muted)
  Radius: var(--radius-md)
  Padding: 0 16px
  Font: DM Sans 400, 15px
  Color: var(--color-text-primary)
  
  Focus state:
    Border: 1.5px solid var(--color-accent)
    Box-shadow: 0 0 0 3px rgba(26,26,46,0.08)
    Transition: 150ms ease

  Error state:
    Border: var(--color-error)
    Box-shadow: 0 0 0 3px rgba(192,57,43,0.08)
  
  Label: DM Sans 500, 13px, color: var(--color-text-secondary), mb: 6px
  Helper text: DM Sans 400, 12px, color: var(--color-text-tertiary), mt: 4px

FLOATING LABEL INPUT (used on login/signup)
  Label floats above on focus/filled
  Animation: 200ms ease, translateY(-24px) scale(0.85)
```

### 3.3 Cards

```
BASE CARD
  Background: var(--color-bg-surface)
  Border: 1px solid var(--color-bg-muted)
  Radius: var(--radius-xl)
  Shadow: var(--shadow-xs)
  Padding: 24px

ELEVATED CARD
  Shadow: var(--shadow-md)
  Hover: shadow → var(--shadow-lg), translateY(-2px)
  Transition: 240ms ease-out-quart

GLASS CARD (used in landing hero)
  Background: rgba(255,255,255,0.72)
  Backdrop-filter: blur(20px) saturate(1.4)
  Border: 1px solid rgba(255,255,255,0.6)
```

### 3.4 Badge / Pill

```
DEFAULT PILL
  Height: 24px, padding: 0 10px
  Radius: var(--radius-full)
  Font: DM Sans 500, 11px, uppercase, tracking 0.06em
  Background: var(--color-bg-subtle)
  Color: var(--color-text-secondary)

COMPANY PILL
  Left dot: 6px circle, color: company brand color
  Background: color-mix(in srgb, brand-color 10%, white)
  Border: 1px solid color-mix(in srgb, brand-color 20%, white)
```

### 3.5 Avatar

```
Sizes: 32px / 40px / 48px / 64px
Shape: circle
Default: initials on var(--color-accent-light) background
Font: DM Sans 600, proportional to size
Border: 2px solid var(--color-bg-surface) (for stacked avatars)
```

---

## 4. Screens — Full Specification

---

### SCREEN 1: Landing Page (`/`)

**Purpose:** Convert visitors to sign up. Communicate value in under 5 seconds.

**Layout:** Single-page with 5 sections. Sticky navigation.

---

#### SECTION 1.1: Navigation Bar

```
Position: sticky top-0, z-index 100
Height: 64px
Background: rgba(250,250,248,0.85), backdrop-filter: blur(12px)
Border-bottom: 1px solid var(--color-bg-muted) (appears only on scroll)

LEFT: Logo
  — FastTrackHire wordmark
  — "FastTrack" in Playfair Display 700, 20px, color: var(--color-text-primary)
  — "Hire" in DM Sans 300, 20px, color: var(--color-text-secondary)
  — Small lightning bolt SVG icon (14px) before text, color: var(--color-accent)

CENTER: Navigation Links
  — "How it Works" / "Companies" / "Pricing" (ghost style, DM Sans 500, 14px)
  — Active indicator: 2px underline, var(--color-accent), animated slide

RIGHT: Auth Actions
  — "Sign In" → ghost button
  — "Get Started" → primary button
  — Gap: 12px
```

---

#### SECTION 1.2: Hero Section

```
Padding: 120px 0 96px
Background: var(--color-bg-base)
Position: relative
Overflow: hidden

BACKGROUND DETAIL:
  — Large radial gradient: center top, rgba(26,26,46,0.04) → transparent, radius 800px
  — Faint grid pattern overlay: 48px cells, 0.5px lines, rgba(0,0,0,0.04)
  — Two soft blurred circles (blobs):
      Circle 1: 600px, rgba(26,26,46,0.06), top-right, blur: 120px
      Circle 2: 400px, rgba(26,130,74,0.05), bottom-left, blur: 100px

CONTENT: max-width 760px, centered

SUPER-LABEL (above headline):
  — Pill badge: "🔴 Live Mock Interviews" 
  — Animation: fade+translateY(8px) on load, delay 0ms

HEADLINE:
  — Font: Playfair Display 700, 72px, line-height 1.05
  — Color: var(--color-text-primary)
  — Text: "Ace Your Next"
           "Tech Interview."
  — "Tech Interview." has color: var(--color-accent)
  — Animation: Each word fades in with stagger (50ms between words)

SUBHEADLINE:
  — Font: DM Sans 400, 19px, line-height 1.65
  — Color: var(--color-text-secondary)
  — Max-width: 540px, margin: 0 auto
  — Text: "AI-powered mock interviews tailored to your resume and your target company. Walk in prepared. Walk out hired."
  — Animation: fade+translateY(12px), delay 300ms

CTA ROW:
  — Primary: "Start Practicing Free" (primary button, height 52px, padding 0 32px, font-size 16px)
  — Secondary: "Watch Demo →" (ghost button)
  — Gap: 16px
  — Animation: fade+translateY(12px), delay 450ms

SOCIAL PROOF ROW:
  — 5 avatar stack (4 overlapping circles + "+2.4k more")
  — Text: "Join 2,400+ engineers practicing today"
  — Font: DM Sans 400, 13px, color: var(--color-text-tertiary)
  — Animation: delay 600ms

HERO VISUAL (below CTA, or right side on desktop):
  — Interview Preview Card (Glass Card style)
  — Width: 540px, positioned right side on ≥1024px
  — Shows a mock interview in progress:
      Top: Company pill (Google), Timer "12:43", Status "Question 2 of 7"
      Message from AI: "Explain the time complexity of merge sort and describe a scenario where you'd prefer it over quicksort."
      User typing indicator (3-dot pulse animation)
  — Subtle drop shadow + slight tilt: rotate(-1deg)
  — Floating badge bottom-left: "✓ Resume Analyzed" in success style
  — Animation: slide in from right, fade, delay 200ms
```

---

#### SECTION 1.3: Company Logos / Social Proof Bar

```
Padding: 40px 0
Background: var(--color-bg-subtle)
Border-top + border-bottom: 1px solid var(--color-bg-muted)

Label: "Practice for interviews at" — DM Sans 500, 12px, uppercase, tracking 0.1em, color: var(--color-text-tertiary), centered

LOGO ROW: 
  Horizontal scroll on mobile, centered row on desktop
  Companies: Google, Amazon, Microsoft, Apple, Meta, Netflix, Uber, Stripe
  Logos: SVG, 24px height, grayscale(1) opacity(0.5)
  Hover: grayscale(0) opacity(1), transition 300ms
  Gap: 48px

Infinite marquee animation on mobile (CSS animation, 20s linear infinite)
```

---

#### SECTION 1.4: How It Works

```
Padding: 96px 0
Background: var(--color-bg-base)

SECTION LABEL: "Simple by design" (pill badge, center)

HEADING: 
  "Three steps to"
  "interview confidence."
  — Playfair Display 700, 48px, centered

STEPS GRID: 3 columns, gap: 32px, max-width: 960px, centered

Each step card:
  — Number: Large Playfair Display 700, 80px, color: var(--color-bg-muted), absolute top-left
  — Icon: 48px, line icon, color: var(--color-accent)
  — Title: DM Sans 600, 20px
  — Body: DM Sans 400, 15px, color: var(--color-text-secondary)
  — Elevated Card style, hover lift

  STEP 1: Upload Resume
    Icon: Document upload icon
    "Upload your resume. Our AI reads every line — skills, projects, experience — and builds a custom interview profile."

  STEP 2: Choose Your Company
    Icon: Building/company icon
    "Pick your target company. The AI mirrors their known interview style, difficulty level, and focus areas."

  STEP 3: Get Instant Feedback
    Icon: Chart/analytics icon
    "Finish the interview. Receive a detailed performance report with scores, strengths, and an improvement roadmap."

CONNECTOR LINES between steps (desktop only):
  Dashed horizontal line, 1px, var(--color-bg-muted)
  Arrow SVG midpoint
```

---

#### SECTION 1.5: Features Section

```
Padding: 96px 0
Background: var(--color-bg-subtle)

BENTO GRID LAYOUT (asymmetric):
  Grid: 12 columns
  Row 1: [Large feature card 7 cols] [Tall feature card 5 cols]
  Row 2: [Medium card 4 cols] [Medium card 4 cols] [Medium card 4 cols]

LARGE CARD (DSA Questions):
  Background: var(--color-accent)
  Text: var(--color-text-inverse)
  Padding: 48px
  Shows: Simulated DSA question in JetBrains Mono
  "Given an array of integers, find the two numbers that sum to a target..."
  Tag: "LeetCode Medium · Merge Sort · Complexity Analysis"

TALL CARD (Resume Intelligence):
  Shows animated resume scan — lines highlight as they're "read"
  Title: "Resume-aware questions"
  Body: "The AI doesn't just ask generic questions. It references your actual projects, asks about your stack."

MEDIUM CARDS:
  Card 1 — "7 Top Companies" with company logo cluster
  Card 2 — "Real-time autosave" with progress bar animation
  Card 3 — "Instant detailed feedback" with mini score visualization (donut chart)
```

---

#### SECTION 1.6: Testimonials

```
Padding: 96px 0
Background: var(--color-bg-base)

HEADING: "What engineers say." — Playfair Display 700, 48px

TESTIMONIALS: Horizontal scroll / carousel
  3 cards visible at once, drag-to-scroll on mobile

  Each card:
    — Quote: DM Sans 400, 17px, italic
    — Author: Avatar + Name (DM Sans 600) + Role + Company
    — Rating: 5 stars (SVG, color: #F59E0B)

SAMPLE TESTIMONIALS:
  1. "I practiced Google-style DSA questions for a week. Got the L5 offer." 
     — Arjun M., Software Engineer at Google

  2. "The resume-based questions were shockingly accurate. It asked about a specific project from my internship."
     — Sarah K., SWE II at Amazon

  3. "The feedback report was more detailed than anything I've seen. It actually called out my weak DP knowledge."
     — Marcus T., Staff Engineer at Netflix
```

---

#### SECTION 1.7: CTA Section

```
Padding: 96px 0
Background: var(--color-accent)
Color: var(--color-text-inverse)

Large centered block:
  HEADING: "Your next offer starts here."
  Playfair Display 700, 56px, white

  SUBTEXT: DM Sans 400, 18px, rgba(255,255,255,0.7)
  "Free to start. No credit card. Just practice."

  BUTTON: "Create Free Account" — White background, accent text, height 56px, radius var(--radius-full)

  BELOW: 3 inline trust signals with check icons:
    ✓ Instant setup   ✓ 7 companies included   ✓ AI feedback every time
```

---

#### SECTION 1.8: Footer

```
Background: var(--color-bg-base)
Border-top: 1px solid var(--color-bg-muted)
Padding: 48px 0 32px

COLUMNS (4):
  Logo + 1-line mission statement + social icons (GitHub, LinkedIn, Twitter/X)
  Product: Features, Companies, How it Works, Pricing
  Company: About, Blog, Careers, Contact
  Legal: Privacy Policy, Terms of Service

Bottom bar:
  "© 2025 FastTrackHire. Built for engineers, by engineers."
  Color: var(--color-text-tertiary)
  Font: DM Sans 400, 13px
```

---

### SCREEN 2: Authentication (`/auth`)

**Two modes: Sign In / Sign Up. Single page, mode toggled.**

```
LAYOUT:
  Left panel (60%): Full-height decorative panel
  Right panel (40%): Auth form

LEFT PANEL:
  Background: var(--color-accent)
  Overflow: hidden

  Large Playfair Display quote (white, 40px):
    "The interview"
    "is just practice"
    "you haven't done yet."

  Below quote:
    — 3 floating stat cards (glass effect on dark):
      Card 1: "2,400+" / "Engineers trained"
      Card 2: "94%" / "Satisfaction rate"
      Card 3: "7" / "Top companies"
    — Staggered positions, slight rotation (-2deg, 1deg, -1deg)
    — Subtle floating animation (keyframes: translateY ±8px, 4s ease-in-out infinite)

  Bottom: Company logo strip (white, 30% opacity)

RIGHT PANEL:
  Background: var(--color-bg-surface)
  Display: flex, align-items: center, justify-content: center
  Padding: 48px

  TOP: Logo (compact version, centered)

  MODE TOGGLE:
    Two tabs: "Sign In" | "Sign Up"
    Active tab: DM Sans 600, border-bottom 2px var(--color-accent)
    Transition: slide indicator 200ms

  ── SIGN IN MODE ──

  FORM FIELDS:
    Floating label input: Email address
    Floating label input: Password
      — Password visibility toggle icon (eye/eye-off)
    
    Row: "Remember me" checkbox + "Forgot password?" link (right aligned)
    
    PRIMARY BUTTON: "Sign In" (full width, height 52px)
    
    DIVIDER: — or continue with —
    
    SOCIAL BUTTONS (outline style):
      Google (Google icon + "Continue with Google")
      GitHub (GitHub icon + "Continue with GitHub")

    FOOTER TEXT: "Don't have an account? Sign up →" (link)

  ── SIGN UP MODE ──

  FORM FIELDS (appear with stagger animation):
    Row: First name | Last name (two half-width inputs)
    Email address
    Password (with strength meter below)
      Password strength bar:
        — 4 segments, progressively fill: weak/fair/good/strong
        — Colors: error / warning / info / success
        — Label updates: "Weak", "Fair", "Good", "Strong"
    Confirm password

    Checkbox: "I agree to the Terms of Service and Privacy Policy"
    
    PRIMARY BUTTON: "Create Account" (full width)

    FOOTER TEXT: "Already have an account? Sign in →"

  FORM VALIDATION:
    — Inline error messages below each field
    — Error state: red border + icon
    — Success state: green checkmark icon appears right of input
    — All transitions: 150ms ease

MOBILE (<768px):
  Left panel hidden
  Single column, full-screen form
  Logo at top, centered
```

---

### SCREEN 3: Dashboard (`/dashboard`)

**The user's home base after login.**

```
LAYOUT:
  Sidebar (240px, fixed left) + Main content area

──────────────────────────────────
SIDEBAR
──────────────────────────────────
  Width: 240px
  Background: var(--color-bg-surface)
  Border-right: 1px solid var(--color-bg-muted)
  Height: 100vh, sticky

  TOP:
    Logo (same as nav, smaller)
    
  USER CARD:
    Avatar (40px) + Name (DM Sans 600, 14px) + Email (text-tertiary, 12px)
    Padding: 16px, margin-bottom: 8px
    Background: var(--color-bg-subtle)
    Radius: var(--radius-lg)

  NAVIGATION ITEMS:
    Each item: Icon (20px) + Label (DM Sans 500, 14px)
    Height: 40px, padding: 0 12px, radius: var(--radius-md)
    Hover: background var(--color-bg-subtle)
    Active: background var(--color-accent-light), color var(--color-accent), DM Sans 600
    
    Items:
      🏠 Dashboard (home icon)
      🎯 New Interview (target icon)
      📋 My Sessions (clipboard icon)
      📄 My Resume (document icon)
      ⚙️ Settings (gear icon)

  BOTTOM:
    "Help & Support" link
    "Sign Out" ghost button with logout icon

──────────────────────────────────
MAIN CONTENT
──────────────────────────────────
  Background: var(--color-bg-base)
  Padding: 40px 48px
  Min-height: 100vh

  PAGE HEADER:
    "Good morning, [Name]." — DM Sans 600, 28px
    "[Day], [Date]" — DM Sans 400, 14px, text-secondary
    Right: "Start New Interview" primary button

  ── STATS ROW ──
  4 stat cards in a row, gap: 16px

  Each stat card (Base Card):
    Label: DM Sans 500, 12px, uppercase, tracking 0.08em, text-tertiary
    Value: Playfair Display 700, 36px, text-primary
    Trend: Small pill (green ▲ or red ▼) + percentage text

    Stat 1: "Sessions Completed" / 12
    Stat 2: "Avg. Score" / 74%
    Stat 3: "Questions Answered" / 84
    Stat 4: "Current Streak" / 3 🔥

  ── TWO COLUMN GRID ──
  Left (60%): Recent Sessions
  Right (40%): Resume + Quick Start

  LEFT — RECENT SESSIONS:
    Heading: "Recent Sessions" (DM Sans 600, 18px)
    "View all →" link (right)

    SESSION LIST: 
    Each row (Elevated Card, hover lift):
      LEFT:
        Company pill (with brand color dot)
        Title: "Google Technical Interview" (DM Sans 600, 15px)
        Date: "2 days ago" (text-tertiary, 13px)
      CENTER:
        Progress bar (score out of 100)
        Score: "82 / 100" (DM Sans 600, 14px)
      RIGHT:
        Status pill: "Completed" (success) / "In Progress" (warning) / "Draft" (default)
        "View Report →" text link

    EMPTY STATE (if no sessions):
      Illustration: Simple line drawing of a chat bubble with a lightning bolt
      Text: "No interviews yet."
      Subtext: "Start your first mock interview to see your results here."
      Button: "Start Practicing" (primary)

  RIGHT — QUICK START:
    HEADING: "Start an Interview"
    
    COMPANY SELECTOR (styled as a beautiful grid):
      3x3 grid of company buttons
      Each: Logo + Name
      Selected: border var(--color-accent), background var(--color-accent-light)
      Hover: shadow-sm, translateY(-1px)

      Companies:
        Google / Amazon / Microsoft
        Apple / Meta / Netflix
        Uber / Stripe / (Custom+)

    AFTER SELECTION:
      "Resume Required" notice (if no resume uploaded)
        → links to resume upload

    "Begin Interview" button (full width, primary, disabled until company selected)

  RIGHT — RESUME CARD:
    HEADING: "Your Resume"
    
    IF UPLOADED:
      File card:
        PDF icon (red) + filename.pdf
        Uploaded: "3 days ago"
        Actions: "Preview" | "Replace"
    
    IF NOT UPLOADED:
      Dashed border upload zone:
        Upload icon + "Drop your PDF resume here"
        Subtext: "or click to browse"
        Max size: "PDF, max 10MB"
        Hover: border-color var(--color-accent), bg: var(--color-accent-light)
```

---

### SCREEN 4: Interview Setup (`/interview/setup`)

**Dedicated setup screen before the interview begins.**

```
LAYOUT: Centered, single column, max-width 680px

TOP: Breadcrumb: Dashboard > New Interview

STEP INDICATOR:
  3 steps, horizontal
  Step 1: ● Company   ──   Step 2: ○ Review   ──   Step 3: ○ Interview
  Active: filled circle var(--color-accent)
  Done: checkmark icon
  Line: 1px dashed, var(--color-bg-muted)

──────────────────────────────────
STEP 1: Choose Company
──────────────────────────────────
  HEADING: "Who are you interviewing with?"
  Playfair Display 700, 36px

  COMPANY GRID (2x4):
    Large cards (112px height), full width clickable
    Each card:
      Company SVG logo (32px)
      Name: DM Sans 600, 16px
      Tagline: DM Sans 400, 12px, text-tertiary
        e.g., Google: "Algorithms & Systems Design"
             Amazon: "Leadership Principles + DSA"
             Microsoft: "Problem Solving & OOP"
    
    Selected state:
      Border: 2px solid var(--color-accent)
      Background: var(--color-accent-light)
      Checkmark badge: top-right corner, 20px circle, var(--color-accent)
      Animation: scale(1.02), shadow-md

  "Continue" button (full width, primary, 52px)

──────────────────────────────────
STEP 2: Review & Confirm
──────────────────────────────────
  HEADING: "Ready to begin?"

  SUMMARY CARD (Elevated Card):
    Row 1: Company selected (logo + name + pill)
    Row 2: Resume status (✓ Uploaded / ⚠ Missing)
    Row 3: What to expect:
      • 3 DSA questions (medium-hard, company-specific)
      • 3–4 Resume-based questions
      • Real-time AI interviewer
      • Full feedback report at the end

  ESTIMATED TIME: "~45 minutes" with clock icon

  RESUME WARNING (if missing):
    Yellow alert box: "No resume uploaded. You'll still get DSA questions, but resume-based questions won't be personalized."
    "Upload Resume" inline link

  BUTTONS ROW:
    "← Back" ghost + "Start Interview" primary (52px, font 16px)
```

---

### SCREEN 5: Interview Room (`/interview/[sessionId]`)

**The primary experience. Must feel focused and immersive.**

```
LAYOUT: Full-screen, no distractions
  Background: var(--color-bg-base)
  Header (56px) + Chat area (fills remaining) + Input bar (72px)

──────────────────────────────────
INTERVIEW HEADER (SIGNATURE ELEMENT)
──────────────────────────────────
  Height: 56px
  Background: var(--color-bg-surface)
  Border-bottom: 1px solid var(--color-bg-muted)

  LEFT:
    Logo (compact) + "|" divider + Company pill (brand color)

  CENTER — THE TICKER:
    Horizontal strip, monospaced text (JetBrains Mono 13px), text-secondary
    Content: "Q2 of 7  ·  DSA: Merge Sort  ·  ELAPSED: 14:32  ·  AUTOSAVED"
    Updates live (timer counts up)
    Between updates, a thin progress bar (2px, at very top of header) fills across

  RIGHT:
    Timer display: "14:32" (DM Sans 600, 14px, text-secondary)
    Mic icon button (voice input, future feature — show as disabled for now)
    "End Session" ghost button (danger style on hover)

──────────────────────────────────
PROGRESS BAR (2px, top of viewport)
──────────────────────────────────
  Background: var(--color-bg-muted)
  Fill: var(--color-accent)
  Fills as questions progress (e.g., Q2/7 = ~28%)
  Transition: 600ms ease-out-quart

──────────────────────────────────
CHAT AREA
──────────────────────────────────
  Padding: 32px 0
  Max-width: 720px, centered
  Overflow-y: auto, custom scrollbar

  SCROLL BEHAVIOR: Auto-scrolls to bottom on new message

  CUSTOM SCROLLBAR:
    Width: 4px
    Track: transparent
    Thumb: var(--color-bg-muted), radius var(--radius-full)

  ── AI MESSAGE BUBBLE ──
  Layout: AI avatar left, bubble right of it

  Avatar:
    32px circle
    Background: var(--color-accent)
    Icon: Small robot/sparkle icon (white, 16px)
    Label below (optional, on first message): "AI Interviewer"

  Bubble:
    Background: var(--color-bg-surface)
    Border: 1px solid var(--color-bg-muted)
    Border-radius: 4px 16px 16px 16px (sharp top-left corner)
    Padding: 16px 20px
    Max-width: 80%
    Font: DM Sans 400, 15px, line-height 1.65
    Shadow: var(--shadow-xs)
    
    Code blocks inside message:
      Background: var(--color-bg-subtle)
      Font: JetBrains Mono 13px
      Padding: 12px 16px
      Radius: var(--radius-md)
      Border-left: 3px solid var(--color-accent)

    APPEAR ANIMATION:
      Fade + translateY(8px) → translateY(0), 300ms ease-out-quart
      Each word fades in with 15ms stagger (typewriter feel without actual typing)

    TYPING INDICATOR (when AI is responding):
      Same bubble shape, empty
      3 dots inside (pulse animation, stagger 150ms each)
      Colors cycle: text-tertiary → text-secondary → text-tertiary

  ── USER MESSAGE BUBBLE ──
  Layout: Bubble left, user avatar right

  Avatar:
    32px circle, user initials
    Background: var(--color-bg-subtle)
    Color: var(--color-text-secondary)

  Bubble:
    Background: var(--color-accent-light)
    Border: 1px solid rgba(26,26,46,0.12)
    Border-radius: 16px 4px 16px 16px (sharp top-right)
    Padding: 16px 20px
    Font: DM Sans 400, 15px

  ── SYSTEM MESSAGE ──
  Centered, no avatar
  Font: DM Sans 500, 12px, uppercase, tracking 0.08em
  Color: text-tertiary
  Background: var(--color-bg-subtle)
  Padding: 6px 16px
  Radius: var(--radius-full)
  Example: "— DSA Questions Complete. Moving to Resume Questions —"

  DATE/TIME STAMP:
    Appears between message groups (when >5 min gap)
    Same style as system message

──────────────────────────────────
INPUT BAR
──────────────────────────────────
  Height: 72px (expands with content)
  Background: var(--color-bg-surface)
  Border-top: 1px solid var(--color-bg-muted)
  Padding: 12px 24px

  TEXTAREA:
    Grows from 1 line to max 6 lines
    No border, no background
    Font: DM Sans 400, 15px
    Placeholder: "Type your answer here… (Shift+Enter for new line)"
    Resize: none (handled by JS auto-height)
    Width: fills available space

  SEND BUTTON:
    Right side, 40px icon button (primary)
    Arrow-up icon
    Disabled when textarea empty
    Hover: scale(1.05)
    Active: scale(0.96)
    Keyboard: Enter to send (Shift+Enter for newline)

  BOTTOM HINTS (when focused):
    Small text below: "Enter to send · Shift+Enter for newline · 6/7 questions remaining"
    Font: DM Sans 400, 11px, text-tertiary

──────────────────────────────────
MOBILE INTERVIEW LAYOUT (<768px)
──────────────────────────────────
  Header: Slim (48px), ticker collapsed to "Q2/7 · 14:32"
  Chat: Full screen
  Input: Fixed bottom, above system keyboard
  Safe area insets applied
```

---

### SCREEN 6: Session Complete / Feedback (`/interview/[sessionId]/feedback`)

**The payoff moment. Must feel rewarding and informative.**

```
LAYOUT:
  Single column, max-width 800px, centered
  Generous padding: 64px 24px

──────────────────────────────────
CELEBRATION HEADER
──────────────────────────────────
  Confetti animation: 40 particles (CSS keyframes), trigger on load
  Colors: accent / success / warning

  HEADING: "Interview Complete."
  Playfair Display 700, 52px, centered
  Subtext: "Here's how you performed. Review, improve, repeat."
  DM Sans 400, 17px, text-secondary, centered

──────────────────────────────────
SCORE CARD (hero element)
──────────────────────────────────
  Background: var(--color-accent)
  Radius: var(--radius-2xl)
  Padding: 48px
  Text: white

  LARGE SCORE:
    Playfair Display 700, 96px, white
    Animates from 0 → final score (1.2s ease-out, counting up)
    "/ 100" in DM Sans 400, 28px, rgba(255,255,255,0.6)

  SCORE LABEL: e.g. "Strong Performance" / "Solid Start" / "Keep Practicing"
    DM Sans 600, 18px, white

  DIVIDER (1px, rgba(255,255,255,0.15))

  3 MINI SCORES in a row:
    DSA Score: "72"
    Resume Score: "85"
    Communication: "78"
    Each: Label (DM Sans 500, 11px, rgba(255,255,255,0.6), uppercase) + Score (DM Sans 700, 28px, white)

  Progress bars below each (thin, 4px):
    Background: rgba(255,255,255,0.2)
    Fill: white
    Animated fill on load (600ms ease-out)

──────────────────────────────────
DETAILED FEEDBACK SECTIONS
──────────────────────────────────
  3 cards, stacked

  CARD 1: STRENGTHS
    Header: Green check icon + "What You Did Well"
    DM Sans 600, 17px
    Content: 3-4 bullet points (DM Sans 400, 15px, line-height 1.7)
    Background: var(--color-success-light)
    Border-left: 4px solid var(--color-success)

  CARD 2: AREAS FOR IMPROVEMENT
    Header: Warning icon + "Where to Focus Next"
    Content: 3-4 specific, constructive points
    Background: var(--color-warning-light)
    Border-left: 4px solid var(--color-warning)

  CARD 3: QUESTION-BY-QUESTION BREAKDOWN
    Header: List icon + "Question Breakdown"
    
    Each question row:
      Question number + short title (e.g., "Q1 — Merge Sort Time Complexity")
      Performance pill: Excellent / Good / Needs Work
      Expandable → clicks to show AI feedback for that question
      Expand/collapse: smooth 240ms height animation

──────────────────────────────────
IMPROVEMENT ROADMAP
──────────────────────────────────
  HEADING: "Your Next Steps" (DM Sans 600, 20px)

  Timeline-style list (vertical line, left side):
    Each step: numbered circle + title + description
    
    Example steps:
    1. Review binary tree problems on LeetCode (linked concept)
    2. Practice dynamic programming patterns
    3. Brush up on your [ProjectName] technical details

  "Add to Calendar" button (outline, calendar icon)

──────────────────────────────────
ACTION ROW
──────────────────────────────────
  3 options in a row:
    "Practice Again" → same company (primary button)
    "Try Another Company" → goes to setup (outline)
    "Download Report" → PDF export (ghost, download icon)
  
  Below: "Share your score" with social share icons (LinkedIn, Twitter/X)
```

---

### SCREEN 7: My Sessions (`/sessions`)

```
LAYOUT: Sidebar + Main content (same as Dashboard)

HEADER:
  "Interview History"
  Playfair Display 700, 32px

FILTER ROW:
  — Search input (left): "Search sessions..."
  — Company filter (dropdown): All Companies / Google / Amazon / ...
  — Status filter (pill group): All / Completed / In Progress / Draft
  — Sort: Newest / Highest Score / Company

SESSIONS LIST:
  Table-style, each row:
    Company logo (24px) | Session Date | Duration | Score (progress bar) | Status pill | Actions ("View" / "Resume")
  
  Alternating row backgrounds (every other: var(--color-bg-subtle))
  Hover: shadow-xs, slight bg shift
  Expandable row: click to see quick summary inline

PAGINATION:
  "Showing 1–10 of 24" + Prev/Next buttons + Page number pills

EMPTY STATE: (same as dashboard empty state)
```

---

### SCREEN 8: Settings (`/settings`)

```
LAYOUT: Sidebar + Tabbed content

TABS (horizontal, below page header):
  Profile | Security | Preferences | Notifications

── PROFILE TAB ──
  Avatar (64px) with "Change Photo" overlay on hover
  Form: First Name, Last Name, Email (disabled), Bio
  "Save Changes" button (bottom)

── SECURITY TAB ──
  Change Password section
  Active sessions list (device + location + last active + "Revoke" link)
  Danger zone: "Delete Account" (red, confirmation modal)

── PREFERENCES TAB ──
  "Default Company" selector
  "Interview Difficulty": Medium / Hard (toggle)
  "Auto-save Interval": 30s / 1min / 2min
  Theme: Light / Dark / System (toggle chips — Light theme only in current build, others show "Coming Soon" badge)

── NOTIFICATIONS TAB ──
  Toggle list:
    ✓ Email me my feedback report
    ✓ Weekly practice reminders
    ○ Product updates and tips
```

---

### SCREEN 9: Resume Manager (`/resume`)

```
FULL RESUME PREVIEW:
  Left 40%: PDF viewer (embed or react-pdf)
  Right 60%: Extracted info panel
    — Skills detected (pill cloud)
    — Experience entries
    — Projects listed
    — Education

REPLACE RESUME:
  Drag-drop zone (same as dashboard)

RESUME INSIGHTS:
  "Skills Detected": Technical skill pills (color-coded by category)
  "Experience": List of positions extracted
  "Interview Readiness": Simple bar for each company showing fit
```

---

## 5. Interaction & Animation Spec

### 5.1 Page Transitions

```
Between routes:
  Exit: Fade out + translateY(-8px), 200ms
  Enter: Fade in + translateY(8px) → 0, 300ms, 50ms delay
  Total: seamless crossfade effect

Implementation: React Router + CSS transition classes
```

### 5.2 Message Appear Animation

```css
@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.message {
  animation: messageAppear 280ms var(--ease-out-quart) forwards;
}
```

### 5.3 Score Count-Up Animation

```javascript
// Animate score from 0 to target over 1200ms
// Use requestAnimationFrame with easeOutQuart easing
// Playfair Display font must render at each frame
```

### 5.4 Confetti (Feedback Screen)

```
40 particles, random:
  — Colors: #1A1A2E, #1C7A4A, #A85C00, #4285F4
  — Shapes: rect, circle
  — Duration: 2.4s
  — Easing: cubic-bezier(0, 0.9, 0.57, 1)
  — Fall + rotate + fade out
  — Trigger once on mount
```

### 5.5 Micro-interactions

```
Button click: scale(0.97), 80ms
Card hover: translateY(-2px) + shadow-md, 200ms
Input focus: border glow 150ms
Navigation active: background slide, 200ms
Sidebar item: background fill slides from left (::before pseudo-element)
Company card select: scale(1.02) + border 200ms ease-spring
Progress bar fill: ease-out-quart, 600ms
```

---

## 6. Responsive Breakpoints

```
Mobile:   <640px   — Single column, bottom nav replaces sidebar
Tablet:   640–1023px — Condensed sidebar (icons only, 56px width)
Desktop:  ≥1024px  — Full layout as specified

MOBILE NAVIGATION (bottom bar):
  Fixed, 56px height
  Background: var(--color-bg-surface)
  Border-top: 1px solid var(--color-bg-muted)
  5 items: Home / Interview / Sessions / Resume / Settings
  Active: accent color icon + label
```

---

## 7. Technical Implementation Spec

### 7.1 Tech Stack

```
Framework:    React 18 + Vite
Routing:      React Router v6
Styling:      TailwindCSS v3 (custom tokens configured in tailwind.config.js)
UI Primitives: Radix UI (dialogs, dropdowns, tooltips, tabs)
Animations:   CSS keyframes + Framer Motion for complex interactions
PDF Viewer:   react-pdf
PDF Upload:   react-dropzone
Icons:        Lucide React
Fonts:        Google Fonts (Playfair Display, DM Sans, JetBrains Mono)
HTTP Client:  Axios
State:        React Context + useReducer (or Zustand)
Forms:        React Hook Form + Zod validation
```

### 7.2 File Structure

```
src/
├── assets/
│   ├── logos/          # Company SVG logos
│   └── illustrations/  # Empty state SVGs
├── components/
│   ├── ui/             # Design system primitives
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── AppLayout.jsx
│   ├── interview/
│   │   ├── MessageBubble.jsx
│   │   ├── TypingIndicator.jsx
│   │   ├── InterviewHeader.jsx
│   │   └── InputBar.jsx
│   └── feedback/
│       ├── ScoreCard.jsx
│       ├── Confetti.jsx
│       └── FeedbackSection.jsx
├── pages/
│   ├── Landing.jsx
│   ├── Auth.jsx
│   ├── Dashboard.jsx
│   ├── InterviewSetup.jsx
│   ├── InterviewRoom.jsx
│   ├── Feedback.jsx
│   ├── Sessions.jsx
│   ├── Resume.jsx
│   └── Settings.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useInterview.js
│   └── useAutoSave.js
├── services/
│   ├── api.js
│   └── auth.js
├── styles/
│   └── globals.css     # CSS custom properties
└── App.jsx
```

### 7.3 API Contract (Frontend ↔ Python Backend)

```
POST /api/auth/signup       — { email, password, firstName, lastName }
POST /api/auth/login        — { email, password }
POST /api/auth/logout       — {}
GET  /api/auth/me           — returns user object

POST /api/resume/upload     — FormData with PDF file
GET  /api/resume            — returns resume metadata + extracted text

POST /api/sessions/create   — { companyId }
GET  /api/sessions          — returns list of all user sessions
GET  /api/sessions/:id      — returns full session with messages

POST /api/sessions/:id/message — { content: "user message" }
  Returns: { role: "assistant", content: "AI response" }

POST /api/sessions/:id/complete — triggers feedback generation
GET  /api/sessions/:id/feedback — returns structured feedback object

Feedback Object Schema:
{
  overallScore: number,        // 0-100
  dsaScore: number,
  resumeScore: number,
  communicationScore: number,
  performanceLabel: string,    // "Strong Performance" etc.
  strengths: string[],
  improvements: string[],
  nextSteps: string[],
  questionBreakdown: [
    {
      questionNumber: number,
      questionTitle: string,
      performanceRating: "excellent" | "good" | "needs_work",
      feedback: string
    }
  ]
}
```

### 7.4 Authentication

```
JWT tokens stored in httpOnly cookies (not localStorage)
Token refresh: silent refresh via interceptor
Protected routes: <PrivateRoute> wrapper component
Redirect to /auth if unauthenticated
```

### 7.5 Real-time / Auto-save

```
Auto-save: Triggered after every message POST succeeds
Save indicator: Updates ticker text to "AUTOSAVED ✓" for 2s then returns to "AUTOSAVED"
Session recovery: On load, check for in-progress sessions and offer to resume
```

---

## 8. Empty States & Edge Cases

```
NO RESUME UPLOADED:
  Dashboard: Info banner at top
  Interview Setup: Yellow warning (non-blocking)
  Resume Page: Full upload zone

SESSION LOADING:
  Skeleton screens (animated shimmer gradient)
  Show for: dashboard stats, session list, feedback scores

AI RESPONSE LOADING:
  Typing indicator in chat (never a spinner or "Loading...")

ERROR STATES:
  API error: Toast notification (bottom-right, 4s auto-dismiss)
    — Red border, error icon, message, "Retry" action
  Connection lost: Banner below header "Reconnecting..."
  
FILE UPLOAD:
  Too large: "File exceeds 10MB limit"
  Wrong type: "Please upload a PDF file"
  Upload success: Green toast + resume card updates

INTERVIEW ENDED ACCIDENTALLY:
  "End Session" → Confirmation modal before ending
  Modal: "Are you sure you want to end this interview? Your progress will be saved."
  Buttons: "Keep Going" (primary) + "End Interview" (outline-danger)
```

---

## 9. Accessibility

```
— All interactive elements: visible focus rings (2px var(--color-accent), 2px offset)
— Color contrast: WCAG AA minimum (4.5:1 for normal text)
— Keyboard navigation: Full app navigable without mouse
— Screen reader: aria-labels on icon buttons, role="log" on chat, aria-live="polite" on new messages
— Reduced motion: @media (prefers-reduced-motion: reduce) disables all animations
— Focus trap: Modals and dropdowns use Radix UI built-in focus management
```

---

## 10. Build & Deployment Notes

```
Build command:    npm run build
Output:           dist/ (served as static files)
Environment vars: VITE_API_URL (backend URL)
Code splitting:   Lazy-load Interview and Feedback pages
Asset optimization: Vite handles CSS/JS minification, image optimization

Suggested hosting: Vercel / Netlify (static frontend)
Backend:          Python FastAPI on Railway / Render
```

---

## 11. Implementation Priority Order

```
PHASE 1 (Core Flow):
  1. Design tokens setup (globals.css, tailwind.config.js)
  2. UI component library (Button, Input, Card, Badge, Avatar)
  3. Auth page (Login/Signup with all validation)
  4. Dashboard (with mock data)
  5. Interview Room (chat interface, full functionality)
  6. Feedback Screen

PHASE 2 (Supporting):
  7. Landing Page (all sections)
  8. Sessions list page
  9. Resume page
  10. Settings page

PHASE 3 (Polish):
  11. Page transitions
  12. Confetti animation
  13. Mobile responsive
  14. Accessibility audit
  15. Performance optimization
```

---

*End of FastTrackHire Design Document v1.0*
*This document is the single source of truth for the frontend build. Every pixel described here should be implemented as specified. No design decisions are left to interpretation.*