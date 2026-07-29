<p align="center">
  <img src="public/cropped_circle_image.webp" width="130" height="130" style="border-radius: 50%; border: 3px solid #6366f1; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);" alt="Moin Portfolio Logo" />
</p>

<h1 align="center">⚡ MOIN SHEIKH — PORTFOLIO ⚡</h1>

<p align="center">
  <b>A modern, high-performance developer portfolio & AI showcase built with React 19, Vite & Tailwind CSS v4.</b>
</p>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" /></a>
  <a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Framer_Motion-12.0-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
  <a href="https://clerk.com/"><img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk Auth" /></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
</p>

---

## 🌟 Overview

Welcome to the source code of my personal developer portfolio and product showcase. Based in **Nagpur, India**, I design and build high-impact web products, intelligent AI systems, and fluid interactive web experiences.

This portfolio is crafted to provide a premium, modern user experience featuring smooth physics-based scrolling, custom page transitions, command-line spotlight navigation (`Cmd+K`), live authentication, and real-time backend integrations.

---

## ✨ Key Features

- 🎨 **Sleek Aesthetic & Micro-Animations**: Built with custom typography, dark glassmorphism styling, and motion design powered by **Framer Motion**.
- 📜 **Lenis Smooth Scroll & Custom Transitions**: Implements Lenis physics-based smooth scrolling and a custom canvas/flood page transition system.
- ⌨️ **Command Palette (`Cmd + K` / `Ctrl + K`)**: Interactive spotlight search enabling rapid page navigation, quick actions, and direct links.
- 🤖 **AI Playground & Labs**: Interactive section showcasing experiments in AI tools, resume analysis, and product prototypes.
- 💬 **Authenticated Guestbook**: Interactive real-time guestbook built with **Supabase** storage and **Clerk** authentication.
- 🎵 **Live Spotify Integration**: Serverless API integration fetching live music playback state and current tracks.
- 📝 **Markdown Technical Blog**: Markdown-driven blogging system featuring syntax highlighting, categorized tech thoughts, and estimated read times.
- 📅 **GitHub Contribution Heatmap**: Live visual representation of open-source activity rendered using `react-github-calendar`.
- ✉️ **Integrated Booking & Contact Engine**: Dedicated booking page (`/book-a-call`) paired with serverless email notification pipelines powered by **Nodemailer**.

---

## 🛠️ Tech Stack

| Category | Technology / Library |
| :--- | :--- |
| **Frontend Core** | [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [React Router v7](https://reactrouter.com/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/), Custom Design Tokens, Glassmorphism UI |
| **Animation & Scroll** | [Framer Motion 12](https://www.framer.com/motion/), [Lenis](https://lenis.darkroom.engineering/) |
| **Authentication & Database** | [Clerk React](https://clerk.com/), [Supabase JS](https://supabase.com/) |
| **API & Backend Functions** | Vercel Serverless Functions (`/api/send-email.js`, `/api/spotify.js`), [Nodemailer](https://nodemailer.com/) |
| **Analytics & Insights** | [@vercel/analytics](https://vercel.com/analytics), [@vercel/speed-insights](https://vercel.com/speed-insights) |
| **Utilities & Markdown** | [Marked](https://marked.js.org/), [React Icons](https://react-icons.github.io/react-icons/) |

---

## 📂 Project Structure

```text
site/
├── api/                   # Serverless API routes (Spotify integration, Nodemailer email helper)
│   ├── send-email.js
│   └── spotify.js
├── public/                # Static assets, WebP images, and logos
│   └── cropped_circle_image.webp
├── src/
│   ├── assets/            # Project icons, vector artwork, and media files
│   ├── components/        # Reusable UI components (Navbar, Footer, CommandPalette, PageTransition)
│   ├── data/              # Static data stores & blog entries
│   ├── lib/               # Utility initializers (Supabase client setup, helpers)
│   ├── pages/             # Page view components (Home, About, Work, Blogs, Guestbook, Labs, BookACall)
│   ├── sections/          # Page sections (Hero, Projects, Skills, AI-Playground, GitHubActivity)
│   ├── App.jsx            # Main app router with Lenis smooth scroll and page transitions
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind CSS directives & global styling rules
├── vite.config.js         # Vite bundler configuration
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

Follow these instructions to run a local development copy of the portfolio.

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-portfolio-repo.git
cd site
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `site` root directory and fill in your keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-supabase-instance.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

# Nodemailer / Gmail SMTP (For Contact Form API)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASS=your-gmail-app-password
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 📜 Available Scripts

In the `site` directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches Vite local development server with Fast Refresh. |
| `npm run build` | Compiles and optimizes production bundle into `dist/`. |
| `npm run preview` | Serves the production `dist/` build locally for verification. |
| `npm run lint` | Runs ESLint to check for syntax and style issues. |

---

## 🌐 Deployment

This application is configured for seamless deployment on **Vercel**:

1. Push your code to GitHub.
2. Import the project repository into **Vercel**.
3. Set the root directory to `site`.
4. Add your environment variables in the Vercel project settings.
5. Click **Deploy**. Vercel will automatically build the site and deploy the serverless functions in `/api`.

---

## 🤝 Connect & Contact

<p align="left">
  <b>Moin Khan</b> — AI Innovator & Full-Stack Developer<br>
  📍 Based in Nagpur, India
</p>

- 📧 **Email**: [moinsheikh1303@gmail.com](mailto:moinsheikh1303@gmail.com)
- 💼 **LinkedIn**: [Connect on LinkedIn](#)
- 🐙 **GitHub**: [Follow on GitHub](#)
- 📅 **Book a Call**: Visit `/book-a-call` on the live site

---

<p align="center">
  Designed & Built with ❤️ by <b>Moin Khan</b>
</p>
