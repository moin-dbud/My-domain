-- Run this in the Supabase SQL Editor for your project

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. RAG Projects table
create table if not exists public.rag_projects (
  id            bigint generated always as identity primary key,
  slug          text unique not null,                  -- 'buildo', 'madeit', 'nexora', 'levelup', 'resume', 'portfolio'
  name          text not null,
  category      text,
  tagline       text,
  description   text,
  accent_color  text default '#a855f7',
  tech_stack    jsonb default '[]'::jsonb,
  suggested_questions jsonb default '[]'::jsonb,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 3. RAG Documents table (Stores source README metadata and content hash)
create table if not exists public.rag_documents (
  id            bigint generated always as identity primary key,
  project_id    bigint references public.rag_projects(id) on delete cascade,
  title         text not null,
  source        text,                                  -- e.g. 'Buildo-README.md'
  content_hash  text,                                  -- SHA-256 for idempotent re-ingestion
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 4. RAG Chunks table (Stores section-aware chunks with 768-dim embeddings)
create table if not exists public.rag_chunks (
  id            bigint generated always as identity primary key,
  project_id    bigint references public.rag_projects(id) on delete cascade,
  document_id   bigint references public.rag_documents(id) on delete cascade,
  content       text not null,
  section_title text,                                  -- e.g. 'Architecture', 'Tech Stack'
  chunk_index   int not null default 0,
  metadata      jsonb default '{}'::jsonb,
  embedding     vector(768),                           -- 768 dimensions for Gemini text-embedding-004
  created_at    timestamptz not null default now()
);

-- 5. Indexes
create index if not exists rag_projects_slug_idx on public.rag_projects (slug);
create index if not exists rag_chunks_project_id_idx on public.rag_chunks (project_id);
create index if not exists rag_chunks_embedding_idx on public.rag_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 10);
create index if not exists rag_chunks_content_fts_idx on public.rag_chunks using gin (to_tsvector('english', content));

-- 6. Row Level Security (RLS)
alter table public.rag_projects  enable row level security;
alter table public.rag_documents enable row level security;
alter table public.rag_chunks    enable row level security;

-- Public can read
drop policy if exists "rag_projects public read" on public.rag_projects;
create policy "rag_projects public read" on public.rag_projects for select using (true);

drop policy if exists "rag_documents public read" on public.rag_documents;
create policy "rag_documents public read" on public.rag_documents for select using (true);

drop policy if exists "rag_chunks public read" on public.rag_chunks;
create policy "rag_chunks public read" on public.rag_chunks for select using (true);

-- 7. RPC Function for Vector Similarity Search filtered by project_id
create or replace function public.match_project_chunks(
  query_embedding vector(768),
  match_project_id bigint,
  match_threshold float default 0.2,
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  section_title text,
  chunk_index int,
  similarity float
)
language sql stable as $$
  select
    rag_chunks.id,
    rag_chunks.content,
    rag_chunks.section_title,
    rag_chunks.chunk_index,
    1 - (rag_chunks.embedding <=> query_embedding) as similarity
  from rag_chunks
  where rag_chunks.project_id = match_project_id
    and 1 - (rag_chunks.embedding <=> query_embedding) > match_threshold
  order by rag_chunks.embedding <=> query_embedding
  limit match_count;
$$;
