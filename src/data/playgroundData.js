/**
 * Static UI Display Metadata for Portfolio Projects
 * Contains default display values (colors, icons, taglines) for initial renders.
 * Actual project documentation is retrieved dynamically at query time from Supabase pgvector.
 */

export const DEFAULT_PROJECTS_CATALOG = {
  buildo: {
    id: 'buildo',
    name: 'Buildo',
    category: 'AI SaaS Platform',
    accentColor: '#a855f7',
    tagline: 'AI-powered text-to-website builder with a custom design-system engine',
    description: 'An AI-powered website builder that generates production-ready marketing sites for small businesses, cafes, portfolios, and personal brands from a single text prompt — with a curated design-system engine.',
    techStack: [
      { name: 'React', icon: '⚛', category: 'Frontend' },
      { name: 'TypeScript', icon: '🧠', category: 'Language' },
      { name: 'Node.js', icon: '🟢', category: 'Backend' },
      { name: 'PostgreSQL (Neon)', icon: '🐘', category: 'Database' },
      { name: 'Prisma ORM', icon: '🧩', category: 'Database' },
      { name: 'Tailwind CSS', icon: '🎨', category: 'Styling' },
      { name: 'Cashfree Payments', icon: '💳', category: 'Payments' }
    ],
    suggestedQuestions: [
      'How does Buildo generate unique designs instead of repeating template layouts?',
      'What technology stack powers Buildo?',
      'How does the payment and credit system work?',
      'Explain Buildo\'s backend architecture and database structure.'
    ]
  },

  madeit: {
    id: 'madeit',
    name: 'MadeIt',
    category: 'Product Platform',
    accentColor: '#f97316',
    tagline: 'Milestone-driven learning platform building proof-of-work portfolios',
    description: 'MadeIt is a milestone-driven learning platform designed to help students finish real projects instead of passively consuming tutorials.',
    techStack: [
      { name: 'React', icon: '⚛', category: 'Frontend' },
      { name: 'Next.js', icon: '▲', category: 'Framework' },
      { name: 'Node.js', icon: '🟢', category: 'Backend' },
      { name: 'Supabase / Postgres', icon: '⚡', category: 'Database' },
      { name: 'Tailwind CSS', icon: '🎨', category: 'Styling' }
    ],
    suggestedQuestions: [
      'How does MadeIt help students finish projects?',
      'What is the milestone execution system?',
      'How does MadeIt auto-generate proof-of-work portfolios?',
      'What technologies are used to build MadeIt?'
    ]
  },

  nexora: {
    id: 'nexora',
    name: 'Nexora Learn AI',
    category: 'AI Education Platform',
    accentColor: '#a855f7',
    tagline: 'Intelligent study planning platform for exam preparation',
    description: 'Nexora Learn AI is an intelligent study planning platform designed for college students preparing for competitive exams and university finals.',
    techStack: [
      { name: 'Python', icon: '🐍', category: 'Language' },
      { name: 'FastAPI', icon: '⚡', category: 'Backend' },
      { name: 'OpenAI API', icon: '🤖', category: 'AI Engine' },
      { name: 'React', icon: '⚛', category: 'Frontend' },
      { name: 'Tailwind CSS', icon: '🎨', category: 'Styling' }
    ],
    suggestedQuestions: [
      'How does Nexora generate study plans for students?',
      'Why was Python and FastAPI chosen for the backend?',
      'How does the AI syllabus parser work?',
      'What algorithm controls the study scheduling?'
    ]
  },

  levelup: {
    id: 'levelup',
    name: 'LevelUp.dev',
    category: 'EdTech Platform',
    accentColor: '#38bdf8',
    tagline: 'Full-stack online learning platform for web developers',
    description: 'LevelUp.dev is a full-stack online learning platform where aspiring developers can browse, enroll in, and complete structured development courses.',
    techStack: [
      { name: 'React', icon: '⚛', category: 'Frontend' },
      { name: 'Node.js', icon: '🟢', category: 'Backend' },
      { name: 'Express.js', icon: '🚂', category: 'API Layer' },
      { name: 'MongoDB', icon: '🍃', category: 'Database' },
      { name: 'Tailwind CSS', icon: '🎨', category: 'Styling' }
    ],
    suggestedQuestions: [
      'What features does LevelUp.dev provide?',
      'How does course progress tracking work in MongoDB?',
      'What is the technology stack behind LevelUp.dev?',
      'How is authentication handled in LevelUp.dev?'
    ]
  },

  resume: {
    id: 'resume',
    name: 'AI Resume Analyzer',
    category: 'AI Tool',
    accentColor: '#e2e8f0',
    tagline: 'Actionable resume optimization tool powered by AI',
    description: 'An AI-powered developer tool that analyzes resumes against target job descriptions and provides actionable feedback and ATS scores.',
    techStack: [
      { name: 'React', icon: '⚛', category: 'Frontend' },
      { name: 'OpenAI API', icon: '🤖', category: 'AI Engine' },
      { name: 'Node.js', icon: '🟢', category: 'Backend' },
      { name: 'Express', icon: '🚂', category: 'API Server' },
      { name: 'Tailwind CSS', icon: '🎨', category: 'Styling' }
    ],
    suggestedQuestions: [
      'How does the AI Resume Analyzer evaluate resumes?',
      'How does it check ATS compatibility?',
      'What technology stack does it use?',
      'How is text extracted from uploaded PDFs?'
    ]
  },

  portfolio: {
    id: 'portfolio',
    name: 'Moin Sheikh Portfolio',
    category: 'Portfolio & AI Showcase',
    accentColor: '#6366f1',
    tagline: 'Modern developer portfolio with smooth physics & AI Playground',
    description: 'The website you are currently exploring! Built from scratch with React 19, Vite, Tailwind CSS v4, Framer Motion, and serverless API integrations.',
    techStack: [
      { name: 'React 19', icon: '⚛', category: 'Core' },
      { name: 'Vite 7.3', icon: '⚡', category: 'Bundler' },
      { name: 'Tailwind CSS v4', icon: '🎨', category: 'Styling' },
      { name: 'Framer Motion 12', icon: '🎬', category: 'Animation' },
      { name: 'Lenis', icon: '📜', category: 'Smooth Scroll' },
      { name: 'Supabase JS', icon: '⚡', category: 'Database' },
      { name: 'Clerk React', icon: '🔐', category: 'Auth' },
      { name: 'Vercel Serverless', icon: '▲', category: 'Backend' },
      { name: 'OpenRouter / Gemini', icon: '🤖', category: 'AI Architecture' }
    ],
    suggestedQuestions: [
      'What tech stack powers this portfolio website?',
      'How does the RAG architecture work in the AI Playground?',
      'How are smooth scrolling and page transitions implemented?',
      'How do the Vercel serverless API routes function?'
    ]
  }
};
