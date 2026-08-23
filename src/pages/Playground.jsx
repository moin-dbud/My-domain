import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import PageHero from '../components/PageHero';
import { useSEO } from '../hooks/useSEO';
import JsonLd from '../components/JsonLd';
import { DEFAULT_PROJECTS_CATALOG } from '../data/playgroundData';

/* ─── Responsive Injected Styles ─────────────────────────────────────── */
const pgStyles = `
  @media (max-width: 768px) {
    .pg-container {
      padding: 0 16px 60px !important;
    }
    .pg-intro-card {
      padding: 24px 20px !important;
      border-radius: 18px !important;
      margin-bottom: 32px !important;
    }
    .pg-tabs-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
    .pg-header-chrome {
      padding: 12px 14px !important;
      gap: 8px !important;
    }
    .pg-tech-banner {
      padding: 10px 14px !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    .pg-tech-stack-pills {
      max-width: 100% !important;
      width: 100% !important;
      overflow-x: auto !important;
      padding-bottom: 2px !important;
    }
    .pg-conversation-area {
      padding: 16px 12px !important;
      gap: 14px !important;
      min-height: 320px !important;
      max-height: 480px !important;
    }
    .pg-user-bubble {
      max-width: 92% !important;
      padding: 10px 14px !important;
      font-size: 13px !important;
    }
    .pg-ai-row {
      max-width: 100% !important;
      gap: 8px !important;
    }
    .pg-ai-avatar {
      width: 26px !important;
      height: 26px !important;
      font-size: 12px !important;
      margin-top: 2px !important;
    }
    .pg-ai-bubble {
      padding: 12px 14px !important;
      border-radius: 4px 14px 14px 14px !important;
      width: 100% !important;
      min-width: 0 !important;
      overflow-x: hidden !important;
    }
    .pg-input-bar {
      padding: 12px 14px !important;
      gap: 8px !important;
    }
    .pg-input-textarea {
      padding: 10px 12px !important;
      font-size: 13px !important;
      border-radius: 10px !important;
    }
    .pg-send-button {
      width: 40px !important;
      height: 40px !important;
      border-radius: 10px !important;
    }
    .pg-footer-bar {
      padding: 6px 12px 10px !important;
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      gap: 4px !important;
    }
  }

  @media (max-width: 480px) {
    .pg-container {
      padding: 0 12px 48px !important;
    }
    .pg-intro-card {
      padding: 20px 16px !important;
    }
  }
`;

/* ─── Unescape LLM Markdown Output ──────────────────────────────────── */
function cleanMarkdownEscapes(text) {
  if (!text) return '';
  return text
    .replace(/\\#/g, '#')
    .replace(/\\\./g, '.')
    .replace(/\\-/g, '-')
    .replace(/\\\*/g, '*')
    .replace(/\\_/g, '_')
    .replace(/\\`/g, '`');
}

/* ─── Enhanced Portfolio-Styled Markdown Renderer ───────────────────── */
function renderMarkdown(rawText) {
  if (!rawText) return null;

  const text = cleanMarkdownEscapes(rawText);
  const lines = text.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLanguage = '';
  let listBuffer = [];
  let isNumberedList = false;

  const flushList = (key) => {
    if (listBuffer.length > 0) {
      const ListTag = isNumberedList ? 'ol' : 'ul';
      elements.push(
        <ListTag
          key={`list-${key}`}
          style={{
            margin: '8px 0 14px 22px',
            padding: 0,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {listBuffer.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 6, lineHeight: 1.7, fontSize: 14 }}>
              {formatInline(item)}
            </li>
          ))}
        </ListTag>
      );
      listBuffer = [];
      isNumberedList = false;
    }
  };

  lines.forEach((line, index) => {
    /* Code block toggle */
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        /* End code block */
        elements.push(
          <div
            key={`code-box-${index}`}
            style={{
              background: '#050505',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              margin: '16px 0',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {codeLanguage && (
              <div
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#a855f7',
                  letterSpacing: '0.05em',
                  textTransform: 'lowercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7' }} />
                {codeLanguage}
              </div>
            )}
            <pre
              style={{
                margin: 0,
                padding: '14px 16px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12.5,
                color: '#a7f3d0',
                overflowX: 'auto',
                whiteSpace: 'pre',
                lineHeight: 1.65,
              }}
            >
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        flushList(index);
        codeLanguage = line.trim().replace(/^```/, '').trim();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    /* Headings */
    if (line.startsWith('# ')) {
      flushList(index);
      elements.push(
        <h2 key={`h2-${index}`} style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: '18px 0 8px 0', letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif" }}>
          {formatInline(line.replace('# ', ''))}
        </h2>
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushList(index);
      elements.push(
        <h3 key={`h3-${index}`} style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '16px 0 6px 0', letterSpacing: '-0.015em', fontFamily: "'Inter', sans-serif" }}>
          {formatInline(line.replace('## ', ''))}
        </h3>
      );
      return;
    }

    if (line.startsWith('### ')) {
      flushList(index);
      elements.push(
        <h4 key={`h4-${index}`} style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.95)', margin: '14px 0 6px 0', fontFamily: "'Inter', sans-serif" }}>
          {formatInline(line.replace('### ', ''))}
        </h4>
      );
      return;
    }

    if (line.startsWith('#### ')) {
      flushList(index);
      elements.push(
        <h5 key={`h5-${index}`} style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: '12px 0 4px 0', fontFamily: "'Inter', sans-serif" }}>
          {formatInline(line.replace('#### ', ''))}
        </h5>
      );
      return;
    }

    /* Bullet List items */
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (isNumberedList && listBuffer.length > 0) flushList(index);
      isNumberedList = false;
      listBuffer.push(line.trim().replace(/^[-*]\s+/, ''));
      return;
    }

    /* Numbered List items */
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (!isNumberedList && listBuffer.length > 0) flushList(index);
      isNumberedList = true;
      listBuffer.push(numMatch[2]);
      return;
    }

    flushList(index);

    if (line.trim().length === 0) {
      return;
    }

    /* Regular paragraph */
    elements.push(
      <p key={`p-${index}`} style={{ margin: '0 0 12px 0', fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,0.85)', fontFamily: "'Inter', sans-serif" }}>
        {formatInline(line)}
      </p>
    );
  });

  flushList('end');

  return elements;
}

/* Helper to format inline bold, italic, and code */
function formatInline(str) {
  if (!str) return '';
  const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} style={{ color: '#ffffff', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i} style={{ color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          style={{
            background: 'rgba(168,85,247,0.1)',
            border: '1px solid rgba(168,85,247,0.22)',
            padding: '2px 6px',
            borderRadius: 5,
            fontSize: 12.5,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#c084fc',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/* ─── Page Schema ────────────────────────────────────────────────────── */
const playgroundSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moinsheikh.in/' },
    { '@type': 'ListItem', position: 2, name: 'AI Playground', item: 'https://moinsheikh.in/playground' },
  ],
};

export default function Playground() {
  useSEO({
    title: 'AI Playground | Moin Sheikh — Experience Intelligent Systems',
    description: "Interact with the AI systems behind Moin Sheikh's portfolio projects. Ask questions about architecture, backend decisions, databases, and technology stacks.",
    path: '/playground',
  });

  const [activeTab, setActiveTab] = useState('assistant');
  const [selectedProject, setSelectedProject] = useState('buildo');
  const [projectsCatalog, setProjectsCatalog] = useState(DEFAULT_PROJECTS_CATALOG);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatBottomRef = useRef(null);

  // Fetch project catalog from database via API
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/playground?action=projects');
        if (res.ok) {
          const data = await res.json();
          if (data.projects && Object.keys(data.projects).length > 0) {
            setProjectsCatalog(prev => ({ ...prev, ...data.projects }));
          }
        }
      } catch (err) {
        console.warn('Using default projects catalog:', err.message);
      }
    }
    loadProjects();
  }, []);

  const currentProject = projectsCatalog[selectedProject] || projectsCatalog.buildo;

  /* Ensure page always starts at top on initial mount */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* Scroll chat to bottom ONLY when messages exist */
  useEffect(() => {
    if (messages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Project switching cleans conversation state to prevent cross-project contamination
  const handleProjectSelect = (projKey) => {
    if (projKey !== selectedProject) {
      setSelectedProject(projKey);
      setMessages([]);
    }
  };

  const handleSend = async (textToSend) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: q, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectKey: selectedProject,
          query: q,
          history: messages.slice(-4),
        }),
      });

      const data = await res.json();
      const aiText = data.answer || "I couldn't process your request right now. Please try again.";

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiText,
        source: data.source,
        sectionsRetrieved: data.sectionsRetrieved,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: '### Connection Issue\n\nUnable to communicate with the AI Project Assistant server. Please try asking your question again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#fff' }} aria-label="Moin Sheikh AI Playground">
      <style>{pgStyles}</style>
      <JsonLd schema={playgroundSchema} id="json-ld-playground" />

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION — Identical Canonical PageHero to About & Labs
      ══════════════════════════════════════════════════════════════ */}
      <PageHero
        title="PLAYGROUND"
        subtitle="EXPERIMENT WITH"
        highlight="intelligent systems."
      />

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT CONTAINER
      ══════════════════════════════════════════════════════════════ */}
      <div className="pg-container" style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>

        {/* ── Overview & Philosophy Intro Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pg-intro-card"
          style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: '36px 40px',
            marginBottom: 48,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Radial Accent Glow */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: 450,
            height: 450,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#a855f7',
            fontWeight: 700,
            marginBottom: 12,
          }}>
            INTERACTIVE EXPERIENCE
          </p>

          <h2 style={{
            fontSize: 'clamp(22px, 3.5vw, 38px)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            margin: '0 0 16px 0',
          }}>
            Explore project engineering via{' '}
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontWeight: 400,
              background: 'linear-gradient(90deg,#ff2f92,#ff7a18)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              database-backed RAG.
            </span>
          </h2>

          <p style={{
            fontSize: 15.5,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.8,
            maxWidth: 820,
            margin: '0 0 16px 0',
          }}>
            Moin's AI Playground is a space where you can interact directly with the systems behind my projects.
            Instead of reading static documentation, test how an AI assistant retrieves precise project chunks from Supabase pgvector and explains real system architecture in real time.
          </p>

          <p style={{
            fontSize: 14.5,
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.7,
            margin: 0,
            fontStyle: 'italic',
          }}>
            "The best way to understand an intelligent system is to interact with it."
          </p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            PLAYGROUND EXPERIENCES (TABS)
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pg-tabs-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginBottom: 44,
          }}
        >
          {/* 01 — AI Project Assistant */}
          <div
            onClick={() => setActiveTab('assistant')}
            style={{
              background: activeTab === 'assistant' ? '#0d0a14' : '#0a0a0a',
              border: `1px solid ${activeTab === 'assistant' ? 'rgba(168,85,247,0.35)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 18,
              padding: '22px 24px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: activeTab === 'assistant' ? '0 0 30px rgba(168,85,247,0.14)' : 'none',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: '#a855f7' }}>01</span>
              <span style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)',
                padding: '3px 10px', borderRadius: 999,
              }}>ACTIVE</span>
            </div>
            <h3 style={{ fontSize: 16.5, fontWeight: 700, color: '#fff', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
              AI Project Assistant
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
              Query Supabase pgvector documentation chunks and receive grounded AI responses.
            </p>
          </div>

          {/* 02 — Startup Idea Generator */}
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 18,
              padding: '22px 24px',
              opacity: 0.55,
              cursor: 'not-allowed',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>02</span>
              <span style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                padding: '3px 10px', borderRadius: 999,
              }}>COMING SOON</span>
            </div>
            <h3 style={{ fontSize: 16.5, fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
              Startup Idea Generator
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.6 }}>
              Generate AI startup concepts using custom multi-pass prompt engines.
            </p>
          </div>

          {/* 03 — Code Improver */}
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 18,
              padding: '22px 24px',
              opacity: 0.55,
              cursor: 'not-allowed',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>03</span>
              <span style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                padding: '3px 10px', borderRadius: 999,
              }}>COMING SOON</span>
            </div>
            <h3 style={{ fontSize: 16.5, fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
              Code Improver
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.6 }}>
              Paste code snippets to analyze performance bottlenecks and refactoring options.
            </p>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            PROJECT SELECTION BAR
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ marginBottom: 28 }}
        >
          <p style={{
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            fontWeight: 600,
            marginBottom: 14,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Select a project to explore
          </p>

          <div style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollbarWidth: 'none',
          }}>
            {Object.values(projectsCatalog).map((proj) => {
              const isSelected = selectedProject === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => handleProjectSelect(proj.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 999,
                    background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? proj.accentColor : 'rgba(255,255,255,0.08)'}`,
                    color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 0 18px ${proj.accentColor}38` : 'none',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: proj.accentColor,
                    display: 'inline-block',
                    boxShadow: isSelected ? `0 0 8px ${proj.accentColor}` : 'none',
                  }} />
                  {proj.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════
            MAIN ASSISTANT CHAT INTERFACE
        ══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="pg-chat-window"
          style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* Window Header / Chrome */}
          <div
            className="pg-header-chrome"
            style={{
              background: '#111111',
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {/* macOS Dots */}
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                  <div key={i} style={{ width: 9.5, height: 9.5, borderRadius: '50%', background: c }} />
                ))}
              </div>

              {/* Active Project Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  Asking about:
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: currentProject.accentColor,
                  background: `${currentProject.accentColor}18`,
                  border: `1px solid ${currentProject.accentColor}33`,
                  padding: '3px 12px',
                  borderRadius: 999,
                  letterSpacing: '-0.01em',
                }}>
                  {currentProject.name}
                </span>
              </div>
            </div>

            {/* Actions & System Ready Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ff5f57'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                >
                  Clear Chat
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }}
                />
                <span style={{ fontSize: 10, color: '#4ade80', letterSpacing: '0.12em', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                  READY
                </span>
              </div>
            </div>
          </div>

          {/* Active Project Tech Banner */}
          <div
            className="pg-tech-banner"
            style={{
              padding: '14px 22px',
              background: 'rgba(255,255,255,0.018)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
              {currentProject.tagline}
            </span>

            <div className="pg-tech-stack-pills" style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {currentProject.techStack.slice(0, 4).map(t => (
                <span
                  key={t.name}
                  style={{
                    fontSize: 10.5,
                    color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '3px 9px',
                    borderRadius: 5,
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.icon} {t.name}
                </span>
              ))}
            </div>
          </div>

          {/* Conversation Area */}
          <div
            className="pg-conversation-area"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            style={{
              minHeight: 380,
              maxHeight: 520,
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >

            {/* Empty State */}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 12px', maxWidth: 640, margin: '0 auto' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(99,102,241,0.2))',
                  border: '1px solid rgba(168,85,247,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, color: '#c084fc', margin: '0 auto 16px',
                  boxShadow: '0 0 35px rgba(168,85,247,0.22)',
                }}>
                  ✦
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                  Explore {currentProject.name} with AI.
                </h3>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  Ask how this project works, why I chose specific technologies, how the database is structured, or how different components interact.
                </p>

                {/* Suggested Questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
                  <p style={{
                    fontSize: 10.5,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 600,
                    margin: '0 0 6px 0',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    Suggested questions for {currentProject.name}:
                  </p>

                  {currentProject.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: 13,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.35)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      }}
                    >
                      <span style={{ lineHeight: 1.4 }}>{q}</span>
                      <span style={{ color: currentProject.accentColor, fontSize: 14, flexShrink: 0 }}>→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                {msg.sender === 'user' ? (
                  <div
                    className="pg-user-bubble"
                    style={{
                      background: 'rgba(255,255,255,0.09)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: '18px 18px 4px 18px',
                      padding: '12px 18px',
                      maxWidth: '82%',
                      fontSize: 13.5,
                      color: '#ffffff',
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className="pg-ai-row"
                    style={{ display: 'flex', gap: 12, maxWidth: '92%', alignItems: 'flex-start', width: '100%' }}
                  >
                    {/* AI Avatar */}
                    <div
                      className="pg-ai-avatar"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${currentProject.accentColor}, #6366f1)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        color: '#ffffff',
                        flexShrink: 0,
                        marginTop: 2,
                        boxShadow: `0 0 16px ${currentProject.accentColor}55`,
                      }}
                    >
                      ✦
                    </div>

                    {/* AI Message Content */}
                    <div
                      className="pg-ai-bubble"
                      style={{
                        background: 'rgba(255,255,255,0.035)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '4px 18px 18px 18px',
                        padding: '14px 18px',
                        flex: 1,
                        minWidth: 0,
                        overflowX: 'hidden',
                      }}
                    >
                      {renderMarkdown(msg.text)}

                      {msg.source && (
                        <div style={{
                          marginTop: 12,
                          paddingTop: 8,
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.35)',
                          fontFamily: "'JetBrains Mono', monospace",
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ color: currentProject.accentColor, fontSize: 10 }}>✦</span>
                            <span>Answered using project knowledge</span>
                            {msg.sectionsRetrieved && msg.sectionsRetrieved.length > 0 && (
                              <span style={{ opacity: 0.65 }}>: {msg.sectionsRetrieved.join(' · ')}</span>
                            )}
                          </div>
                          <span style={{ opacity: 0.5 }}>{msg.timestamp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Generating Loading State */}
            {loading && (
              <div className="pg-ai-row" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  className="pg-ai-avatar"
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${currentProject.accentColor}, #6366f1)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, color: '#fff', flexShrink: 0,
                  }}
                >
                  ✦
                </div>
                <div
                  className="pg-ai-bubble"
                  style={{
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '4px 18px 18px 18px',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
                        style={{ width: 4, height: 4, borderRadius: '50%', background: currentProject.accentColor }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}>
                    Exploring {currentProject.name} knowledge...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Bar */}
          <div
            className="pg-input-bar"
            style={{
              padding: '16px 20px',
              background: '#111111',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 12,
            }}
          >
            <textarea
              className="pg-input-textarea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask any question about ${currentProject.name}...`}
              disabled={loading}
              rows={1}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#ffffff',
                fontSize: 13.5,
                fontFamily: "'Inter', sans-serif",
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5,
                maxHeight: 120,
              }}
            />

            <button
              className="pg-send-button"
              onClick={() => handleSend()}
              disabled={!query.trim() || loading}
              aria-label="Send message"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: query.trim() && !loading ? currentProject.accentColor : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: query.trim() && !loading ? '#ffffff' : 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: query.trim() && !loading ? `0 0 20px ${currentProject.accentColor}44` : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" opacity="0.3" />
              </svg>
            </button>
          </div>

          <div
            className="pg-footer-bar"
            style={{
              padding: '8px 20px 12px',
              background: '#111111',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10.5,
              color: 'rgba(255,255,255,0.22)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span>Press Enter to send · Shift + Enter for new line</span>
            <span>Grounded in database pgvector documentation</span>
          </div>
        </motion.div>

      </div>

      <Footer />
    </main>
  );
}
