import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHero from '../components/PageHero';
import Footer from '../components/Footer';
import { useSEO } from '../hooks/useSEO';
import JsonLd from '../components/JsonLd';

/* ─── Injected Styles ───────────────────────────────────────────── */
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital@1&family=Montserrat:wght@900&display=swap');

  .bac-tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.01em;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.1);
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
    background: transparent;
    color: rgba(255,255,255,0.45);
    position: relative;
    overflow: hidden;
  }
  .bac-tab-btn.active {
    background: white;
    color: black;
    border-color: white;
    box-shadow: 0 0 32px rgba(255,255,255,0.18), 0 4px 16px rgba(0,0,0,0.4);
  }
  .bac-tab-btn:not(.active):hover {
    color: white;
    border-color: rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.06);
  }

  .bac-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 14px 18px;
    color: white;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    font-weight: 400;
    outline: none;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
    box-sizing: border-box;
  }
  .bac-input::placeholder {
    color: rgba(255,255,255,0.22);
  }
  .bac-input:focus {
    border-color: rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(255,255,255,0.05);
  }
  textarea.bac-input {
    resize: none;
    min-height: 120px;
  }

  .bac-time-slot {
    padding: 10px 16px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.55);
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
    text-align: center;
  }
  .bac-time-slot:hover {
    border-color: rgba(255,255,255,0.28);
    color: white;
    background: rgba(255,255,255,0.08);
  }
  .bac-time-slot.selected {
    background: white;
    color: black;
    border-color: white;
    font-weight: 600;
    box-shadow: 0 0 20px rgba(255,255,255,0.12);
  }

  .bac-calendar-day {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
    border: 1px solid transparent;
    color: rgba(255,255,255,0.65);
    user-select: none;
  }
  .bac-calendar-day:hover:not(.disabled):not(.selected) {
    background: rgba(255,255,255,0.08);
    color: white;
    border-color: rgba(255,255,255,0.14);
  }
  .bac-calendar-day.selected {
    background: white;
    color: black !important;
    border-color: white;
    font-weight: 700;
    box-shadow: 0 0 20px rgba(255,255,255,0.18);
  }
  .bac-calendar-day.today:not(.selected) {
    border-color: rgba(255,255,255,0.22);
    color: white;
  }
  .bac-calendar-day.disabled {
    color: rgba(255,255,255,0.15);
    cursor: not-allowed;
  }

  .bac-submit-btn {
    width: 100%;
    padding: 16px;
    border-radius: 14px;
    border: none;
    background: white;
    color: black;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
    box-shadow: 0 4px 24px rgba(255,255,255,0.12);
    position: relative;
    overflow: hidden;
  }
  .bac-submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(255,255,255,0.22);
  }
  .bac-submit-btn:active {
    transform: translateY(0px);
  }
  .bac-submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .bac-add-guest-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 1px dashed rgba(255,255,255,0.18);
    padding: 8px 16px;
    border-radius: 10px;
    color: rgba(255,255,255,0.45);
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.22s ease;
    font-weight: 500;
  }
  .bac-add-guest-btn:hover {
    border-color: rgba(255,255,255,0.35);
    color: white;
    background: rgba(255,255,255,0.05);
  }

  .bac-success-ring {
    animation: successPulse 2s ease-in-out infinite;
  }
  @keyframes successPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
    50% { box-shadow: 0 0 0 16px rgba(74,222,128,0); }
  }

  .bac-info-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    color: rgba(255,255,255,0.45);
    font-weight: 500;
  }
  .bac-info-chip .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px rgba(74,222,128,0.7);
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .bac-grid { flex-direction: column !important; }
    .bac-calendar-col { width: 100% !important; }
    .bac-form-col { width: 100% !important; }
  }
`;

/* ─── MONTHS / DAYS ──────────────────────────────────────── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const TIME_SLOTS = [
  '09:00 AM','10:00 AM','11:00 AM',
  '12:00 PM','01:00 PM','02:00 PM',
  '03:00 PM','04:00 PM','05:00 PM',
];

/* ─── Mini Calendar ─────────────────────────────────────── */
function MiniCalendar({ selected, onSelect }) {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const prevMonth = () => {
    setView(v => {
      const d = new Date(v.year, v.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };
  const nextMonth = () => {
    setView(v => {
      const d = new Date(v.year, v.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const isPast = (day) => {
    const d = new Date(view.year, view.month, day);
    d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };
  const isSelected = (day) => {
    if (!selected) return false;
    return selected.getDate() === day && selected.getMonth() === view.month && selected.getFullYear() === view.year;
  };
  const isToday = (day) => {
    return today.getDate() === day && today.getMonth() === view.month && today.getFullYear() === view.year;
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ width: '100%' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button
          onClick={prevMonth}
          style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:'6px 10px', borderRadius:8, transition:'color 0.2s', fontSize:18, lineHeight:1 }}
          onMouseEnter={e => e.currentTarget.style.color='white'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}
        >‹</button>
        <span style={{ color:'white', fontWeight:600, fontSize:14, fontFamily:"'Inter', sans-serif", letterSpacing:'-0.01em' }}>
          {MONTHS[view.month]} {view.year}
        </span>
        <button
          onClick={nextMonth}
          style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', padding:'6px 10px', borderRadius:8, transition:'color 0.2s', fontSize:18, lineHeight:1 }}
          onMouseEnter={e => e.currentTarget.style.color='white'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}
        >›</button>
      </div>

      {/* Weekday labels */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:8 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.25)', fontFamily:"'Inter', sans-serif", letterSpacing:'0.05em', padding:'4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
        {cells.map((day, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
            {day ? (
              <button
                className={`bac-calendar-day${isSelected(day) ? ' selected' : ''}${isToday(day) ? ' today' : ''}${isPast(day) ? ' disabled' : ''}`}
                onClick={() => !isPast(day) && onSelect(new Date(view.year, view.month, day))}
              >
                {day}
              </button>
            ) : <div style={{ width:36, height:36 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Success State ─────────────────────────────────────── */
function SuccessState({ mode, onReset }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.92 }}
      animate={{ opacity:1, scale:1 }}
      transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'60px 32px', gap:20 }}
    >
      <div
        className="bac-success-ring"
        style={{ width:72, height:72, borderRadius:'50%', background:'rgba(74,222,128,0.1)', border:'2px solid rgba(74,222,128,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <h3 style={{ color:'white', fontSize:22, fontWeight:700, fontFamily:"'Inter', sans-serif", letterSpacing:'-0.02em', margin:'0 0 8px' }}>
          {mode === 'call' ? "Call Scheduled!" : "Message Sent!"}
        </h3>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, fontFamily:"'Inter', sans-serif", lineHeight:1.65, margin:0 }}>
          {mode === 'call'
            ? "Your call has been booked. Check your email for a confirmation and calendar invite."
            : "Thanks for reaching out! I'll get back to you within 24–48 hours."}
        </p>
      </div>
      <button
        onClick={onReset}
        className="bac-add-guest-btn"
        style={{ marginTop:8 }}
      >
        {mode === 'call' ? '← Book another call' : '← Send another message'}
      </button>
    </motion.div>
  );
}

/* ─── Info Sidebar ──────────────────────────────────────── */
function InfoSidebar() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
      {/* Avatar + name */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ width:56, height:56, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.15)', overflow:'hidden', background:'#1a1a1a' }}>
          <img
            src="/cropped_circle_image.webp"
            alt="Moin Sheikh"
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onError={e => { e.currentTarget.style.display='none'; }}
          />
        </div>
        <div>
          <p style={{ color:'white', fontWeight:700, fontSize:20, fontFamily:"'Inter', sans-serif", letterSpacing:'-0.02em', margin:'0 0 4px' }}>Moin Sheikh</p>
          <p style={{ color:'rgba(255,255,255,0.38)', fontSize:13, fontFamily:"'Inter', sans-serif", margin:0 }}>Creative Engineer · AI Developer</p>
        </div>
      </div>

      {/* Status chip */}
      <div className="bac-info-chip" style={{ alignSelf:'flex-start' }}>
        <span className="dot" />
        Available for new projects
      </div>

      {/* Details */}
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {[
          { icon: '🕐', label:'Duration', value:'30 minutes' },
          { icon: '📹', label:'Platform', value:'Google Meet / Zoom' },
          { icon: '🌍', label:'Timezone', value:'IST (UTC+5:30)' },
          { icon: '⚡', label:'Response time', value:'Within 24 hours' },
        ].map(({ icon, label, value }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
              {icon}
            </div>
            <div>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontFamily:"'Inter', sans-serif", letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600, margin:'0 0 2px' }}>{label}</p>
              <p style={{ color:'rgba(255,255,255,0.8)', fontSize:13, fontFamily:"'Inter', sans-serif", fontWeight:500, margin:0 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height:1, background:'rgba(255,255,255,0.07)' }} />

      {/* Topics */}
      <div>
        <p style={{ color:'rgba(255,255,255,0.28)', fontSize:11, fontFamily:"'Inter', sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600, margin:'0 0 12px' }}>Topics I can help with</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {['AI Development','Full-Stack','Web Design','Startups','Career Advice','Code Review'].map(t => (
            <span key={t} style={{ padding:'5px 12px', borderRadius:999, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', fontSize:12, fontFamily:"'Inter', sans-serif", color:'rgba(255,255,255,0.45)', fontWeight:500 }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Book Call Form ────────────────────────────────────── */
function BookCallForm({ onSuccess }) {
  const [step, setStep] = useState(1); // 1 = pick date/time, 2 = fill details
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addGuest = () => setGuests(g => [...g, '']);
  const removeGuest = (i) => setGuests(g => g.filter((_, idx) => idx !== i));
  const updateGuest = (i, v) => setGuests(g => g.map((x, idx) => idx === i ? v : x));

  const canProceed = selectedDate && selectedTime;
  const canSubmit = name.trim() && email.trim() && /\S+@\S+\.\S+/.test(email);

  const fmt = (d) => d ? d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }) : '';

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'call',
          name: name.trim(),
          email: email.trim(),
          date: fmt(selectedDate),
          time: selectedTime,
          guests: guests.filter(g => g.trim()),
          note: note.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to book the call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28 }}>
        {[1,2].map(s => (
          <div key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <motion.div
              animate={{ background: step >= s ? 'white' : 'rgba(255,255,255,0.1)', color: step >= s ? 'black' : 'rgba(255,255,255,0.3)' }}
              transition={{ duration:0.3 }}
              style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, fontFamily:"'Inter', sans-serif", flexShrink:0 }}
            >
              {step > s ? '✓' : s}
            </motion.div>
            <span style={{ fontSize:12, fontFamily:"'Inter', sans-serif", fontWeight:500, color: step >= s ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}>
              {s === 1 ? 'Date & Time' : 'Your Details'}
            </span>
            {s < 2 && <div style={{ width:28, height:1, background:'rgba(255,255,255,0.12)' }} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
            {/* Calendar */}
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontFamily:"'Inter', sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600, margin:'0 0 14px' }}>Select a date</p>
            <MiniCalendar selected={selectedDate} onSelect={setSelectedDate} />

            {/* Time slots */}
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontFamily:"'Inter', sans-serif", letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:600, margin:'24px 0 14px' }}>
              Select a time slot
              {selectedDate && <span style={{ color:'rgba(255,255,255,0.22)', textTransform:'none', letterSpacing:0, fontWeight:400 }}> — {fmt(selectedDate)}</span>}
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {TIME_SLOTS.map(t => (
                <button
                  key={t}
                  className={`bac-time-slot${selectedTime === t ? ' selected' : ''}`}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              className="bac-submit-btn"
              style={{ marginTop:28 }}
              disabled={!canProceed}
              onClick={() => setStep(2)}
            >
              Continue →
            </button>
            {!canProceed && (
              <p style={{ textAlign:'center', color:'rgba(255,255,255,0.25)', fontSize:12, fontFamily:"'Inter', sans-serif", marginTop:10 }}>
                Please select a date and time to continue
              </p>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
            {/* Summary chip */}
            <div style={{ padding:'10px 16px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <div>
                <p style={{ color:'white', fontSize:13, fontWeight:600, fontFamily:"'Inter', sans-serif", margin:'0 0 2px' }}>📅 {fmt(selectedDate)}</p>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, fontFamily:"'Inter', sans-serif", margin:0 }}>⏰ {selectedTime} · 30 min call</p>
              </div>
              <button onClick={() => setStep(1)} style={{ background:'none', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.4)', fontSize:12, padding:'5px 10px', borderRadius:8, cursor:'pointer', fontFamily:"'Inter', sans-serif", transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}
              >Edit</button>
            </div>

            {/* Form fields */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', color:'rgba(255,255,255,0.5)', fontSize:12, fontFamily:"'Inter', sans-serif", fontWeight:600, marginBottom:7, letterSpacing:'0.04em', textTransform:'uppercase' }}>Your Name *</label>
                <input id="bac-name" className="bac-input" placeholder="e.g. Alex Johnson" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ display:'block', color:'rgba(255,255,255,0.5)', fontSize:12, fontFamily:"'Inter', sans-serif", fontWeight:600, marginBottom:7, letterSpacing:'0.04em', textTransform:'uppercase' }}>Email Address *</label>
                <input id="bac-email" className="bac-input" type="email" placeholder="alex@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ display:'block', color:'rgba(255,255,255,0.5)', fontSize:12, fontFamily:"'Inter', sans-serif", fontWeight:600, marginBottom:7, letterSpacing:'0.04em', textTransform:'uppercase' }}>Additional Note</label>
                <textarea id="bac-note" className="bac-input" placeholder="Tell me a bit about what you'd like to discuss…" value={note} onChange={e => setNote(e.target.value)} />
              </div>

              {/* Guests */}
              {guests.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <label style={{ display:'block', color:'rgba(255,255,255,0.5)', fontSize:12, fontFamily:"'Inter', sans-serif", fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>Guest Emails</label>
                  <AnimatePresence>
                    {guests.map((g, i) => (
                      <motion.div key={i} initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }} style={{ display:'flex', gap:8 }}>
                        <input
                          className="bac-input"
                          type="email"
                          placeholder={`guest${i+1}@example.com`}
                          value={g}
                          onChange={e => updateGuest(i, e.target.value)}
                          style={{ flex:1 }}
                        />
                        <button
                          onClick={() => removeGuest(i)}
                          style={{ flexShrink:0, width:44, height:44, borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,60,60,0.15)'; e.currentTarget.style.color='#ff6b6b'; e.currentTarget.style.borderColor='rgba(255,60,60,0.25)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}
                          aria-label="Remove guest"
                        >×</button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Add guest button */}
              <button className="bac-add-guest-btn" onClick={addGuest} id="bac-add-guest">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add a guest
              </button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:24 }}>
              <button className="bac-submit-btn" disabled={!canSubmit || loading} onClick={handleSubmit} id="bac-submit-call">
                {loading ? (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin 0.8s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Sending confirmation…
                  </span>
                ) : 'Confirm & Book Call 🗓️'}
              </button>
              {error && (
                <p style={{ color:'#ff6b6b', fontSize:13, fontFamily:"'Inter', sans-serif", textAlign:'center', margin:'4px 0 0', lineHeight:1.5 }}>
                  ⚠️ {error}
                </p>
              )}
              <button onClick={() => setStep(1)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:13, fontFamily:"'Inter', sans-serif", cursor:'pointer', fontWeight:500, padding:'4px', transition:'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.6)'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}
              >
                ← Back to date selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Send Message Form ─────────────────────────────────── */
function SendMessageForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = name.trim() && email.trim() && /\S+@\S+\.\S+/.test(email) && message.trim();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <label style={{ display:'block', color:'rgba(255,255,255,0.5)', fontSize:12, fontFamily:"'Inter', sans-serif", fontWeight:600, marginBottom:7, letterSpacing:'0.04em', textTransform:'uppercase' }}>Your Name *</label>
          <input id="msg-name" className="bac-input" placeholder="e.g. Alex Johnson" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label style={{ display:'block', color:'rgba(255,255,255,0.5)', fontSize:12, fontFamily:"'Inter', sans-serif", fontWeight:600, marginBottom:7, letterSpacing:'0.04em', textTransform:'uppercase' }}>Email Address *</label>
          <input id="msg-email" className="bac-input" type="email" placeholder="alex@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label style={{ display:'block', color:'rgba(255,255,255,0.5)', fontSize:12, fontFamily:"'Inter', sans-serif", fontWeight:600, marginBottom:7, letterSpacing:'0.04em', textTransform:'uppercase' }}>Message *</label>
          <textarea
            id="msg-message"
            className="bac-input"
            style={{ minHeight:160 }}
            placeholder="Tell me about your project, idea, or just say hello…"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>
      </div>

      <button
        className="bac-submit-btn"
        style={{ marginTop:24 }}
        disabled={!canSubmit || loading}
        onClick={handleSubmit}
        id="msg-submit"
      >
        {loading ? (
          <span style={{ display:'inline-flex', alignItems:'center', gap:8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin 0.8s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Sending message…
          </span>
        ) : 'Send Message ✉️'}
      </button>
      {error && (
        <p style={{ color:'#ff6b6b', fontSize:13, fontFamily:"'Inter', sans-serif", textAlign:'center', marginTop:10, lineHeight:1.5 }}>
          ⚠️ {error}
        </p>
      )}
    </motion.div>
  );
}

/* ─── BookACall schema ──────────────────────────────────── */
const bookACallSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moinsheikh.in/' },
    { '@type': 'ListItem', position: 2, name: 'Book a Call', item: 'https://moinsheikh.in/book-a-call' },
  ],
};

/* ─── Main Page ─────────────────────────────────────────────── */
export default function BookACall() {
  const [mode, setMode] = useState('call'); // 'call' | 'message'
  const [callDone, setCallDone] = useState(false);
  const [msgDone, setMsgDone] = useState(false);

  useSEO({
    title: 'Book a Call | Moin Sheikh — Schedule a Meeting or Send a Message',
    description: 'Book a call or send a message to Moin Sheikh — AI developer and full-stack engineer from Nagpur, India. Available for freelance projects, consultations, and collaborations.',
    path: '/book-a-call',
  });

  const resetCall = () => setCallDone(false);
  const resetMsg = () => setMsgDone(false);

  const isDone = mode === 'call' ? callDone : msgDone;

  return (
    <main style={{ background:'#000', minHeight:'100vh' }}>
      <style>{pageStyles}</style>

      <PageHero
        title="LET'S TALK"
        subtitle="Choose how you'd like to connect —"
        highlight="book a call or drop a message."
      />

      {/* ── Scheduling Section ── */}
      <section style={{ padding:'0 24px 120px', fontFamily:"'Inter', sans-serif" }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>

          {/* Section label */}
          <motion.div
            initial={{ opacity:0, y:20 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, margin:'-40px' }}
            transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
            style={{ textAlign:'center', marginBottom:40 }}
          >
            <p style={{ color:'rgba(255,255,255,0.28)', fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', fontWeight:600, margin:'0 0 18px' }}>
              CONNECT WITH ME
            </p>

            {/* Toggle buttons */}
            <div style={{ display:'inline-flex', gap:10, padding:'6px', borderRadius:999, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.03)' }}>
              <button id="tab-book-call" className={`bac-tab-btn${mode === 'call' ? ' active' : ''}`} onClick={() => setMode('call')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Book a Call
              </button>
              <button id="tab-send-message" className={`bac-tab-btn${mode === 'message' ? ' active' : ''}`} onClick={() => setMode('message')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                Send a Message
              </button>
            </div>
          </motion.div>

          {/* Main card */}
          <motion.div
            initial={{ opacity:0, y:32 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, margin:'-40px' }}
            transition={{ duration:0.75, delay:0.1, ease:[0.22,1,0.36,1] }}
            style={{
              background:'#0a0a0a',
              border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:28,
              overflow:'hidden',
              position:'relative',
            }}
          >
            {/* Ambient glow */}
            <div style={{ position:'absolute', top:'-20%', right:'-5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.055) 0%, transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:'-10%', left:'-3%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)', pointerEvents:'none' }} />

            <div className="bac-grid" style={{ display:'flex', position:'relative', zIndex:1 }}>

              {/* ─ Left Sidebar ─ */}
              <div className="bac-calendar-col" style={{ width:'32%', minWidth:260, padding:'44px 36px', borderRight:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
                <InfoSidebar />
              </div>

              {/* ─ Right Form Area ─ */}
              <div className="bac-form-col" style={{ flex:1, padding:'44px 40px', minWidth:0 }}>

                <AnimatePresence mode="wait">
                  {isDone ? (
                    <SuccessState
                      key="success"
                      mode={mode}
                      onReset={mode === 'call' ? resetCall : resetMsg}
                    />
                  ) : (
                    <motion.div key={mode} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
                      {/* Form heading */}
                      <div style={{ marginBottom:28 }}>
                        <h2 style={{ color:'white', fontSize:22, fontWeight:700, fontFamily:"'Inter', sans-serif", letterSpacing:'-0.02em', margin:'0 0 6px' }}>
                          {mode === 'call' ? 'Schedule a Call' : 'Send a Message'}
                        </h2>
                        <p style={{ color:'rgba(255,255,255,0.38)', fontSize:13, fontFamily:"'Inter', sans-serif", lineHeight:1.65, margin:0 }}>
                          {mode === 'call'
                            ? 'Pick a date and time that works for you. I block off dedicated slots to make sure we have focused, uninterrupted time.'
                            : 'Fill in the form below and I\'ll get back to you as soon as possible — usually within 24 hours.'}
                        </p>
                      </div>

                      {mode === 'call'
                        ? <BookCallForm onSuccess={() => setCallDone(true)} />
                        : <SendMessageForm onSuccess={() => setMsgDone(true)} />
                      }
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Bottom note */}
          <motion.p
            initial={{ opacity:0 }}
            whileInView={{ opacity:1 }}
            viewport={{ once:true }}
            transition={{ duration:0.6, delay:0.25 }}
            style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:12, fontFamily:"'Inter', sans-serif", marginTop:28, letterSpacing:'0.01em', lineHeight:1.7 }}
          >
            All times shown in IST (UTC+5:30) · No spam, ever · You can reschedule anytime
          </motion.p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
