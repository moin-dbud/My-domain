import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// const blockInspect = () => {
//   const preventDefault = (event) => event.preventDefault();

//   window.addEventListener('contextmenu', preventDefault, { passive: false });
//   window.addEventListener('keydown', (event) => {
//     const key = event.key.toLowerCase();
//     const isDevToolsCombo =
//       (event.ctrlKey || event.metaKey) && key === 'shift' && event.key.toUpperCase() === 'I' ||
//       (event.ctrlKey || event.metaKey) && key === 'u' ||
//       (event.ctrlKey || event.metaKey) && key === 's' ||
//       (event.ctrlKey || event.metaKey) && key === 'p';

//     if (isDevToolsCombo || key === 'f12') {
//       event.preventDefault();
//       event.stopPropagation();
//     }
//   }, { passive: false });
// };

// if (typeof window !== 'undefined') {
//   blockInspect();
// }

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      clerkJSUrl="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
      afterSignOutUrl="/guestbook"
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)

