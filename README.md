# 🌐 moinsheikh.in — Personal Portfolio

> **Live site:** [https://www.moinsheikh.in](https://www.moinsheikh.in)

A full-featured personal portfolio built with **React 19 + Vite 7**, featuring cinematic page transitions, a draggable 3D globe, scroll-linked project showcases, a blog system backed by Supabase, and a Labs page with a terminal-style UI. Deployed on Vercel with Analytics and Speed Insights.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Pages & Routes](#-pages--routes)
- [Key Features](#-key-features)
- [Sections Breakdown](#-sections-breakdown)
- [Components](#-components)
- [Backend — Supabase](#-backend--supabase)
- [Auth — Clerk](#-auth--clerk)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Performance & Analytics](#-performance--analytics)
- [Design System](#-design-system)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite 7 |
| **Routing** | React Router DOM v7 |
| **Animation** | Framer Motion v12 |
| **Smooth Scroll** | Lenis v1 |
| **Styling** | TailwindCSS v4 + Vanilla CSS-in-JS |
| **Backend / DB** | Supabase (PostgreSQL) |
| **Auth** | Clerk |
| **Blog Rendering** | `marked` (Markdown parser) |
| **GitHub Activity** | `react-github-calendar` |
| **UI Icons** | `react-icons` |
| **Analytics** | Vercel Analytics + Speed Insights |
| **Deployment** | Vercel |
| **Fonts** | Inter, Montserrat, Playfair Display, JetBrains Mono |

---

## 📁 Project Structure

```
site/
├── public/
│   ├── favicon.ico
│   ├── fav.webp
│   ├── og-image.png               # Social preview (1200×630)
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── cropped_circle_image.webp  # Profile photo
│   ├── desktop-*.webp             # Project desktop screenshots
│   ├── mobile-*.webp              # Project mobile screenshots
│   └── image1–10.webp             # About section photo carousel
│
├── src/
│   ├── main.jsx                   # App entry — ClerkProvider wraps everything
│   ├── App.jsx                    # Router, page transitions, Analytics, SpeedInsights
│   ├── index.css                  # Global reset
│   │
│   ├── pages/
│   │   ├── Home.jsx               # Landing page (assembles all sections)
│   │   ├── About.jsx              # About page
│   │   ├── Work.jsx               # Projects page
│   │   ├── Blogs.jsx              # Blog listing with pagination
│   │   ├── BlogDetail.jsx         # Single blog post renderer
│   │   ├── Labs.jsx               # Side projects / experiments terminal UI
│   │   ├── Links.jsx              # Social links hub
│   │   └── Guestbook.jsx          # Visitor guestbook (Clerk-auth gated)
│   │
│   ├── sections/
│   │   ├── Hero.jsx               # Full-screen typographic hero
│   │   ├── About.jsx              # Draggable globe + photo carousel + widgets
│   │   ├── Projects.jsx           # Sticky scroll project showcase
│   │   ├── AI-Playground.jsx      # Interactive AI demos
│   │   ├── Skills.jsx             # Pill-grid tech stack
│   │   ├── Glace.jsx              # "A Quick Glance" bio section
│   │   ├── BehindSystems.jsx      # Philosophy / values section
│   │   └── GitHubActivity.jsx     # Live GitHub contribution heatmap
│   │
│   ├── components/
│   │   ├── Navbar.jsx             # Sticky navigation with mobile menu
│   │   ├── Footer.jsx             # Site footer
│   │   ├── PageTransition.jsx     # Flood transition system (context + wrapper)
│   │   ├── SmoothScroll.jsx       # Lenis smooth scroll provider
│   │   ├── PageHero.jsx           # Reusable inner-page hero header
│   │   ├── CommandPalette.jsx     # ⌘K command palette overlay
│   │   └── LifeSnapshotCard.jsx   # Personal snapshot card widget
│   │
│   └── lib/
│       └── supabase.js            # Supabase client (env-driven)
│
├── index.html                     # HTML shell with all meta/OG/Twitter tags
├── package.json
├── vite.config.js
└── vercel.json                    # SPA rewrite rules
```

---

## 🗺 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | `Home.jsx` | Main landing page with all hero sections |
| `/about` | `About.jsx` | Detailed about page with GitHub activity |
| `/work` | `Work.jsx` | Portfolio of shipped projects |
| `/blogs` | `Blogs.jsx` | Paginated blog listing (6 per page) |
| `/blog/:slug` | `BlogDetail.jsx` | Full Markdown blog post |
| `/labs` | `Labs.jsx` | Experimental tools & side projects (terminal UI) |
| `/links` | `Links.jsx` | Social media hub |
| `/guestbook` | `Guestbook.jsx` | Auth-gated visitor guestbook |

All routes are wrapped in `<PageTransition>` which provides the animated enter/exit between pages.

---

## ✨ Key Features

### 🎬 Flood Page Transitions
Custom context-based transition system (`PageTransition.jsx`) that animates pages out (slide up + fade) before navigating and slides the new page in. Prevents white flashes and works with Framer Motion's GPU-only `y` transform.

### 🌍 Draggable Interactive Globe
The `About` section contains a hand-built canvas globe (no library) that:
- Renders landmass dots via bounding-box geographic data
- Auto-rotates on idle with inertia
- Clicks/drags to spin manually (mouse + touch)
- Snaps to India 🇮🇳, UK 🇬🇧, or US 🇺🇸 when switching location chips
- Shows a glowing white dot marker for the active country

### 📸 Arc Photo Carousel
A physics-driven photo arc wheel in the About section:
- 10 personal photos arranged on a circular arc
- Scroll-linked rotation (photos move as you scroll)
- Draggable with momentum on both desktop and mobile
- Cards fade out toward the edges and fade in at center

### 📌 Sticky Scroll Project Showcase
The Projects section pins the panel to the viewport and changes the active project as you scroll through a tall wrapper (`(N+1) × 100vh`):
- Scroll progress maps to project index via `useScroll` + `useTransform`
- Animated desktop + mobile mockups swap on each project
- A vertical timeline with a profile photo marker follows scroll
- Ambient color glows shift per-project accent color

### 🧪 Labs — Terminal UI
Full-featured dev-ops-style labs page:
- Boot sequence animation on first visit
- Command input with tab-autocomplete (`show ready`, `show building`, `surprise me`)
- Tool rows with ASCII progress bars `[████░░░]`
- Slide-in drawer with full project details, tech stack, features, and links
- Status system: `READY`, `BUILDING`, `QUEUED`, `EXPERIMENTAL`
- All data driven from Supabase `labs` table

### 📝 Blog System
- Blogs stored in Supabase with title, slug, tag, date, reading time, description, and markdown body
- Tagged by category: `AI`, `Engineering`, `Design`, `Career`, `Startup`
- 6-per-page pagination with smooth scroll-to-top
- Individual post pages render full Markdown via `marked`
- Skeleton loading cards during fetch

### 📖 Guestbook
- Clerk authentication required to leave a message
- Real-time messages stored in Supabase
- Visitors can sign in with their social account and leave a note

### 🔍 Command Palette
Triggered via `⌘K` / `Ctrl+K`, the `CommandPalette.jsx` offers quick navigation across all pages.

### ⏱ Lenis Smooth Scroll
All scroll on the site is powered by **Lenis** — exponential ease-out with 1.4s duration. Stays in sync with Framer Motion's `useScroll` so all scroll-linked animations work perfectly.

---

## 🧩 Sections Breakdown

### `Hero.jsx`
- Full-screen black canvas
- Oversized "MOIN" heading in Montserrat 900 (`clamp(64px, 15vw, 280px)`)
- Staggered animated tagline: `I DESIGN AND BUILD PRODUCTS THAT` + italic `deliver real impact.`
- Bottom corners show location (Nagpur, India) and role (AI Innovator & Web Developer)
- Three-phase animation: name fade-in → tagline blur-up → bottom slide-up

### `sections/About.jsx`
A rich, interactive bento-style section with multiple sub-widgets:
- **Interactive Globe** — draggable canvas with country selector chips (IN / GB / US)
- **Arc Photo Carousel** — 10 personal photos in a scrollable arc wheel
- **Analog Clock** — live SVG clock showing current Nagpur IST time
- **Phone Mockups** — three parallax scroll-driven phone shells showing project UIs
- **Stats widgets** — years of experience, projects built, cups of tea
- **Social links** — GitHub, LinkedIn, X buttons
- **Connect CTA** — email button

### `sections/Projects.jsx`
- Data comes from Supabase `projects` table with fallback static data
- Four showcase projects: **MadeIt**, **Nexora Learn AI**, **LevelUp.dev**, **AI Resume Analyzer**
- Desktop view: sticky scroll with 3-column layout (description | timeline | mockups)
- Mobile view: vertical card stack

### `sections/Skills.jsx`
- 30+ skill pills across: Frontend, Backend, AI/Data, Databases, Auth, Tools, DevOps
- Each pill has a colored symbol badge that glows on hover
- Data fetched from Supabase `skills` table with static fallback

### `sections/GitHubActivity.jsx`
- Live contribution heatmap via `react-github-calendar` for `moin-dbud`
- Custom floating tooltip (fixed-position to escape overflow clipping)
- Hover interaction: cells scale up + brighten on hover

### `sections/Glace.jsx`
Reusable bio/introduction section used on both Home and About pages with different content.

### `sections/BehindSystems.jsx`
Philosophy section explaining the approach to building software.

### `sections/AI-Playground.jsx`
Interactive demonstrations of AI-related experiments and capabilities.

---

## 🧱 Components

### `Navbar.jsx`
- Sticky top navigation with scroll-driven pill background
- Desktop: horizontal link list with hover underlines
- Mobile: hamburger menu with full-screen overlay
- Active route detection with visual indicator

### `Footer.jsx`
- Full-width footer with links, social icons, and copyright
- Matches the dark (#000) design system

### `PageTransition.jsx`
```jsx
// Context provides floodNavigate() — call instead of navigate()
const { floodNavigate } = useFloodNavigate();
floodNavigate('/about');

// Wrap each route in <PageTransition>
<Route path="/about" element={<PageTransition><About /></PageTransition>} />
```

- Enter: `opacity: 0, y: 18` → `opacity: 1, y: 0` (0.52s ease)
- Exit: `opacity: 1, y: 0` → `opacity: 0, y: -18` (0.52s ease)

### `PageHero.jsx`
Reusable section header for inner pages. Accepts `title`, `subtitle`, and `highlight` props.

### `CommandPalette.jsx`
Global `⌘K` overlay for searching and navigating pages. Keyboard accessible.

---

## 🗄 Backend — Supabase

Supabase provides the PostgreSQL database for dynamic content.

### Tables

| Table | Used By | Key Columns |
|---|---|---|
| `projects` | `Projects.jsx` | `title`, `category`, `description`, `features`, `tech`, `color`, `image_desktop`, `image_mobile`, `is_visible`, `sort_order` |
| `blogs` | `Blogs.jsx`, `BlogDetail.jsx` | `title`, `slug`, `description`, `tag`, `date`, `reading_time`, `body` (Markdown), `is_published`, `sort_order` |
| `skills` | `Skills.jsx` | `name`, `color`, `sym`, `is_visible`, `sort_order` |
| `labs` | `Labs.jsx` | `title`, `description`, `status`, `type`, `features`, `tech_stack`, `tags`, `problem`, `dev_note`, `links`, `is_featured`, `is_late_night` |
| `guestbook` | `Guestbook.jsx` | `name`, `message`, `created_at`, `user_id` |

### Supabase Client
```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

All tables have Row Level Security (RLS) enabled. The `guestbook` table requires Clerk user authentication to write.

---

## 🔐 Auth — Clerk

Clerk handles authentication for the Guestbook page.

- Provider: `<ClerkProvider>` wraps the entire app in `main.jsx`
- After sign-out, users are redirected to `/guestbook`
- Only used for the Guestbook — rest of the site is fully public

---

## 🔑 Environment Variables

Create a `.env` file in the `site/` directory:

```env
# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx

# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ All variables must start with `VITE_` to be exposed to the browser by Vite.  
> The app will throw at startup if `VITE_CLERK_PUBLISHABLE_KEY` is missing.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/moin-dbud/My-domain.git
cd My-domain/site

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Fill in your Clerk and Supabase keys

# 4. Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📜 Scripts

```bash
npm run dev      # Start Vite dev server (HMR)
npm run build    # Build for production → dist/
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## 🚢 Deployment

The site is deployed on **Vercel** via GitHub integration.

### Auto-Deploy
Every push to the `main` branch on `moin-dbud/My-domain` triggers a Vercel build.

### Build Settings (Vercel)
| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Root Directory | `site` |

### SPA Routing Fix
`vercel.json` at the project root rewrites all routes to `index.html` so React Router handles them client-side:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Without this, direct navigation to `/about`, `/work`, etc. would return 404.

### Environment Variables
Set all `VITE_*` variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

---

## 📊 Performance & Analytics

### Vercel Analytics
Tracks real user page views across all routes automatically via the `<Analytics />` component placed in `App.jsx`.

### Vercel Speed Insights
Measures Core Web Vitals (LCP, INP, CLS) in production via `<SpeedInsights />` placed in `App.jsx`.

Both are imported from their respective `/react` entrypoints (not `/next`) since this is a Vite project.

---

## 🎨 Design System

### Color Palette
| Role | Value |
|---|---|
| Background | `#000000` |
| Surface | `#0a0a0a` / `#0c0c0c` |
| Border | `rgba(255,255,255,0.07)` |
| Text Primary | `rgba(255,255,255,0.92)` |
| Text Secondary | `rgba(255,255,255,0.42)` |
| Text Muted | `rgba(255,255,255,0.25)` |
| Accent Green | `#4ade80` |
| Accent Purple | `#c084fc` |
| Accent Yellow | `#facc15` |

### Typography
| Font | Usage | Weight |
|---|---|---|
| **Inter** | Body, UI, labels | 300–900 |
| **Montserrat** | Hero name "MOIN" | 900 |
| **Playfair Display** | Italic accents, section subtitles | 400 italic |
| **JetBrains Mono** | Labs terminal UI, code elements | 300–700 |

### Animation Philosophy
- All page-level transitions use `duration: 0.52s` with `ease: [0.22, 1, 0.36, 1]` (soft spring)
- Scroll-linked animations use Framer Motion's `useScroll` + `useTransform`
- Physics interactions (globe, photo carousel, phone mockups) use `useSpring`
- Micro-interactions: `translateY(-6px)` on card hover, border-color transitions at `0.3s`
- GPU-only properties used exclusively: `transform`, `opacity`, `filter`

---

## 📬 Contact

| Platform | Link |
|---|---|
| Website | [moinsheikh.in](https://www.moinsheikh.in) |
| GitHub | [@moin-dbud](https://github.com/moin-dbud) |
| LinkedIn | [moin-build](https://www.linkedin.com/in/moin-build/) |
| X / Twitter | [@Moin_Sheikh09](https://x.com/Moin_Sheikh09) |
| Email | hello@moinsheikh.in |

---

<div align="center">
  <sub>Built with ♥ by Moin Sheikh — Nagpur, India</sub>
</div>
