<p align="center">
  <img src="public/cropped_circle_image.webp" width="130" height="130" style="border-radius: 50%; border: 3px solid #6366f1; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);" alt="Moin Sheikh Avatar" />
</p>

<h1 align="center">⚡ MOIN SHEIKH — PORTFOLIO & AI SYSTEMS ENGINE ⚡</h1>

<p align="center">
  <b>A modern, high-performance developer portfolio, product showcase, and database-backed RAG AI engine built with React 19, Vite, Tailwind CSS v4, Supabase pgvector, Clerk Auth, and OpenRouter LLMs.</b>
</p>

<p align="center">
  <a href="https://moinsheikh.in"><img src="https://img.shields.io/badge/Live_Website-moinsheikh.in-6366F1?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Website" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.2-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-pgvector-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase pgvector" /></a>
  <a href="https://clerk.com/"><img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" /></a>
  <a href="https://openrouter.ai/"><img src="https://img.shields.io/badge/OpenRouter-Llama_3.3_70B-FF6B6B?style=for-the-badge&logo=openai&logoColor=white" alt="OpenRouter AI" /></a>
  <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-WebGL-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" /></a>
</p>

---

## 🌟 Overview

Welcome to the production repository for **Moin Sheikh's** personal developer portfolio and interactive product engine. Based in **Nagpur, India**, Moin specializes in building high-impact full-stack web products, intelligent retrieval-augmented generation (RAG) systems, and immersive web experiences.

This platform goes beyond a static portfolio: it is a full-featured web application combining **database-backed RAG search**, **3D interactive WebGL visualizers**, **Clerk-authenticated real-time interactions**, **spotlight search (`Cmd + K`)**, and **Vercel serverless background microservices**.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   USER / BROWSER                                       │
└───────────────────────────┬────────────────────────────────┬───────────────────────────┘
                            │                                │
                            ▼                                ▼
            ┌──────────────────────────────┐  ┌──────────────────────────────┐
            │   Client Application (Vite)  │  │    Clerk Authentication      │
            │   React 19 + Tailwind v4     │  │    User Sessions & Profiles  │
            │   Lenis + Framer Motion      │  └──────────────────────────────┘
            └───────────────┬──────────────┘
                            │
                            ▼
            ┌──────────────────────────────┐
            │  Vercel Serverless API Routes│
            │        (/api/*)              │
            └───────┬──────────────┬───────┴─────────────────────────┐
                    │              │                                 │
                    ▼              ▼                                 ▼
┌──────────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
│     /api/playground.js       │ │    /api/send-email.js    │ │     /api/spotify.js       │
│  - Gemini 768-dim Embeddings │ │  - Nodemailer SMTP        │ │  - Spotify Web API        │
│  - Supabase pgvector RPC     │ │  - Transactional HTML Mail│ │  - Live/Recent Playback   │
│  - OpenRouter Llama 3.3 70B  │ └───────────────────────────┘ └───────────────────────────┘
└───────────────┬──────────────┘
                │
                ▼
┌──────────────────────────────┐
│  Supabase Vector Database    │
│  - rag_projects              │
│  - rag_documents             │
│  - rag_chunks (vector 768)   │
│  - match_project_chunks()    │
└──────────────────────────────┘
```

---

## ✨ Key Features & Capabilities

- 🤖 **Database-Backed RAG AI Playground (`/playground`)**:
  - Intelligent AI assistant grounded in real project documentation and technical architecture.
  - Generates 768-dimensional embeddings via Google Gemini (`gemini-embedding-001`).
  - Performs high-speed vector similarity search using **Supabase `pgvector`** (`IVFFlat` vector indexing).
  - Streams contextually grounded answers using **OpenRouter** (`meta-llama/llama-3.3-70b-instruct:free`).

- ⚡ **Interactive Product Labs & 3D Visuals (`/labs`, `/work`)**:
  - Interactive WebGL & 3D interactive canvases powered by **Three.js** and **React Three Fiber**.
  - Showcases flagship projects including **Buildo**, **MadeIt**, **Nexora**, and **LevelUp**.

- 💬 **Authenticated Real-Time Guestbook (`/guestbook`)**:
  - Community wall backed by **Supabase Database** and secured with **Clerk Authentication**.
  - Includes real-time message posting, user profile avatars, and instant UI state updates.

- ⌨️ **Spotlight Command Palette (`Cmd + K` / `Ctrl + K`)**:
  - Full-keyboard navigation drawer built with `@headlessui/react` and custom search filters.
  - Instantly search routes, trigger actions, view social profiles, and jump to specific sections.

- 🎨 **Lenis Smooth Physics & Custom Page Transitions**:
  - Smooth physics-based scrolling provided by **Lenis**.
  - Custom React Context page transition canvas (`PageTransition.jsx`) eliminating edge flashes during routing.

- 🎵 **Live Spotify Integration (`/api/spotify.js`)**:
  - Serverless API handler exchanging refresh tokens to display real-time listening state or recent tracks.

- ✉️ **Booking & Automated Email Pipeline (`/book-a-call`)**:
  - Integrated meeting scheduler connected to a custom **Nodemailer** HTML email engine (`/api/send-email.js`).

- 📝 **Markdown Technical Blog (`/blogs`)**:
  - Developer-focused blogging engine utilizing **Marked** for custom syntax highlighting and estimated read times.

---

## 🛠️ Technology Stack

| Domain | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [Vite 7](https://vitejs.dev/) | High-performance SPA with modern React APIs and lightning-fast HMR |
| **Routing** | [React Router v7](https://reactrouter.com/) | Declarative client-side routing & page management |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) | Engine-driven utility CSS with custom glassmorphism tokens |
| **3D Graphics & Canvas**| [Three.js](https://threejs.org/) / [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) | WebGL 3D canvas, lighting, and interactive geometries |
| **Motion & Scroll** | [Framer Motion 12](https://www.framer.com/motion/) + [Lenis](https://lenis.darkroom.engineering/) | Smooth scroll physics and spring-based UI animations |
| **Authentication** | [Clerk React](https://clerk.com/) | OAuth login, secure user management, and avatar sync |
| **Database & Vector Store**| [Supabase JS](https://supabase.com/) + [pgvector](https://github.com/supabase/pgvector) | PostgreSQL database with 768-dim vector embeddings and RLS policies |
| **AI & LLM Services** | [Google Gemini Embeddings](https://ai.google.dev/) + [OpenRouter](https://openrouter.ai/) | `gemini-embedding-001` + `Llama-3.3-70B-Instruct` RAG pipeline |
| **Serverless API** | Vercel Serverless Functions (`/api`) | Node.js backend endpoints for AI, Email, and Spotify |
| **Email Engine** | [Nodemailer](https://nodemailer.com/) | HTML transactional email dispatch via Gmail SMTP |
| **Analytics** | [@vercel/analytics](https://vercel.com/analytics) | Web vitals and privacy-friendly visitor analytics |

---

## 📊 Database & RAG Schema

The RAG engine uses a structured PostgreSQL schema configured in Supabase:

```sql
-- 1. Projects table
create table public.rag_projects (
  id            bigint generated always as identity primary key,
  slug          text unique not null,
  name          text not null,
  tech_stack    jsonb default '[]'::jsonb,
  metadata      jsonb default '{}'::jsonb
);

-- 2. Documents table (Stores source README content hashes)
create table public.rag_documents (
  id            bigint generated always as identity primary key,
  project_id    bigint references public.rag_projects(id) on delete cascade,
  title         text not null,
  content_hash  text
);

-- 3. Chunks table (Stores section-aware text chunks with 768-dim vector embeddings)
create table public.rag_chunks (
  id            bigint generated always as identity primary key,
  project_id    bigint references public.rag_projects(id) on delete cascade,
  document_id   bigint references public.rag_documents(id) on delete cascade,
  content       text not null,
  section_title text,
  embedding     vector(768) -- Gemini gemini-embedding-001
);

-- 4. Similarity Search RPC Function
create or replace function public.match_project_chunks(
  query_embedding vector(768),
  match_project_id bigint,
  match_threshold float default 0.2,
  match_count int default 5
)
returns table (id bigint, content text, section_title text, similarity float)
language sql stable as $$
  select id, content, section_title, 1 - (embedding <=> query_embedding) as similarity
  from rag_chunks
  where project_id = match_project_id
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

### Automated Ingestion Pipeline

To chunk project documentation, generate embeddings, and populate Supabase:

```bash
node scripts/ingest-projects.js [--force]
```

---

## 📂 Project Structure

```text
site/
├── api/                       # Vercel Serverless Functions
│   ├── playground.js          # RAG API endpoint (Gemini embeddings + OpenRouter LLM)
│   ├── send-email.js          # Nodemailer email notification helper
│   └── spotify.js             # Spotify live playback integration endpoint
├── public/                    # Static assets, WebP images, sitemap, & favicon
│   ├── sitemap.xml
│   └── cropped_circle_image.webp
├── scripts/                   # Database migrations & CLI automation scripts
│   ├── guestbook-migration.sql# Supabase SQL for Guestbook RLS & tables
│   ├── ingest-projects.js     # Section-aware RAG chunker & Gemini vector embedder
│   └── rag-migration.sql      # Supabase pgvector schema & match RPC function
├── src/
│   ├── assets/                # Media artwork & custom icons
│   ├── components/            # Reusable UI components
│   │   ├── CommandPalette.jsx # Cmd+K spotlight drawer component
│   │   ├── Navbar.jsx         # Header navigation bar with dropdown menus
│   │   ├── PageTransition.jsx # Route transition overlay manager
│   │   └── SmoothScroll.jsx   # Lenis scroll controller
│   ├── data/                  # Static constants, blog posts, & playground prompts
│   │   ├── blogs.js
│   │   └── playgroundData.js
│   ├── lib/                   # Utility setup (Supabase client initializer)
│   │   └── supabase.js
│   ├── pages/                 # Top-level view routes
│   │   ├── About.jsx
│   │   ├── BlogDetail.jsx
│   │   ├── Blogs.jsx
│   │   ├── BookACall.jsx
│   │   ├── Guestbook.jsx
│   │   ├── Home.jsx
│   │   ├── Links.jsx
│   │   ├── Playground.jsx
│   │   ├── Privacy.jsx
│   │   └── Terms.jsx
│   ├── sections/              # Interactive page sections
│   │   ├── AI-Playground.jsx
│   │   ├── BehindSystems.jsx
│   │   ├── GitHubActivity.jsx
│   │   └── Projects.jsx
│   ├── App.jsx                # Main App Router & layout wrapper
│   ├── index.css              # Tailwind CSS v4 directives & global design tokens
│   └── main.jsx               # Application entry point
├── .env.example               # Template for environment variables
├── package.json               # Project dependencies and script declarations
├── vite.config.js             # Vite bundler & plugin configuration
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

Follow these steps to set up and run a local development copy of the project.

### Prerequisites

Ensure your system meets the following requirements:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone the Repository

```bash
git clone https://github.com/moinsheikh/portfolio.git
cd site
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the `.env.example` template to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-supabase-instance.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

# Server-Side RAG & AI Keys
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_google_gemini_api_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Nodemailer SMTP
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASS=your_gmail_app_password

# GitHub Token
VITE_GITHUB_TOKEN=your_github_token
```

### 4. Run Local Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with HMR. |
| `npm run build` | Compiles optimized production bundle into `dist/`. |
| `npm run preview` | Serves production build locally for verification. |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues. |
| `node scripts/ingest-projects.js` | Runs section-aware chunker and vector embedding ingestion. |

---

## 🌐 Deployment (Vercel)

This application is optimized for seamless deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the project in **Vercel Dashboard**.
3. Set **Root Directory** to `site`.
4. Configure all environment variables listed in `.env.example` inside **Vercel Settings → Environment Variables**.
5. Click **Deploy**. Vercel will automatically build the React app and deploy serverless functions located under `/api`.

---

## 🤝 Connect & Contact

<p align="left">
  <b>Moin Sheikh</b> — AI Systems & Full-Stack Engineer<br>
  📍 Based in Nagpur, India
</p>

- 📧 **Email**: [moinsheikh1303@gmail.com](mailto:moinsheikh1303@gmail.com)
- 🌐 **Portfolio**: [moinsheikh.in](https://moinsheikh.in)
- 💼 **LinkedIn**: [Connect on LinkedIn](https://www.linkedin.com/in/moin-build)
- 🐙 **GitHub**: [Follow on GitHub](https://github.com/moin-dbud)
- 📅 **Book a Call**: [moinsheikh.in/book-a-call](https://moinsheikh.in/book-a-call)

---

<p align="center">
  Designed & Built with ❤️ by <b>Moin Sheikh</b>
</p>
