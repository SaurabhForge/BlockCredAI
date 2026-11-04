# BlockCredAI — Design Document

## 1. Design Philosophy

BlockCredAI uses **glassmorphism** as its visual language — frosted-glass cards floating over a deep dark gradient — to convey the dual themes of *transparency* (blockchain immutability) and *intelligence* (AI analysis). The palette is indigo-to-purple for the AI scanner side and emerald-to-teal for the employer verification side, giving each panel a distinct identity while both live in the same dark canvas.

---

## 2. Colour Palette

| Token | Hex / Tailwind | Usage |
|---|---|---|
| Background gradient | `from-gray-950 via-indigo-950 to-gray-950` | Full-page background |
| Glass surface | `bg-white/5 backdrop-blur-xl border border-white/10` | Card backgrounds |
| AI Scanner accent | `indigo-400 → purple-500` | Gradient text, borders, icons |
| Employer panel accent | `emerald-400 → teal-500` | Gradient text, borders, icons |
| Body text | `text-indigo-100/70` | Muted paragraph text |
| Heading text | `text-white` | High-contrast headings |
| Success state | `text-emerald-400` | Verified / 0% fraud result |
| Danger state | `text-red-400` | 100% fraud detected |
| Warning state | `text-yellow-400` | Moderate risk |

---

## 3. Typography

| Element | Tailwind classes | Notes |
|---|---|---|
| H1 hero | `text-5xl md:text-6xl font-extrabold tracking-tight` | Responsive, gradient clip |
| H2 card header | `text-xl font-semibold tracking-wide` | Per-panel section titles |
| Body / description | `text-lg font-light leading-relaxed` | Hero sub-copy |
| Label / caption | `text-xs text-indigo-300/60` | Card sub-labels |
| Font family | `font-sans` | System sans-serif stack |

---

## 4. Layout

### 4.1 Page Structure

```
┌──────────────────────────────────────────┐
│  Navbar (fixed, z-50, glass)             │
│  [Logo "B"] [BlockCredAI]  [Connect 🦊]  │
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│  Hero Section (centered, max-w-3xl)      │
│  "Trustless Employment                   │
│   Verification Engine"                   │
│  Sub-copy                                │
└──────────────────────────────────────────┘
┌────────────────┬─────────────────────────┐
│ AI Resume      │ Submit Employment        │
│ Scanner card   │ Record card              │
│ (indigo/purple)│ (emerald/teal)           │
└────────────────┴─────────────────────────┘
┌──────────────────────────────────────────┐
│  Footer  © 2026 BlockCredAI by Saurabh   │
└──────────────────────────────────────────┘
```

### 4.2 Responsive Behaviour
- Cards stack vertically on mobile (`flex-col`) and go side-by-side on `lg:` breakpoint (`lg:flex-row`).
- Navbar collapses to minimum — logo + connect button only (no hamburger needed; single-page app).
- Hero text scales from `text-5xl` → `text-6xl` on `md:` breakpoint.

### 4.3 Card Anatomy

Each panel card uses the same shell:
```
<div class="glass rounded-2xl p-8 shadow-2xl relative overflow-hidden">
  <!-- Decorative blur orbs (aria-hidden) top-left and bottom-right -->
  <div class="relative z-10">
    <!-- Card header: icon + title + subtitle -->
    <!-- Card body: form or result display -->
  </div>
</div>
```

The `.glass` utility (defined in `globals.css`) is:
```css
.glass {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
}
```

---

## 5. Component Design Specs

### 5.1 `WalletConnectButton`

**States:**
| State | Visual |
|---|---|
| Disconnected | Indigo gradient button "Connect Wallet" with MetaMask fox icon |
| Connecting | Button disabled, spinner visible |
| Connected | Shows truncated address (`0x1234...abcd`) with green dot indicator |
| Error | Red alert below button with error message |

**Behaviour:**
- On click: calls `window.ethereum.request({ method: 'eth_requestAccounts' })`.
- Automatically calls `wallet_addEthereumChain` to inject Hardhat network (Chain ID `0x7A69` = `31337`).
- Stores address in component state; no global store needed (single page).

---

### 5.2 `ResumeUpload` (AI Scanner Panel)

**Fields:**
| Field | Type | Validation |
|---|---|---|
| Resume PDF | `<input type="file" accept=".pdf">` | Required, PDF only, ≤ 2 MB |
| Candidate wallet address | `<input type="text">` | Required, Ethereum address format |
| Claimed experience | `<textarea>` | Required, 10–2000 chars |

**Submission states:**
| State | Visual |
|---|---|
| Idle | "Scan Resume" button active |
| Loading | Button disabled + `aria-busy="true"` on result region, spinner |
| Success — 0% fraud | Green checkmark badge + explanation text + on-chain job list |
| Success — 100% fraud | Red X badge + "Fraud Detected" banner + explanation |
| Success — moderate | Yellow warning badge + percentage + explanation |
| Error | Red alert with error message |

**On-chain jobs display:** Each `JobRecord` renders as a mini card:
- Job details (string)
- Employer address (truncated)
- Tenure: formatted date range from Unix timestamps
- NFT Token ID badge

---

### 5.3 `SubmitVerification` (Employer Panel)

**Fields:**
| Field | Type | Validation |
|---|---|---|
| Employee wallet address | `<input type="text">` | Required, Ethereum address |
| Job details | `<input type="text">` | Required, 3–500 chars |
| Start date | `<input type="date">` | Required, before end date |
| End date | `<input type="date">` | Required, after start date |
| IPFS Hash | `<input type="text">` | Optional, ≤ 120 chars |

**Submission states:**
| State | Visual |
|---|---|
| Idle | "Submit Verification" button active |
| Loading | Button disabled + spinner |
| Success | Green tick + transaction hash (truncated, copyable) |
| Error | Red alert with error detail |

---

## 6. Navbar Design

```
[B logo] BlockCredAI                    [Connect Wallet]
```
- Fixed at top (`position: fixed`, `top: 0`, `z-index: 50`).
- Glass background with `border-b border-white/5`.
- Logo: `w-10 h-10` circle, `bg-gradient-to-tr from-indigo-500 to-purple-600`, letter "B".
- Brand name: gradient text `from-indigo-400 to-purple-400`.
- Height: `h-20` (80px).
- Main content has `pt-32` to clear the fixed navbar.

---

## 7. Accessibility Design Decisions

| Feature | Implementation |
|---|---|
| Skip link | `<a href="#main-content" class="sr-only focus:not-sr-only ...">Skip to main content</a>` |
| Landmark roles | `<nav aria-label="Primary navigation">`, `<main id="main-content">`, `<footer>` |
| Form labels | All inputs paired with visible `<label for="...">` |
| Loading state | `aria-busy="true"` on result container during fetch |
| Decorative icons | `aria-hidden="true"` on all SVG decorations |
| Focus ring | Tailwind `focus:ring-2 focus:ring-indigo-500` on interactive elements |
| Color contrast | Light text on dark glass (minimum AA compliant) |
| Alert regions | Result display wrapped in `role="status"` or `role="alert"` |

---

## 8. Animation & Motion

| Element | Animation |
|---|---|
| Blur orbs (decorative) | Static; purely CSS `blur-3xl` and `mix-blend-screen` |
| Card hover | Subtle `hover:border-indigo-500/30` transition |
| Loading spinner | Tailwind `animate-spin` on a border-based spinner SVG |
| Result reveal | No animation (accessibility — avoids `prefers-reduced-motion` concerns) |

---

## 9. Dark Mode

The app is **dark-mode-only** by design. No light mode toggle exists. The page background is `bg-gray-950` with an indigo tint — always dark. This is an intentional design decision for the "Web3 / blockchain" aesthetic.

---

## 10. Iconography

All icons are inline SVG using the Heroicons style (stroke-based, `strokeWidth={2}`):
- **Shield check** — AI Scanner panel header
- **Building/office** — Submit Verification panel header
- **MetaMask fox** — `WalletConnectButton` (uses native MetaMask logo SVG path)

No icon font or icon library dependency — raw SVG paths only.

---

## 11. Deployment UI Considerations

On Render (production), `NEXT_PUBLIC_BACKEND_URL` points to the Cloud Run / Render backend URL. No design changes are needed — all API calls go through the env var, so the UI is environment-agnostic.
