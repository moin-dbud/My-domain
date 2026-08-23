/**
 * Ingestion Script for Portfolio RAG Architecture
 * Ingests project READMEs, performs section-aware chunking,
 * generates embeddings via Google Gemini (gemini-embedding-001 with outputDimensionality: 768),
 * and stores them idempotently in Supabase.
 *
 * Usage:
 *   node scripts/ingest-projects.js [--force]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Load .env manually if dotenv is not loaded
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = value.trim();
        }
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const FORCE_REINGEST = process.argv.includes('--force');

// ─── 6 Approved Projects Metadata & Source Map ───────────────────────────
const PROJECTS_CONFIG = [
  {
    slug: 'buildo',
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
    ],
    readmePath: 'public/Project README/Buildo-README.md'
  },
  {
    slug: 'madeit',
    name: 'MadeIt',
    category: 'Product Platform',
    accentColor: '#f97316',
    tagline: 'Milestone-driven learning platform building proof-of-work portfolios',
    description: 'MadeIt is a milestone-driven learning platform designed to help students finish real projects instead of passively consuming tutorials. It breaks complex engineering tasks into executable steps.',
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
    ],
    readmePath: 'public/Project README/MadeIt-README.md'
  },
  {
    slug: 'nexora',
    name: 'Nexora Learn AI',
    category: 'AI Education Platform',
    accentColor: '#a855f7',
    tagline: 'Intelligent study planning platform for exam preparation',
    description: 'Nexora Learn AI is an intelligent study planning platform designed for college students preparing for competitive exams and university finals. It analyzes course syllabi and outputs adaptive study schedules.',
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
    ],
    readmePath: 'public/Project README/Nexora-README.md'
  },
  {
    slug: 'levelup',
    name: 'LevelUp.dev',
    category: 'EdTech Platform',
    accentColor: '#38bdf8',
    tagline: 'Full-stack online learning platform for web developers',
    description: 'LevelUp.dev is a full-stack online learning platform where aspiring developers can browse, enroll in, and complete structured development courses with real-time video lectures and interactive code exercises.',
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
    ],
    readmePath: 'public/Project README/LevelUp.dev-README.md'
  },
  {
    slug: 'resume',
    name: 'AI Resume Analyzer',
    category: 'AI Tool',
    accentColor: '#e2e8f0',
    tagline: 'Actionable resume optimization tool powered by AI',
    description: 'An AI-powered developer tool that analyzes resumes against target job descriptions and provides actionable feedback, ATS compatibility scores, and keyword optimization recommendations.',
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
    ],
    readmePath: 'public/Project README/Reasule-Analyze-README.md'
  },
  {
    slug: 'portfolio',
    name: 'Moin Sheikh Portfolio',
    category: 'Portfolio & AI Showcase',
    accentColor: '#6366f1',
    tagline: 'Modern developer portfolio with smooth physics & AI Playground',
    description: 'The website you are currently exploring! Built from scratch with React 19, Vite, Tailwind CSS v4, Framer Motion, and serverless API integrations. Features Lenis physics smooth scrolling, spotlight command palette (Cmd+K), real-time guestbook wall, live Spotify widget, and this RAG-backed AI Playground.',
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
    ],
    inlineDoc: `# Moin Sheikh Portfolio — Technical Documentation

## Overview
Moin Sheikh's Developer Portfolio is an interactive showcase of modern web engineering and intelligent systems. Designed with rich aesthetics, physics-driven smooth scrolling (Lenis), dark theme UI, and a database-backed Retrieval-Augmented Generation (RAG) AI Playground.

## Key Features
- **RAG-Backed AI Playground**: Interactive assistant connected to Supabase pgvector and OpenRouter LLMs.
- **Lenis Smooth Scroll**: Silky smooth physics scrolling coupled with dynamic entrance animations.
- **Command Palette**: Cmd+K / Ctrl+K spotlight modal for instant keyboard navigation.
- **Guestbook Wall**: Authenticated real-time guestbook powered by Clerk Auth and Supabase storage.
- **Live Spotify Widget**: Real-time track listener connecting to Spotify Web API via serverless refresh tokens.
- **GitHub Heatmap**: Contribution graph integration using GitHub GraphQL/REST APIs.
- **Book-A-Call Engine**: Automated meeting scheduler sending branded Nodemailer confirmations.

## Architecture
- **Frontend**: Single Page Application (SPA) built with React 19, Vite 7, and Tailwind CSS v4.
- **Backend**: Serverless API routes executing in Vercel Node.js runtime.
- **Database & RAG**: Supabase PostgreSQL database storing project documentation, vector embeddings (768-dim), and guestbook data.
- **AI Integration**: Query-time vector similarity search via pgvector, powering prompt completion through OpenRouter free models.`
  }
];

// ─── Section-Aware Chunking Helper ────────────────────────────────────────
function chunkMarkdown(markdownText) {
  const chunks = [];
  const sections = markdownText.split(/(?=\n##\s+)/);

  for (const rawSection of sections) {
    const trimmed = rawSection.trim();
    if (!trimmed) continue;

    // Extract section header if present
    const headerMatch = trimmed.match(/^##\s+([^\n]+)/);
    const sectionTitle = headerMatch ? headerMatch[1].trim() : 'General Overview';

    // If section is small enough (<= 1200 chars), keep as single chunk
    if (trimmed.length <= 1200) {
      chunks.push({ sectionTitle, content: trimmed });
    } else {
      // Split large sections into sub-chunks by H3 (###) or paragraph breaks
      const subParts = trimmed.split(/(?=\n###\s+)/);
      for (const subPart of subParts) {
        const subTrimmed = subPart.trim();
        if (!subTrimmed) continue;

        if (subTrimmed.length <= 1200) {
          chunks.push({ sectionTitle, content: subTrimmed });
        } else {
          // Paragraph split
          const paragraphs = subTrimmed.split('\n\n');
          let tempChunk = '';

          for (const p of paragraphs) {
            if ((tempChunk + '\n\n' + p).length > 1200) {
              if (tempChunk.trim()) {
                chunks.push({ sectionTitle, content: tempChunk.trim() });
              }
              tempChunk = p;
            } else {
              tempChunk = tempChunk ? `${tempChunk}\n\n${p}` : p;
            }
          }
          if (tempChunk.trim()) {
            chunks.push({ sectionTitle, content: tempChunk.trim() });
          }
        }
      }
    }
  }

  return chunks;
}

// ─── Gemini Embeddings Helper (gemini-embedding-001, 768 dims) ─────────────
async function generateEmbedding(text) {
  if (!GEMINI_API_KEY) {
    console.warn('  ⚠️ GEMINI_API_KEY missing in .env — using mock embedding vector.');
    const mockVec = Array.from({ length: 768 }, () => Math.random() - 0.5);
    const norm = Math.sqrt(mockVec.reduce((sum, v) => sum + v * v, 0));
    return mockVec.map(v => v / norm);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text }] },
      outputDimensionality: 768
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Embedding API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const embedding = data.embedding?.values;

  if (!embedding || embedding.length !== 768) {
    throw new Error(`Invalid embedding vector returned (expected 768 dims, got ${embedding?.length})`);
  }

  return embedding;
}

// ─── Main Ingestion Flow ──────────────────────────────────────────────────
async function runIngestion() {
  console.log('🚀 Starting Portfolio Project RAG Ingestion Pipeline...\n');

  for (const projConfig of PROJECTS_CONFIG) {
    console.log(`📦 Processing project: [${projConfig.name}] (${projConfig.slug})`);

    // 1. Read README or inline doc
    let docContent = '';
    let sourceName = '';

    if (projConfig.readmePath) {
      const fullPath = path.join(process.cwd(), projConfig.readmePath);
      if (!fs.existsSync(fullPath)) {
        console.error(`  ❌ README file not found at: ${fullPath}`);
        continue;
      }
      docContent = fs.readFileSync(fullPath, 'utf8');
      sourceName = path.basename(projConfig.readmePath);
    } else {
      docContent = projConfig.inlineDoc || '';
      sourceName = 'portfolio-system-doc.md';
    }

    const contentHash = crypto.createHash('sha256').update(docContent).digest('hex');

    // 2. Upsert Project Metadata into `rag_projects`
    const { data: projectRow, error: projErr } = await supabase
      .from('rag_projects')
      .upsert({
        slug: projConfig.slug,
        name: projConfig.name,
        category: projConfig.category,
        tagline: projConfig.tagline,
        description: projConfig.description,
        accent_color: projConfig.accentColor,
        tech_stack: projConfig.techStack,
        suggested_questions: projConfig.suggestedQuestions,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (projErr) {
      console.error(`  ❌ Error upserting project metadata for ${projConfig.slug}:`, projErr.message);
      continue;
    }

    const projectId = projectRow.id;

    // 3. Strict Idempotency Check: Verify Document Hash AND Chunk Count
    const { data: existingDoc } = await supabase
      .from('rag_documents')
      .select('id, content_hash')
      .eq('project_id', projectId)
      .eq('source', sourceName)
      .maybeSingle();

    if (existingDoc && existingDoc.content_hash === contentHash && !FORCE_REINGEST) {
      // Check if rag_chunks actually contains ingested chunks for this document
      const { count: chunkCount, error: countErr } = await supabase
        .from('rag_chunks')
        .select('id', { count: 'exact', head: true })
        .eq('document_id', existingDoc.id);

      if (!countErr && chunkCount && chunkCount > 0) {
        console.log(`  ✨ Document unchanged (hash: ${contentHash.slice(0, 8)}..., ${chunkCount} chunks present). Skipping re-ingestion.`);
        continue;
      } else {
        console.log(`  ⚠️ Document record exists but 0 valid chunks found. Re-ingesting document chunks...`);
      }
    }

    // 4. Delete incomplete/old document & chunks
    if (existingDoc) {
      await supabase.from('rag_documents').delete().eq('id', existingDoc.id);
    }

    // 5. Create new Document entry
    const { data: docRow, error: docErr } = await supabase
      .from('rag_documents')
      .insert({
        project_id: projectId,
        title: `${projConfig.name} Documentation`,
        source: sourceName,
        content_hash: contentHash
      })
      .select('id')
      .single();

    if (docErr) {
      console.error(`  ❌ Error creating document entry:`, docErr.message);
      continue;
    }

    const documentId = docRow.id;

    // 6. Section-aware Chunking & Embedding Generation
    const chunks = chunkMarkdown(docContent);
    console.log(`  📄 Split document into ${chunks.length} section-aware chunks. Generating embeddings...`);

    let ingestedCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embedding = await generateEmbedding(chunk.content);

        const { error: chunkErr } = await supabase.from('rag_chunks').insert({
          project_id: projectId,
          document_id: documentId,
          content: chunk.content,
          section_title: chunk.sectionTitle,
          chunk_index: i,
          embedding: embedding
        });

        if (chunkErr) {
          console.error(`  ❌ Error inserting chunk #${i} ("${chunk.sectionTitle}"):`, chunkErr.message);
        } else {
          ingestedCount++;
        }

        // Rate-limit buffer (500ms delay per request)
        if (GEMINI_API_KEY) {
          await new Promise(res => setTimeout(res, 500));
        }
      } catch (err) {
        console.error(`  ❌ Embedding error on chunk #${i} ("${chunk.sectionTitle}"):`, err.message);
      }
    }

    if (ingestedCount === 0) {
      console.error(`  ⚠️ 0 chunks were successfully embedded for ${projConfig.name}. Removing unpopulated document record so future runs retry cleanly.`);
      await supabase.from('rag_documents').delete().eq('id', documentId);
    } else {
      console.log(`  ✅ Successfully ingested ${ingestedCount}/${chunks.length} chunks for ${projConfig.name}.\n`);
    }
  }

  console.log('🎉 Ingestion complete!');
}

runIngestion().catch(console.error);
