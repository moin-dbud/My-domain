import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  useUser,
  useClerk,
  SignInButton,
  SignUpButton,
} from '@clerk/clerk-react';
import PageHero from '../components/PageHero';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

/* ─── Injected global styles ──────────────────────────────────── */
const gbStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital@1&family=Montserrat:wght@900&display=swap');

  * { box-sizing: border-box; }

  /* Responsive section padding */
  @media (max-width: 900px) {
    .gb-section { padding-left: 32px !important; padding-right: 32px !important; }
  }
  @media (max-width: 600px) {
    .gb-section { padding-left: 16px !important; padding-right: 16px !important; }
    .gb-sig-grid { grid-template-columns: 1fr !important; }
  }

  @keyframes gb-shimmer {
    from { background-position: -200% 0; }
    to   { background-position:  200% 0; }
  }
  .gb-skeleton {
    background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
    background-size: 200% 100%;
    animation: gb-shimmer 1.4s infinite;
    border-radius: 16px;
  }

  @keyframes gb-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .gb-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.15);
    border-top-color: white;
    border-radius: 50%;
    animation: gb-spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }

  @keyframes gb-pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.75); }
  }
  .gb-checking-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #facc15;
    animation: gb-pulse-dot 1s ease-in-out infinite;
  }

  /* Input */
  .gb-input {
    width: 100%; padding: 13px 16px; border-radius: 12px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: white; font-size: 15px; font-family: 'Inter', sans-serif;
    outline: none; transition: border-color 0.2s, background 0.2s;
    letter-spacing: -0.01em;
  }
  .gb-input:focus { border-color: rgba(255,255,255,0.28); background: rgba(255,255,255,0.08); }
  .gb-input::placeholder { color: rgba(255,255,255,0.28); }
  .gb-input.error   { border-color: rgba(248,113,113,0.6); }
  .gb-input.success { border-color: rgba(74,222,128,0.5); }
  .gb-input.checking { border-color: rgba(250,204,21,0.45); }

  /* Identity card */
  @keyframes gb-identity-glow {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }
  .gb-identity-card {
    position: relative; overflow: hidden;
    border-radius: 20px; padding: 20px 24px;
    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(12px);
    margin-bottom: 36px;
  }
  .gb-identity-card::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 60% 80% at 10% 50%, rgba(74,222,128,0.06) 0%, transparent 60%);
    pointer-events: none;
  }
  .gb-identity-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 8px rgba(74,222,128,0.8);
    animation: gb-identity-glow 2s ease-in-out infinite;
    flex-shrink: 0;
  }

  /* Textarea */
  .gb-textarea {
    width: 100%; padding: 13px 16px; border-radius: 12px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: white; font-size: 14.5px; font-family: 'Inter', sans-serif;
    outline: none; resize: vertical; min-height: 110px;
    transition: border-color 0.2s, background 0.2s;
    letter-spacing: -0.01em; line-height: 1.6;
  }
  .gb-textarea:focus { border-color: rgba(255,255,255,0.28); background: rgba(255,255,255,0.08); }
  .gb-textarea::placeholder { color: rgba(255,255,255,0.28); }

  /* Primary btn */
  .gb-primary-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 600;
    font-family: 'Inter', sans-serif; letter-spacing: -0.01em;
    background: white; color: black; border: none; cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
  }
  .gb-primary-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .gb-primary-btn:active { transform: scale(0.97); }
  .gb-primary-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* Ghost btn */
  .gb-ghost-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 500;
    font-family: 'Inter', sans-serif; letter-spacing: -0.01em;
    background: transparent; color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.1);
    cursor: pointer; transition: background 0.2s, color 0.2s;
  }
  .gb-ghost-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }

  /* Auth prompt buttons */
  .gb-auth-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%; padding: 14px 20px; border-radius: 14px;
    font-size: 15px; font-weight: 500; font-family: 'Inter', sans-serif;
    cursor: pointer; border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05); color: white;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;
    letter-spacing: -0.01em;
  }
  .gb-auth-btn:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.22); transform: translateY(-1px); }
  .gb-auth-btn:active { transform: scale(0.98); }

  /* Overlay / Modal */
  .gb-overlay {
    position: fixed; inset: 0; z-index: 999;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    background: rgba(0,0,0,0.78);
    backdrop-filter: blur(10px);
  }
  .gb-modal {
    width: 100%; max-width: 440px;
    background: #0d0d0d; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px; padding: 36px 32px;
    box-shadow: 0 40px 100px rgba(0,0,0,0.9);
    position: relative;
  }

  /* Signature card */
  .gb-sig-card {
    background: rgba(10,10,10,0.9);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 18px; padding: 22px 24px;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  }
  .gb-sig-card:hover {
    border-color: rgba(255,255,255,0.14);
    background: rgba(18,18,18,0.9);
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  }

  /* Leave signature CTA */
  .gb-cta-card {
    border: 1px dashed rgba(255,255,255,0.18);
    border-radius: 20px; padding: 32px 28px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
    cursor: pointer; background: rgba(255,255,255,0.02);
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    text-align: center;
  }
  .gb-cta-card:hover {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.3);
    transform: translateY(-2px);
  }

  /* Clerk sign-in button reset */
  .clerk-sign-in-btn, .clerk-sign-up-btn {
    all: unset;
    display: block;
    width: 100%;
  }

  @media (max-width: 600px) {
    .gb-modal { padding: 28px 20px; border-radius: 18px; }
    .gb-sig-grid { grid-template-columns: 1fr !important; }
  }
`;

/* ─── SVG icons ──────────────────────────────────────────────── */
const PenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/* ─── Relative time helper ───────────────────────────────────── */
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)    return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12)  return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/* ─── Avatar initials ────────────────────────────────────────── */
function Avatar({ name, imageUrl, size = 38 }) {
  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = (name.charCodeAt(i) + (hash << 5) - hash) | 0;
  const hue = Math.abs(hash) % 360;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${hue},70%,38%), hsl(${(hue + 60) % 360},70%,28%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: 'white',
      letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif",
    }}>
      {initials}
    </div>
  );
}

/* ─── Modal close button ─────────────────────────────────────── */
function CloseBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute', top: 16, right: 16,
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 18, lineHeight: 1, transition: 'background 0.18s, color 0.18s',
        outline: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
      aria-label="Close"
    >
      ×
    </button>
  );
}

/* ─── Modal label ────────────────────────────────────────────── */
function ModalLabel({ children }) {
  return (
    <p style={{
      margin: '0 0 6px 2px', fontSize: 12, fontWeight: 500,
      color: 'rgba(255,255,255,0.42)', letterSpacing: '0.06em',
      textTransform: 'uppercase', fontFamily: "'Inter', sans-serif",
    }}>
      {children}
    </p>
  );
}

/* --- Reaction label map --- */
const REACTION_LABELS = {
  '❤️': 'Liked',   '🔥': 'Loved',   '⭐': 'Starred',
  '👏': 'Applauded', '😍': 'Adored', '🎉': 'Celebrated',
  '💯': 'Rated',   '🙌': 'Cheered', '✨': 'Highlighted',
};

/* --- Redesigned Signature Card --- */
function SignatureCard({ entry, index }) {
  const isPinned    = entry.is_pinned;
  const reaction    = entry.reaction;
  const displayName = entry.name || entry.username || 'Guest';
  const reactionLabel = reaction ? (REACTION_LABELS[reaction] || 'Reacted') : null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: Math.min(index, 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        padding: reaction ? '20px 22px 0' : '20px 22px 20px',
        background: isPinned
          ? 'linear-gradient(135deg, rgba(168,85,247,0.07) 0%, rgba(10,10,10,0.95) 100%)'
          : 'rgba(12,12,12,0.96)',
        border: `1px solid ${isPinned ? 'rgba(168,85,247,0.22)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 18,
        overflow: 'hidden',
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      whileHover={{
        borderColor: isPinned ? 'rgba(168,85,247,0.38)' : 'rgba(255,255,255,0.13)',
        boxShadow: '0 14px 44px rgba(0,0,0,0.55)',
      }}
    >
      {/* Decorative large quote marks */}
      <div aria-hidden style={{
        position: 'absolute', top: 8, right: 16,
        fontSize: 76, lineHeight: 1,
        color: 'rgba(255,255,255,0.035)',
        fontFamily: 'Georgia, serif', fontWeight: 900,
        pointerEvents: 'none', userSelect: 'none',
        letterSpacing: '-6px',
      }}>{'\u201c\u201c'}</div>

      {/* Pin badge */}
      {isPinned && (
        <div style={{ marginBottom: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#c084fc',
            background: 'rgba(168,85,247,0.12)',
            border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: 999, padding: '2px 9px',
          }}>📌 Pinned</span>
        </div>
      )}

      {/* Avatar + name + timestamp */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, position: 'relative' }}>
        <Avatar name={displayName} imageUrl={entry.avatar_url} size={40} />
        <div>
          <div style={{
            fontWeight: 700, fontSize: 14, color: 'white',
            letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>{displayName}</div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.28)',
            marginTop: 3, letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>{relativeTime(entry.created_at)}</div>
        </div>
      </div>

      {/* Message body */}
      <p style={{
        margin: '0 0 18px', fontSize: 14, lineHeight: 1.72,
        color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.01em',
        wordBreak: 'break-word', position: 'relative',
      }}>
        {entry.message}
      </p>

      {/* Reaction footer */}
      {reaction && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '11px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: '#f472b6',
            letterSpacing: '-0.01em',
          }}>
            {reactionLabel} by Moin
          </span>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{reaction}</span>
        </div>
      )}

      {/* Bottom accent line for pinned */}
      {isPinned && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)',
        }} />
      )}
    </Motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL 1 — Sign-in prompt (uses Clerk's managed UI)
   ═══════════════════════════════════════════════════════════════ */
function AuthModal({ onClose }) {
  return (
    <div className="gb-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <Motion.div
        className="gb-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <CloseBtn onClick={onClose} />

        <div style={{
          width: 52, height: 52, borderRadius: 14, margin: '0 auto 20px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.7)',
        }}>
          <PenIcon />
        </div>

        <h2 style={{
          margin: '0 0 8px', textAlign: 'center', fontSize: 22, fontWeight: 700,
          color: 'white', letterSpacing: '-0.03em', fontFamily: "'Inter', sans-serif",
        }}>
          Sign my guestbook
        </h2>
        <p style={{
          margin: '0 0 28px', textAlign: 'center', fontSize: 14,
          color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontFamily: "'Inter', sans-serif",
        }}>
          Create an account or sign in to leave your mark.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Clerk's SignInButton opens its own modal on top */}
          <SignInButton mode="modal" afterSignInUrl="/guestbook">
            <button className="gb-auth-btn" id="gb-clerk-signin">
              <UserIcon />
              Sign in
            </button>
          </SignInButton>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'Inter', sans-serif", letterSpacing: '0.08em' }}>
              OR
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <SignUpButton mode="modal" afterSignUpUrl="/guestbook">
            <button
              className="gb-auth-btn"
              id="gb-clerk-signup"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.16)' }}
            >
              Create account
            </button>
          </SignUpButton>
        </div>

        <p style={{
          marginTop: 22, textAlign: 'center', fontSize: 11,
          color: 'rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif",
        }}>
          Powered by Clerk · No spam, ever.
        </p>
      </Motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL 2 — Pick a display username (first-time only)
   ═══════════════════════════════════════════════════════════════ */
const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;

function UsernameModal({ clerkUser, onComplete, onClose }) {
  // Pre-fill from Clerk profile
  const suggested = (
    clerkUser?.username ||
    clerkUser?.firstName ||
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
    ''
  ).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);

  const [username, setUsername] = useState(suggested);
  const [status, setStatus] = useState('idle'); // idle | checking | available | taken | invalid
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef(null);

  // Auto-check suggested value on mount
  useEffect(() => {
    if (suggested) {
      debounceRef.current = setTimeout(() => check(suggested), 300);
    }
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const check = useCallback(async (val) => {
    const trimmed = val.trim();
    if (!trimmed) { setStatus('idle'); return; }
    if (!USERNAME_RE.test(trimmed)) { setStatus('invalid'); return; }
    setStatus('checking');
    const { data } = await supabase
      .from('guestbook_clerk_profiles')
      .select('clerk_id')
      .eq('username', trimmed)
      .maybeSingle();
    setStatus(data ? 'taken' : 'available');
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => check(val), 450);
  };

  const handleSave = async () => {
    if (status !== 'available' || saving) return;
    setSaving(true);

    const { error } = await supabase.from('guestbook_clerk_profiles').insert({
      clerk_id:   clerkUser.id,
      username:   username.trim(),
      avatar_url: clerkUser.imageUrl || null,
      full_name:  clerkUser.fullName || null,
    });

    if (error) {
      if (error.code === '23505') setStatus('taken');
      setSaving(false);
      return;
    }

    onComplete({ username: username.trim(), avatar_url: clerkUser.imageUrl || null });
  };

  const inputClass =
    status === 'taken' || status === 'invalid' ? 'gb-input error'
    : status === 'available' ? 'gb-input success'
    : status === 'checking'  ? 'gb-input checking'
    : 'gb-input';

  const hint =
    status === 'invalid'   ? 'Use 3–20 chars: letters, numbers, _ or -'
    : status === 'taken'   ? 'That username is already taken.'
    : status === 'available' ? 'Looks good! This username is available.'
    : 'Only letters, numbers, underscores and hyphens.';

  const hintColor =
    status === 'invalid' || status === 'taken' ? 'rgba(248,113,113,0.85)'
    : status === 'available' ? 'rgba(74,222,128,0.85)'
    : 'rgba(255,255,255,0.28)';

  return (
    <div className="gb-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <Motion.div
        className="gb-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <CloseBtn onClick={onClose} />

        {/* Clerk avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Avatar name={clerkUser.fullName || clerkUser.firstName} imageUrl={clerkUser.imageUrl} size={44} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'white', letterSpacing: '-0.01em' }}>
              {clerkUser.fullName || clerkUser.firstName || 'Welcome!'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              Let's set your display name
            </div>
          </div>
        </div>

        <h2 style={{
          margin: '0 0 6px', fontSize: 20, fontWeight: 700,
          color: 'white', letterSpacing: '-0.03em', fontFamily: "'Inter', sans-serif",
        }}>
          Pick a username
        </h2>
        <p style={{
          margin: '0 0 22px', fontSize: 14,
          color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif",
        }}>
          This is how you'll appear in the guestbook.
        </p>

        <div style={{ marginBottom: 20 }}>
          <ModalLabel>Username</ModalLabel>
          <div style={{ position: 'relative' }}>
            <input
              className={inputClass}
              id="gb-username-input"
              type="text"
              placeholder="e.g. moin_dev"
              value={username}
              onChange={handleChange}
              maxLength={20}
              autoFocus
              autoCapitalize="none"
              spellCheck={false}
            />
            {/* Status icon */}
            <div style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center',
            }}>
              {status === 'checking' && <span className="gb-checking-dot" />}
              {status === 'available' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {(status === 'taken' || status === 'invalid') && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
          </div>
          <p style={{ margin: '7px 0 0 2px', fontSize: 12, color: hintColor, fontFamily: "'Inter', sans-serif", minHeight: 16 }}>
            {hint}
          </p>
        </div>

        <button
          className="gb-primary-btn"
          style={{ width: '100%' }}
          onClick={handleSave}
          disabled={status !== 'available' || saving}
          id="gb-save-username"
        >
          {saving
            ? <><span className="gb-spinner" style={{ borderTopColor: 'black', borderColor: 'rgba(0,0,0,0.2)' }} /> Saving…</>
            : 'Confirm username →'
          }
        </button>
      </Motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODAL 3 — Write & submit message
   ═══════════════════════════════════════════════════════════════ */
function MessageModal({ clerkUser, profile, onClose, onPosted }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const MAX = 300;

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed || trimmed.length > MAX) return;
    setSubmitting(true);
    setError('');

    // Only send what's required — let DB defaults handle is_approved, initials, avatar_color
    const { error: err } = await supabase.from('guestbook').insert({
      name:        profile.username,
      username:    profile.username,
      avatar_url:  profile.avatar_url || clerkUser.imageUrl || null,
      message:     trimmed,
      is_approved: true,
    });

    if (err) {
      console.error('Guestbook insert error:', err.code, err.message, err.details, err.hint);
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    onPosted({
      name:        profile.username,
      username:    profile.username,
      avatar_url:  profile.avatar_url || clerkUser.imageUrl || null,
      message:     trimmed,
      created_at:  new Date().toISOString(),
      is_approved: true,
      is_pinned:   false,
      reaction:    null,
    });
    onClose();
  };

  const remaining = MAX - message.length;

  return (
    <div className="gb-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <Motion.div
        className="gb-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <CloseBtn onClick={onClose} />

        {/* Identity row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Avatar name={profile.username} imageUrl={profile.avatar_url || clerkUser.imageUrl} size={44} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'white', letterSpacing: '-0.01em' }}>
              {profile.username}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              Signing the guestbook
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <ModalLabel>Your message</ModalLabel>
          <textarea
            className="gb-textarea"
            id="gb-message-textarea"
            placeholder="Leave a thought, a shoutout, or just say hi 👋"
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={MAX}
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 5 }}>
            <span style={{
              fontSize: 11,
              color: remaining < 30 ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.22)',
              fontFamily: "'Inter', sans-serif",
            }}>
              {remaining} left
            </span>
          </div>
        </div>

        {error && (
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#f87171', fontFamily: "'Inter', sans-serif" }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="gb-ghost-btn" onClick={onClose}>Cancel</button>
          <button
            className="gb-primary-btn"
            style={{ flex: 1 }}
            onClick={handleSubmit}
            disabled={!message.trim() || message.length > MAX || submitting}
            id="gb-submit-message"
          >
            {submitting
              ? <><span className="gb-spinner" style={{ borderTopColor: 'black', borderColor: 'rgba(0,0,0,0.2)' }} /> Posting…</>
              : 'Leave signature ✍️'
            }
          </button>
        </div>
      </Motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN GUESTBOOK PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Guestbook() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [entries, setEntries]               = useState([]);
  const [loadingEntries, setLoadingEntries]  = useState(true);
  const [profile, setProfile]               = useState(null);
  const [loadingProfile, setLoadingProfile]  = useState(false);
  const [modal, setModal]                   = useState('none');
  const [visibleCount, setVisibleCount]      = useState(10);
  const PAGE_SIZE = 10;

  /* ── Page title ─── */
  useEffect(() => { document.title = 'Guestbook | Moin Sheikh'; }, []);

  /* ── Fetch Supabase profile when Clerk user is known ─── */
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    let cancelled = false;
    supabase
      .from('guestbook_clerk_profiles')
      .select('username, avatar_url')
      .eq('clerk_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setProfile(data || null);
        setLoadingProfile(false);
      });
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, user]);

  /* ── Fetch ALL entries (no approval gate) ─── */
  useEffect(() => {
    supabase
      .from('guestbook')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEntries(data);
        setLoadingEntries(false);
      });
  }, []);

  /* ── CTA click logic ─── */
  const handleCTA = () => {
    if (!isSignedIn) { setModal('auth'); return; }
    if (!profile)    { setModal('username'); return; }
    setModal('message');
  };

  const handleUsernameComplete = (prof) => {
    setProfile(prof);
    setModal('message');
  };

  /* ── Derived label ─── */
  const userLabel = profile?.username || user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || null;
  const isAuthLoading = !isLoaded || (isSignedIn && loadingProfile);

  return (
    <main style={{ background: '#000', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{gbStyles}</style>

      <PageHero
        title="GUESTBOOK"
        subtitle="You were here."
        highlight="Leave your mark."
      />

      <section className="gb-section" style={{ width: '100%', padding: '0 clamp(16px, 5vw, 48px) clamp(80px, 12vh, 120px)' }}>

        {/* ── Centered container for identity + CTA ── */}
        <div style={{ maxWidth: 740, margin: '0 auto' }}>

          {/* ── Premium identity card ── */}
          {isLoaded && isSignedIn && !isAuthLoading && (
            <Motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="gb-identity-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                {/* Avatar with ring */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    padding: 2,
                    background: 'linear-gradient(135deg, rgba(74,222,128,0.6), rgba(74,222,128,0.1))',
                  }}>
                    <Avatar name={userLabel} imageUrl={user?.imageUrl} size={44} />
                  </div>
                  <span className="gb-identity-dot" style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 11, height: 11,
                    border: '2px solid #000',
                  }} />
                </div>

                {/* Text block */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 15, fontWeight: 700, color: 'white',
                      letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif",
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {userLabel || 'Guest'}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: '#4ade80',
                      background: 'rgba(74,222,128,0.1)',
                      border: '1px solid rgba(74,222,128,0.2)',
                      borderRadius: 999, padding: '2px 8px', flexShrink: 0,
                    }}>
                      ● Online
                    </span>
                  </div>
                  <span style={{
                    fontSize: 12, color: 'rgba(255,255,255,0.35)',
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {user?.primaryEmailAddress?.emailAddress || 'Authenticated via Clerk'}
                  </span>
                </div>

                {/* Sign-out button */}
                <button
                  onClick={() => signOut()}
                  id="gb-signout-btn"
                  style={{
                    flexShrink: 0, padding: '8px 16px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 500,
                    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,80,80,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,80,80,0.2)';
                    e.currentTarget.style.color = 'rgba(255,100,100,0.9)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                  }}
                >
                  Sign out
                </button>
              </div>
            </Motion.div>
          )}

          {/* ── CTA card ── */}
          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="gb-cta-card"
            onClick={handleCTA}
            role="button"
            tabIndex={0}
            id="gb-cta-card"
            onKeyDown={e => e.key === 'Enter' && handleCTA()}
            style={{ marginBottom: 48 }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.55)',
            }}>
              <PenIcon />
            </div>
            <div>
              <p style={{
                margin: '0 0 4px', fontSize: 16, fontWeight: 600,
                color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.02em',
              }}>
                Leave your signature
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.32)', lineHeight: 1.5 }}>
                {!isLoaded
                  ? 'Loading…'
                  : isSignedIn && profile
                  ? `Drop a message as ${profile.username} →`
                  : isSignedIn && !profile
                  ? 'Pick a username to continue →'
                  : 'Sign in with Clerk to sign my wall →'
                }
              </p>
            </div>
          </Motion.div>

        </div>{/* end centered container */}

        {/* ── Count label ── */}
        <Motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}
        >
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.22)',
          }}>
            {loadingEntries ? '—' : entries.length}
            {' '}{entries.length === 1 ? 'signature' : 'signatures'}
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </Motion.div>

        {/* ── Skeleton ── */}
        {loadingEntries && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="gb-skeleton" style={{ height: 96 }} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loadingEntries && entries.length === 0 && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', padding: '70px 20px',
              color: 'rgba(255,255,255,0.2)', fontSize: 14,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 14 }}>✍️</div>
            No signatures yet — be the first to leave your mark!
          </Motion.div>
        )}

        {/* ── Signature grid ── */}
        {!loadingEntries && entries.length > 0 && (() => {
          const pinned = entries.filter(e => e.is_pinned);
          const rest   = entries.filter(e => !e.is_pinned);
          const sorted = [...pinned, ...rest];
          const visible = sorted.slice(0, visibleCount);
          const hasMore = visibleCount < sorted.length;

          return (
            <>
              {/* Pinned section */}
              {pinned.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                      textTransform: 'uppercase', color: '#c084fc',
                    }}>📌 Pinned</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(168,85,247,0.15)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))', gap: 14 }}>
                    {pinned.map((entry, i) => (
                      <SignatureCard
                        key={entry.id || `p-${i}`}
                        entry={entry}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular entries */}
              {pinned.length > 0 && rest.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
                  }}>Recent</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))', gap: 14 }}>
                {visible
                  .filter(e => !e.is_pinned)
                  .map((entry, i) => (
                    <SignatureCard
                      key={entry.id || `r-${i}`}
                      entry={entry}
                      index={i}
                    />
                  ))
                }
              </div>

              {/* Load more */}
              {hasMore && (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', marginTop: 32 }}
                >
                  <button
                    id="gb-load-more"
                    onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                    style={{
                      padding: '11px 28px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500,
                      fontFamily: "'Inter', sans-serif", cursor: 'pointer',
                      letterSpacing: '-0.01em',
                      transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                    }}
                  >
                    Load {Math.min(PAGE_SIZE, sorted.length - visibleCount)} more
                    <span style={{ marginLeft: 6, opacity: 0.5 }}>
                      ({sorted.length - visibleCount} remaining)
                    </span>
                  </button>
                </Motion.div>
              )}
            </>
          );
        })()}
      </section>

      <Footer />

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal === 'auth' && (
          <AuthModal key="auth" onClose={() => setModal('none')} />
        )}
        {modal === 'username' && isSignedIn && user && (
          <UsernameModal
            key="username"
            clerkUser={user}
            onComplete={handleUsernameComplete}
            onClose={() => setModal('none')}
          />
        )}
        {modal === 'message' && isSignedIn && user && profile && (
          <MessageModal
            key="message"
            clerkUser={user}
            profile={profile}
            onClose={() => setModal('none')}
            onPosted={(entry) => {
              // Optimistic UI — show immediately, will show after admin approval for others
              setEntries(prev => [entry, ...prev]);
              setModal('none');
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
