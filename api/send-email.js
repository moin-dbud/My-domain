/**
 * Vercel Serverless Function – /api/send-email
 *
 * Handles two types:
 *   type = "call"    → Book a call confirmation
 *   type = "message" → Send a message confirmation
 *
 * Required env vars (set in Vercel Dashboard → Settings → Env Vars):
 *   GMAIL_USER     – moinsheikh1303@gmail.com
 *   GMAIL_APP_PASS – 16-char Google App Password (NOT your Gmail password)
 *
 * For LOCAL dev: add these to your .env file and run `vercel dev`.
 */

import nodemailer from 'nodemailer';

/* ─── CORS helper ──────────────────────────────────────────── */
function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/* ─── Brand colours ────────────────────────────────────────── */
const BRAND = {
    bg: '#080808',
    card: '#0f0f0f',
    border: '#1e1e1e',
    accent: '#ffffff',
    accent2: '#6366f1',
    green: '#4ade80',
    muted: '#666666',
    text: '#e5e5e5',
};

/* ─── Shared email wrapper ─────────────────────────────────── */
function emailWrapper(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Moin Sheikh</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Inter',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:${BRAND.bg};padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:580px;width:100%;">

        <!-- ── HEADER ── -->
        <tr><td style="padding:0 0 28px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="vertical-align:middle;">
                <span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.03em;font-style:italic;font-family:Georgia,serif;">MS</span>
              </td>
              <td align="right" style="vertical-align:middle;">
                <span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;color:${BRAND.muted};letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">
                  <span style="display:inline-block;width:6px;height:6px;background:${BRAND.green};border-radius:50%;"></span>
                  Available for work
                </span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ── CARD ── -->
        <tr><td style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;">

          ${content}

          <!-- ── FOOTER ── -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                 style="border-top:1px solid ${BRAND.border};padding:24px 36px;">
            <tr>
              <td style="font-size:12px;color:${BRAND.muted};line-height:1.7;">
                This email was sent by <strong style="color:#888;">Moin Sheikh</strong> · 
                <a href="https://moinsheikh.in" style="color:#888;text-decoration:none;">moinsheikh.in</a><br/>
                If you didn't request this, you can safely ignore it.
              </td>
            </tr>
          </table>

        </td></tr>

        <!-- ── BOTTOM SPACER ── -->
        <tr><td style="padding:20px 0;text-align:center;">
          <span style="font-size:11px;color:#333;">© 2026 Moin Sheikh. All rights reserved.</span>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ─── Call confirmation template (to user) ─────────────────── */
function callConfirmationTemplate({ name, date, time, guests, note }) {
    const guestRows = guests && guests.length > 0
        ? `<tr><td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};">
             <span style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Guests</span>
             <p style="margin:4px 0 0;font-size:14px;color:${BRAND.text};">${guests.join(', ')}</p>
           </td></tr>`
        : '';
    const noteRow = note
        ? `<tr><td style="padding:10px 0;">
             <span style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Your Note</span>
             <p style="margin:4px 0 0;font-size:14px;color:${BRAND.text};line-height:1.65;">${note}</p>
           </td></tr>`
        : '';

    const content = `
      <!-- Hero banner -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="background:linear-gradient(135deg,#0f0f1a 0%,#0a0a12 100%);padding:40px 36px 36px;">
        <tr><td>
          <div style="display:inline-block;width:52px;height:52px;background:rgba(99,102,241,0.12);border:1.5px solid rgba(99,102,241,0.3);border-radius:14px;text-align:center;line-height:52px;font-size:24px;margin-bottom:20px;">📅</div>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.03em;line-height:1.2;">
            Your call is confirmed!
          </h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.45);line-height:1.6;">
            Hey ${name}, I'm looking forward to speaking with you. Here are your booking details.
          </p>
        </td></tr>
      </table>

      <!-- Details card -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 36px 8px;">
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                 style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <tr><td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};">
                  <span style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Date</span>
                  <p style="margin:4px 0 0;font-size:14px;color:${BRAND.text};font-weight:600;">${date}</p>
                </td></tr>

                <tr><td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};">
                  <span style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Time</span>
                  <p style="margin:4px 0 0;font-size:14px;color:${BRAND.text};font-weight:600;">${time} IST · 30 minutes</p>
                </td></tr>

                <tr><td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};">
                  <span style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Platform</span>
                  <p style="margin:4px 0 0;font-size:14px;color:${BRAND.text};">Google Meet / Zoom — link will be sent separately</p>
                </td></tr>

                <tr><td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};">
                  <span style="font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Host</span>
                  <p style="margin:4px 0 0;font-size:14px;color:${BRAND.text};">Moin Sheikh · <a href="https://moinsheikh.in" style="color:${BRAND.accent2};text-decoration:none;">moinsheikh.in</a></p>
                </td></tr>

                ${guestRows}
                ${noteRow}

              </table>
            </td></tr>
          </table>
        </td></tr>
      </table>

      <!-- Tips -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:24px 36px;">
        <tr><td style="background:rgba(99,102,241,0.07);border:1px solid rgba(99,102,241,0.15);border-radius:12px;padding:18px 20px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:${BRAND.accent2};text-transform:uppercase;letter-spacing:0.08em;">Before the call</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:rgba(255,255,255,0.5);line-height:2;">
            <li>Have a brief overview of what you'd like to discuss ready</li>
            <li>Make sure your mic and camera are working</li>
            <li>Join a couple minutes early to test your connection</li>
          </ul>
        </td></tr>
      </table>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:8px 36px 36px;">
        <tr><td align="center">
          <a href="https://moinsheikh.in/book-a-call"
             style="display:inline-block;background:#fff;color:#000;font-size:14px;font-weight:700;
                    text-decoration:none;padding:14px 36px;border-radius:999px;
                    letter-spacing:-0.01em;">
            View Booking →
          </a>
        </td></tr>
      </table>
    `;
    return emailWrapper(content);
}

/* ─── Message confirmation template (to user) ──────────────── */
function messageConfirmationTemplate({ name, message }) {
    const preview = message.length > 200 ? message.substring(0, 200) + '…' : message;
    const content = `
      <!-- Hero banner -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="background:linear-gradient(135deg,#0d0d0d 0%,#0a0a0a 100%);padding:40px 36px 36px;">
        <tr><td>
          <div style="display:inline-block;width:52px;height:52px;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.12);border-radius:14px;text-align:center;line-height:52px;font-size:24px;margin-bottom:20px;">✉️</div>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.03em;line-height:1.2;">
            Message received!
          </h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.45);line-height:1.6;">
            Hey ${name}, thanks for reaching out! I'll get back to you within 24–48 hours.
          </p>
        </td></tr>
      </table>

      <!-- Message preview -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 36px 24px;">
        <tr><td>
          <p style="margin:0 0 12px;font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
            Your Message
          </p>
          <div style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-left:3px solid ${BRAND.accent2};border-radius:10px;padding:18px 20px;">
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.75;font-style:italic;">
              "${preview}"
            </p>
          </div>
        </td></tr>
      </table>

      <!-- What next -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:0 36px 24px;">
        <tr><td style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:12px;padding:18px 20px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:${BRAND.green};text-transform:uppercase;letter-spacing:0.08em;">What happens next?</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:rgba(255,255,255,0.45);line-height:2.1;">
            <li>I'll read your message carefully</li>
            <li>You'll hear back from me at <strong style="color:#888;">${''}</strong> within 24–48 hours</li>
            <li>If you'd prefer a call, you can book one directly on my site</li>
          </ul>
        </td></tr>
      </table>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:8px 36px 36px;">
        <tr><td align="center">
          <a href="https://moinsheikh.in/book-a-call"
             style="display:inline-block;background:#fff;color:#000;font-size:14px;font-weight:700;
                    text-decoration:none;padding:14px 36px;border-radius:999px;
                    letter-spacing:-0.01em;">
            Book a call instead →
          </a>
        </td></tr>
      </table>
    `;
    return emailWrapper(content);
}

/* ─── Guestbook confirmation template (to user) ────────────── */
function guestbookConfirmationTemplate({ name, username, message }) {
    const preview = message.length > 250 ? message.substring(0, 250) + '…' : message;
    const userHandle = username ? `@${username}` : `@${name.toLowerCase().replace(/\s+/g, '')}`;
    const content = `
      <!-- Hero banner -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="background:linear-gradient(135deg,#0f0f1a 0%,#0a0a12 100%);padding:40px 36px 36px;">
        <tr><td>
          <div style="display:inline-block;width:52px;height:52px;background:rgba(74,222,128,0.12);border:1.5px solid rgba(74,222,128,0.3);border-radius:14px;text-align:center;line-height:52px;font-size:24px;margin-bottom:20px;">✍️</div>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.03em;line-height:1.2;">
            Your signature is published!
          </h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.45);line-height:1.6;">
            Hey ${name}, thank you for signing my guestbook! Your signature is now live.
          </p>
        </td></tr>
      </table>

      <!-- Message preview -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 36px 24px;">
        <tr><td>
          <p style="margin:0 0 12px;font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">
            Your Signature
          </p>
          <div style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-left:3px solid ${BRAND.green};border-radius:12px;padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#fff;">
              ${name} <span style="font-size:12px;font-weight:400;color:${BRAND.muted};">(${userHandle})</span>
            </p>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.75;font-style:italic;">
              "${preview}"
            </p>
          </div>
        </td></tr>
      </table>

      <!-- Status note -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:0 36px 24px;">
        <tr><td style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.15);border-radius:12px;padding:18px 20px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:${BRAND.green};text-transform:uppercase;letter-spacing:0.08em;">Live on the site</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;">
            Your message is now visible to everyone visiting <strong style="color:#888;">moinsheikh.in/guestbook</strong>.
          </p>
        </td></tr>
      </table>

      <!-- CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:8px 36px 36px;">
        <tr><td align="center">
          <a href="https://moinsheikh.in/guestbook"
             style="display:inline-block;background:#fff;color:#000;font-size:14px;font-weight:700;
                    text-decoration:none;padding:14px 36px;border-radius:999px;
                    letter-spacing:-0.01em;">
            View Guestbook Wall →
          </a>
        </td></tr>
      </table>
    `;
    return emailWrapper(content);
}

/* ─── Owner notification template ─────────────────────────── */
function ownerNotificationTemplate({ type, name, email, username, date, time, guests, note, message }) {
    const isCall = type === 'call';
    const isGuestbook = type === 'guestbook';
    const title = isCall
        ? '📅 New call booking!'
        : isGuestbook
        ? '✍️ New Guestbook Signature!'
        : '✉️ New message received!';

    const content = `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="background:${isCall ? 'linear-gradient(135deg,#0f0f1a,#0a0a12)' : 'linear-gradient(135deg,#0d0d0d,#0a0a0a)'};padding:32px 36px 28px;">
        <tr><td>
          <h2 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.02em;">
            ${title}
          </h2>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.4);">
            ${isGuestbook ? 'From your website guestbook wall' : 'From your portfolio contact form'}
          </p>
        </td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:28px 36px;">
        <tr><td style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:14px;padding:20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">

            <tr><td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};">
              <span style="font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.07em;font-weight:600;">Name</span>
              <p style="margin:3px 0 0;font-size:14px;color:${BRAND.text};font-weight:600;">${name} ${username ? `(@${username})` : ''}</p>
            </td></tr>

            <tr><td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};">
              <span style="font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.07em;font-weight:600;">Email</span>
              <p style="margin:3px 0 0;font-size:14px;color:${BRAND.accent2};">${email}</p>
            </td></tr>

            ${isCall ? `
            <tr><td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};">
              <span style="font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.07em;font-weight:600;">Date &amp; Time</span>
              <p style="margin:3px 0 0;font-size:14px;color:${BRAND.text};">${date} · ${time} IST</p>
            </td></tr>

            ${guests && guests.length ? `
            <tr><td style="padding:8px 0;border-bottom:1px solid ${BRAND.border};">
              <span style="font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.07em;font-weight:600;">Guests</span>
              <p style="margin:3px 0 0;font-size:14px;color:${BRAND.text};">${guests.join(', ')}</p>
            </td></tr>` : ''}

            ${note ? `
            <tr><td style="padding:8px 0;">
              <span style="font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.07em;font-weight:600;">Note</span>
              <p style="margin:3px 0 0;font-size:14px;color:${BRAND.text};line-height:1.65;">${note}</p>
            </td></tr>` : ''}
            ` : `
            <tr><td style="padding:8px 0;">
              <span style="font-size:11px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.07em;font-weight:600;">Message</span>
              <p style="margin:3px 0 0;font-size:14px;color:${BRAND.text};line-height:1.7;">${message}</p>
            </td></tr>
            `}

          </table>
        </td></tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:0 36px 36px;">
        <tr><td align="center">
          <a href="mailto:${email}?subject=Re: ${isCall ? `Your call on ${date}` : isGuestbook ? 'Your guestbook entry' : 'Your message'}"
             style="display:inline-block;background:#fff;color:#000;font-size:14px;font-weight:700;
                    text-decoration:none;padding:13px 30px;border-radius:999px;letter-spacing:-0.01em;">
            Reply to ${name} →
          </a>
        </td></tr>
      </table>
    `;
    return emailWrapper(content);
}

/* ─── Main handler ─────────────────────────────────────────── */
export default async function handler(req, res) {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { GMAIL_USER, GMAIL_APP_PASS } = process.env;

    if (!GMAIL_USER || !GMAIL_APP_PASS) {
        console.error('Missing GMAIL_USER or GMAIL_APP_PASS env vars');
        return res.status(500).json({ error: 'Email service not configured.' });
    }

    const body = req.body;
    const { type, name, email, username, date, time, guests, note, message } = body;

    if (!type || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields: type, name, email.' });
    }
    if (!['call', 'message', 'guestbook'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type. Must be "call", "message", or "guestbook".' });
    }
    if (type === 'call' && (!date || !time)) {
        return res.status(400).json({ error: 'Missing date or time for call booking.' });
    }
    if ((type === 'message' || type === 'guestbook') && !message) {
        return res.status(400).json({ error: 'Missing message content.' });
    }

    /* ── Create transporter ── */
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASS,
        },
    });

    try {
        /* ── 1. Confirmation email → user ── */
        let userHtml;
        let subjectText;

        if (type === 'call') {
            userHtml = callConfirmationTemplate({ name, date, time, guests: guests || [], note: note || '' });
            subjectText = `✅ Call confirmed — ${date} at ${time} IST`;
        } else if (type === 'guestbook') {
            userHtml = guestbookConfirmationTemplate({ name, username, message });
            subjectText = `✍️ Your signature is live on Moin Sheikh's Guestbook!`;
        } else {
            userHtml = messageConfirmationTemplate({ name, message });
            subjectText = `📩 Got your message, ${name}!`;
        }

        await transporter.sendMail({
            from: `"Moin Sheikh" <${GMAIL_USER}>`,
            to: email,
            subject: subjectText,
            html: userHtml,
        });

        /* ── 2. Notification email → owner ── */
        const ownerHtml = ownerNotificationTemplate({
            type, name, email, username, date, time, guests: guests || [], note: note || '', message: message || '',
        });

        await transporter.sendMail({
            from: `"Portfolio Bot" <${GMAIL_USER}>`,
            to: GMAIL_USER,
            replyTo: email,
            subject: type === 'call'
                ? `📅 New call booked by ${name} — ${date} at ${time}`
                : type === 'guestbook'
                ? `✍️ New Guestbook Signature from ${name} (@${username || 'user'})`
                : `✉️ New message from ${name}`,
            html: ownerHtml,
        });

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('Nodemailer error:', err);
        return res.status(500).json({ error: 'Failed to send email. Please try again.' });
    }
}
