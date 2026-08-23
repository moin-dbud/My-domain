/**
 * Serverless API Function – /api/playground
 * RAG Architecture powered by Supabase pgvector, Gemini Embeddings, and OpenRouter Free LLMs.
 */

import { createClient } from '@supabase/supabase-js';

/* ─── CORS helper ──────────────────────────────────────────── */
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/* ─── Initialize Supabase Server Client ─────────────────────── */
function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase configuration missing on server.');
  }
  return createClient(url, serviceKey);
}

/* ─── Generate Query Embedding via Gemini (gemini-embedding-001, 768 dims) ─── */
async function generateQueryEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Playground API] GEMINI_API_KEY missing — generating mock 768-dim query embedding');
    const mockVec = Array.from({ length: 768 }, () => Math.random() - 0.5);
    const norm = Math.sqrt(mockVec.reduce((sum, v) => sum + v * v, 0));
    return mockVec.map(v => v / norm);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'models/gemini-embedding-001',
      content: { parts: [{ text }] },
      outputDimensionality: 768
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Embedding Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.embedding?.values;
}

/* ─── Call OpenRouter for Grounded RAG Chat Answer ─────────────────── */
async function generateOpenRouterAnswer(systemPrompt, userQuery, history = []) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured on the server.');
  }

  // Primary model with fallback
  const PRIMARY_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
  const FALLBACK_MODEL = 'openrouter/free';

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userQuery }
  ];

  let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://moinsheikh.in',
      'X-Title': 'Moin Sheikh Portfolio Playground'
    },
    body: JSON.stringify({
      model: PRIMARY_MODEL,
      messages,
      temperature: 0.2,
      max_tokens: 1500
    })
  });

  // Retry with fallback model if primary is busy or unavailable
  if (!response.ok) {
    console.warn(`[Playground API] ${PRIMARY_MODEL} returned ${response.status}. Retrying with ${FALLBACK_MODEL}...`);
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://moinsheikh.in',
        'X-Title': 'Moin Sheikh Portfolio Playground'
      },
      body: JSON.stringify({
        model: FALLBACK_MODEL,
        messages,
        temperature: 0.2,
        max_tokens: 1500
      })
    });
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content;
  if (!answer) {
    throw new Error('Empty response received from OpenRouter LLM.');
  }

  return {
    answer,
    modelUsed: data.model || PRIMARY_MODEL
  };
}

/* ─── Main Handler ─────────────────────────────────────────── */
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabaseClient();

  // GET /api/playground?action=projects — Fetch project list for frontend selector
  if (req.method === 'GET') {
    try {
      const { data: projects, error } = await supabase
        .from('rag_projects')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      const projectsDict = {};
      (projects || []).forEach(p => {
        projectsDict[p.slug] = {
          id: p.slug,
          slug: p.slug,
          name: p.name,
          category: p.category,
          accentColor: p.accent_color || '#a855f7',
          tagline: p.tagline,
          description: p.description,
          features: p.metadata?.features || [],
          techStack: p.tech_stack || [],
          suggestedQuestions: p.suggested_questions || []
        };
      });

      return res.status(200).json({ projects: projectsDict });
    } catch (err) {
      console.error('[Playground API GET Error]:', err.message);
      return res.status(500).json({ error: 'Failed to load projects metadata.' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { projectKey = 'buildo', query = '', history = [] } = req.body || {};

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    if (query.trim().length > 600) {
      return res.status(400).json({ error: 'Query exceeds 600 character limit.' });
    }

    // 1. Fetch project record from Supabase by slug
    const { data: projectRow, error: projErr } = await supabase
      .from('rag_projects')
      .select('id, name, category, tagline, description')
      .eq('slug', projectKey)
      .maybeSingle();

    if (projErr || !projectRow) {
      return res.status(404).json({ error: `Project '${projectKey}' not found.` });
    }

    // 2. Generate Query Embedding
    const queryEmbedding = await generateQueryEmbedding(query.trim());

    // 3. Vector Similarity Search via RPC `match_project_chunks`
    let retrievedChunks = [];
    let chunksUsed = [];

    if (queryEmbedding && queryEmbedding.length === 768) {
      const { data: matchedChunks, error: matchErr } = await supabase.rpc('match_project_chunks', {
        query_embedding: queryEmbedding,
        match_project_id: projectRow.id,
        match_threshold: 0.15,
        match_count: 5
      });

      if (!matchErr && matchedChunks && matchedChunks.length > 0) {
        retrievedChunks = matchedChunks;
        chunksUsed = [...new Set(matchedChunks.map(c => c.section_title).filter(Boolean))];
      }
    }

    // 4. Build Structured RAG Context Block
    let contextBlock = '';
    if (retrievedChunks.length > 0) {
      contextBlock = retrievedChunks.map((c, idx) => (
        `[Section: ${c.section_title || 'General Overview'}]\n${c.content}`
      )).join('\n\n');
    } else {
      contextBlock = `[Section: Overview]\n${projectRow.description}`;
    }

    // 5. Enhanced Intelligence & Personality System Prompt
    const systemPrompt = `You are Moin Sheikh's AI Technical Assistant on his portfolio's AI Playground (/playground).
Your role is to act as a knowledgeable engineer explaining Moin's project "${projectRow.name}" to developers, recruiters, and technical visitors.

TONE & BEHAVIOR:
- Concise, clear, friendly, human, and technically accurate.
- Interpret and explain concepts (e.g. how components interact, architectural trade-offs, database structures) based on the retrieved context, rather than just copying bullet points word-for-word.
- Match answer depth to user intent: give a direct 1-2 sentence answer for simple questions, and a structured technical breakdown with headings/bullets for complex architecture questions.
- NEVER use repetitive canned intros like "Based on the provided documentation..." or "According to the project context...". Dive straight into the answer cleanly.

STRICT FACTUAL BOUNDARIES:
- Make factual claims ONLY supported by the RETRIEVED PROJECT DOCUMENTATION below.
- If the retrieved context does not contain enough information to answer a question (e.g., active user count, secret keys, server costs, unlisted metrics, unmentioned technologies), explicitly state: "I don't have enough information in the available project documentation to answer that accurately."
- DO NOT invent technologies, metrics, revenue numbers, performance figures, or unmentioned features.

PROJECT: ${projectRow.name} (${projectRow.category})
TAGLINE: ${projectRow.tagline}

RETRIEVED PROJECT DOCUMENTATION:
${contextBlock}
`;

    // 6. Generate Grounded AI Answer via OpenRouter
    const { answer, modelUsed } = await generateOpenRouterAnswer(systemPrompt, query.trim(), history);

    return res.status(200).json({
      answer,
      source: 'rag-database',
      sectionsRetrieved: chunksUsed,
      model: modelUsed
    });

  } catch (err) {
    console.error('[Playground API POST Error]:', err);
    return res.status(500).json({
      error: 'Failed to process AI query.',
      answer: '### Connection Issue\n\nI encountered a temporary issue connecting to the project database. Please try asking your question again.'
    });
  }
}
