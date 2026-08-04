import { useRef, useState, useEffect, cloneElement } from 'react';
import { useInView } from 'framer-motion';
import { GitHubCalendar } from 'react-github-calendar';

const GITHUB_USERNAME = 'moin-dbud';
const GITHUB_TOKEN     = import.meta.env.VITE_GITHUB_TOKEN;

/* ─────────────────────────────────────────────────────────────────────────
   GraphQL query — fetches the last 12 months of contribution data directly
   from GitHub's official API (real-time, never cached by a proxy).
   Requires a PAT token with at least the `read:user` scope.
───────────────────────────────────────────────────────────────────────── */
const CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

/* Map a raw contribution count to a level 0-4 (mirrors GitHub's own scale) */
function countToLevel(count) {
  if (count === 0) return 0;
  if (count <= 3)  return 1;
  if (count <= 6)  return 2;
  if (count <= 9)  return 3;
  return 4;
}

/* Fetch the last ~12 months of contributions via GitHub GraphQL API */
async function fetchGitHubContributions(username, token) {
  const to   = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);

  const res = await fetch('https://api.github.com/graphql', {
    method:  'POST',
    headers: {
      Authorization:  `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: {
        username,
        from: from.toISOString(),
        to:   to.toISOString(),
      },
    }),
  });

  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);

  const json = await res.json();

  if (json.errors?.length) throw new Error(json.errors[0].message);

  const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!weeks) throw new Error('Unexpected response shape from GitHub GraphQL API');

  /* Flatten weeks → days, convert to react-activity-calendar Activity format */
  const activities = weeks.flatMap(week =>
    week.contributionDays.map(day => ({
      date:  day.date,
      count: day.contributionCount,
      level: countToLevel(day.contributionCount),
    }))
  );

  return activities;
}

/* ─── GitHub Activity Section ───────────────────────────────────────────── */
export default function GitHubActivity() {
  const sectionRef = useRef(null);
  const isInView   = useInView(sectionRef, { once: true, margin: '-80px' });

  /* ── Real-time data state (only populated when VITE_GITHUB_TOKEN is set) ── */
  const [liveData, setLiveData]       = useState(null);
  const [fetchError, setFetchError]   = useState(null);
  const [totalCount, setTotalCount]   = useState(null);
  const [isLoading, setIsLoading]     = useState(Boolean(GITHUB_TOKEN));

  useEffect(() => {
    if (!GITHUB_TOKEN) return; // Fall back to library's own fetch

    let cancelled = false;
    setIsLoading(true);

    fetchGitHubContributions(GITHUB_USERNAME, GITHUB_TOKEN)
      .then(data => {
        if (cancelled) return;
        const total = data.reduce((sum, d) => sum + d.count, 0);
        setLiveData(data);
        setTotalCount(total);
        setIsLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.warn('[GitHubActivity] GraphQL fetch failed, falling back to library:', err.message);
        setFetchError(err.message);
        setIsLoading(false);
        // Don't set liveData — the fallback <GitHubCalendar> will handle it
      });

    return () => { cancelled = true; };
  }, []);

  /* ── Floating tooltip state ─────────────────────────────────────────── */
  const [tooltip, setTooltip] = useState({
    visible: false, x: 0, y: 0, count: 0, date: '',
  });

  /* ── Framer variants ─────────────────────────────────────────────────── */
  const fadeUp = {
    hidden:  { opacity: 0, y: 40 },
    visible: (d) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.65, delay: d * 0.12, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const scaleIn = {
    hidden:  { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1, scale: 1,
      transition: { duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] },
    },
  };

  /* ── Shared renderBlock prop ─────────────────────────────────────────── */
  const renderBlock = (block, activity) => {
    const dateLabel = new Date(activity.date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
    return cloneElement(block, {
      style: {
        ...block.props.style,
        cursor: 'pointer',
        transition: 'transform 0.14s ease, filter 0.14s ease',
        transformOrigin: 'center',
        transformBox: 'fill-box',
      },
      onMouseEnter(e) {
        e.currentTarget.style.transform = 'scale(1.55)';
        e.currentTarget.style.filter    = 'brightness(1.45)';
        setTooltip({ visible: true, x: e.clientX, y: e.clientY, count: activity.count, date: dateLabel });
      },
      onMouseMove(e) {
        setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }));
      },
      onMouseLeave(e) {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.filter    = 'brightness(1)';
        setTooltip(t => ({ ...t, visible: false }));
      },
    });
  };

  /* ── Shared GitHubCalendar props ─────────────────────────────────────── */
  const calendarProps = {
    username:         GITHUB_USERNAME,
    colorScheme:      'dark',
    theme:            { dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'] },
    blockSize:        14,
    blockMargin:      4,
    blockRadius:      3,
    fontSize:         13,
    showWeekdayLabels: true,
    style:            { minWidth: 620, color: 'rgba(255,255,255,0.45)' },
    renderBlock,
  };

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#000', width: '100%',
        padding: '20px 20px 90px',
        fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* ── Subtle green section glow ── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 40% at 50% 100%, rgba(39,211,83,0.05) 0%, transparent 70%)',
      }} />

      {/* ── Floating tooltip ── */}
      {tooltip.visible && (
        <div aria-hidden="true" style={{
          position: 'fixed',
          left: tooltip.x, top: tooltip.y - 12,
          transform: 'translate(-50%, -100%)',
          background: '#1c2128',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 8, padding: '8px 13px',
          pointerEvents: 'none', zIndex: 9999,
          boxShadow: '0 8px 28px rgba(0,0,0,0.75)',
          whiteSpace: 'nowrap',
          fontFamily: "'Inter', sans-serif",
          minWidth: 140,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3', marginBottom: 3 }}>
            {tooltip.count === 0
              ? 'No contributions'
              : `${tooltip.count} contribution${tooltip.count !== 1 ? 's' : ''}`}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(230,237,243,0.5)', fontWeight: 400 }}>
            {tooltip.date}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Label ── */}
        <motion.p
          custom={0} variants={fadeUp}
          initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          style={{
            fontSize: 11, fontWeight: 500,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            textAlign: 'center', margin: '0 0 20px 0',
          }}
        >
          My Code Journey
        </motion.p>

        {/* ── Headline ── */}
        <motion.h2
          custom={1} variants={fadeUp}
          initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
            color: 'rgba(255,255,255,0.92)',
            textAlign: 'center', margin: '0 0 6px 0',
          }}
        >
          GitHub Activity
        </motion.h2>

        {/* ── Italic gradient sub-line ── */}
        <motion.p
          custom={2} variants={fadeUp}
          initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
            fontWeight: 400, fontStyle: 'italic',
            fontFamily: "'Playfair Display', Georgia, serif",
            textAlign: 'center', margin: '0 0 64px 0',
            background: 'linear-gradient(90deg,#ff2f92,#c548ff,#ff7a18)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          &amp;&amp; Open Source
        </motion.p>

        {/* ── Heatmap Card ── */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          style={{ position: 'relative', borderRadius: 20, padding: 'clamp(24px, 4vw, 40px)' }}
        >
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <span style={{ fontSize: 16 }}>🐙</span>
            <span style={{
              fontSize: 12, fontWeight: 500,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.28)',
            }}>
              Daily contributions &amp; open-source work
            </span>

            {/* Total count badge — shown when we have live data */}
            {liveData && totalCount !== null && (
              <span style={{
                padding: '2px 10px', borderRadius: 999,
                background: 'rgba(57,211,83,0.1)',
                border: '1px solid rgba(57,211,83,0.22)',
                fontSize: 11, fontWeight: 600,
                color: '#39d353', letterSpacing: '0.04em',
              }}>
                {totalCount.toLocaleString()} this year
              </span>
            )}

            {/* Fetch error indicator */}
            {fetchError && !liveData && (
              <span style={{
                padding: '2px 10px', borderRadius: 999,
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.2)',
                fontSize: 10, color: '#f87171', letterSpacing: '0.06em',
              }}>
                ⚠ using cached data
              </span>
            )}

            {/* LIVE indicator — green when real-time, grey when cached */}
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: liveData ? '#39d353' : 'rgba(255,255,255,0.2)',
                boxShadow: liveData ? '0 0 6px #39d353' : 'none',
                display: 'inline-block',
                animation: liveData ? 'ghPulse 2s ease-in-out infinite' : 'none',
              }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}>
                {liveData ? 'LIVE' : (GITHUB_TOKEN ? 'LOADING…' : 'CACHED')}
              </span>
            </span>
          </div>

          {/* ── Calendar — horizontally scrollable on mobile ── */}
          <div style={{
            overflowX: 'auto', overflowY: 'visible', paddingBottom: 4,
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.07) transparent',
          }}>
            {/* ── LIVE path: render with real-time data from GitHub GraphQL ── */}
            {liveData && !isLoading ? (
              <GitHubCalendar
                {...calendarProps}
                /* year="last" is ignored when transformData returns our own data */
                year="last"
                transformData={() => liveData}
              />
            ) : isLoading ? (
              /* Loading skeleton */
              <div style={{
                minWidth: 620, height: 112,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, color: 'rgba(255,255,255,0.25)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: '0.08em',
              }}>
                <span style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid rgba(57,211,83,0.2)',
                  borderTopColor: '#39d353',
                  animation: 'ghSpin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Fetching real-time contributions…
              </div>
            ) : (
              /* ── FALLBACK path: library default fetch (may be cached) ── */
              <GitHubCalendar
                {...calendarProps}
                year="last"
              />
            )}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes ghPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.4); }
        }
        @keyframes ghSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
