/*
================================================================================
  PAGE OVERVIEW: Pricing.jsx (DocuMend Pricing & Plans Page)
================================================================================
  Purpose:
  - Displays subscription plans (Starter, Pro, Enterprise) with monthly/annual toggles.
  - Integrates the global WorkspaceChrome shell (Sidebar, Topbar, Drawers, Modals)
    for seamless navigation across DocuMend.
  - Highlights local-first privacy guarantees, testimonials, and trust badges.
================================================================================
*/

import { useState } from "react";

// Lucide React Icons: UI elements, badges, navigation, and features
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Minus,
  Quote,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";

// Workspace Shell Components: Shared across Dashboard, Version History, and Pricing
import {
  MobileDrawer,
  MobileTopbar,
  Sidebar,
  WorkspaceHeader,
  WorkspaceModal,
} from '../components/WorkspaceChrome';

// Navigation Helpers: Route mappings and custom client-side router
import { workspaceRoutes } from '../components/workspace-nav';
import { navigate } from '../router';

// Custom CSS for pricing tier cards, illustrations, and dark mode overrides
import "./pricing.css";
import { navigate, usePathname } from "../router";

/* ==========================================================================
   1. PRICING PLANS DATA CONFIGURATION
   ========================================================================== */
// Subscription plan tiers with dynamic prices for monthly vs annual billing
const plans = [
  {
    id: "starter",
    name: "Starter",
    eyebrow: "For finding your rhythm",
    description: "The essentials for cleaner essays, notes, and one very tidy workspace.",
    price: { monthly: 0, annual: 0 },
    suffix: "forever",
    cta: "Start writing",
    icon: FileText,
    tone: "light",
    features: [
      "3 active documents",
      "Local document history",
      "Structure & formatting repair",
      "Basic citation cleanup",
      "Export to PDF and DOCX",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    eyebrow: "For work worth polishing",
    description: "A quiet second brain for long-form research, citations, and the final 10%.",
    price: { monthly: 14, annual: 10 },
    suffix: "per month",
    cta: "Choose Pro",
    icon: Sparkles,
    tone: "featured",
    recommended: true, // Highlights this card with a special badge
    features: [
      "Unlimited active documents",
      "Full version history",
      "Intelligent citation repair",
      "Style guide presets",
      "Batch document cleanup",
      "Priority local model updates",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    eyebrow: "For careful teams",
    description: "A private document room for legal, academic, and research teams with standards.",
    price: { monthly: null, annual: null }, // Null denotes custom contact pricing
    suffix: "tailored to you",
    cta: "Talk to our team",
    icon: ShieldCheck,
    tone: "dark",
    features: [
      "Everything in Pro",
      "Private model deployment",
      "Team style libraries",
      "Admin and audit controls",
      "SAML SSO and SCIM",
      "Named privacy architect",
    ],
  },
];

/* ==========================================================================
   2. SUB-COMPONENTS
   ========================================================================== */

/**
 * BrandMark: Displays the brand icon inside the page header.
 */
function BrandMark() {
  return (
    <span className="pricing-brand-mark" aria-hidden="true">
      <FileText size={18} strokeWidth={2.35} />
    </span>
  );
}

/**
 * RepairIllustration: Custom SVG graphic showing documents being repaired offline.
 */
function RepairIllustration() {
  return (
    <svg
      className="pricing-illustration"
      viewBox="0 0 470 185"
      role="img"
      aria-label="A document being gently repaired"
    >
      {/* Dynamic connection wave */}
      <path
        className="pricing-illustration-line"
        d="M12 151c44-28 57-97 113-108 57-12 79 48 134 49 58 1 72-49 144-30"
      />
      {/* Document page preview */}
      <g transform="translate(62 28) rotate(-6 80 65)">
        <rect className="pricing-paper" width="164" height="123" rx="11" />
        <path className="pricing-paper-fold" d="M131 0h22a11 11 0 0 1 11 11v20z" />
        <rect x="19" y="22" width="83" height="9" rx="4.5" fill="#e8992e" />
        <rect x="19" y="47" width="123" height="6" rx="3" fill="#c0d2c6" />
        <rect x="19" y="63" width="104" height="6" rx="3" fill="#c0d2c6" />
        <rect x="19" y="79" width="122" height="6" rx="3" fill="#c0d2c6" />
        <rect x="19" y="99" width="61" height="8" rx="4" fill="#de6a50" opacity=".85" />
      </g>
      {/* Verified repair checkmark container */}
      <g transform="translate(287 28) rotate(8)">
        <rect width="122" height="92" rx="10" fill="#f0bd5c" />
        <rect x="16" y="18" width="63" height="7" rx="3.5" fill="#fff6de" />
        <rect x="16" y="38" width="88" height="5" rx="2.5" fill="#fff6de" opacity=".83" />
        <rect x="16" y="52" width="71" height="5" rx="2.5" fill="#fff6de" opacity=".83" />
        <circle cx="96" cy="73" r="11" fill="#21483e" />
        <path d="m90 73 4 5 9-10" fill="none" stroke="#f0bd5c" strokeWidth="2.6" />
      </g>
      {/* Pencil and sparkle decorations */}
      <path className="pricing-pencil" d="m211 130 29-48 13 8-29 48-18 7z" />
      <path className="pricing-pencil-tip" d="m211 130 13 8-18 7z" />
      <circle className="pricing-sparkle sparkle-one" cx="392" cy="20" r="4" />
      <circle className="pricing-sparkle sparkle-two" cx="31" cy="62" r="3" />
      <path className="pricing-star" d="m438 132 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
    </svg>
  );
}

/**
 * PlanIcon: Standard wrapper for tier-specific Lucide icons.
 */
function PlanIcon({ icon: Icon }) {
  return (
    <span className="pricing-plan-icon" aria-hidden="true">
      <Icon size={19} strokeWidth={2.1} />
    </span>
  );
}

/**
 * PlanCard: Renders individual subscription cards with calculated discounts.
 */
function PlanCard({ plan, isAnnual, onChoose }) {
  const Icon = plan.icon;
  // Determine pricing based on active frequency (Annual vs Monthly)
  const displayPrice = isAnnual ? plan.price.annual : plan.price.monthly;
  
  // Calculate percentage savings for annual billing
  const savings =
    plan.price.monthly && isAnnual
      ? Math.round((1 - plan.price.annual / plan.price.monthly) * 100)
      : 0;

  return (
    <article className={`pricing-plan pricing-plan-${plan.tone}`}>
      {/* Recommended Pill Badge */}
      {plan.recommended && (
        <div className="pricing-recommended">
          <Sparkles size={13} />
          Most loved by researchers
        </div>
      )}

      {/* Plan Header Info & Dynamic Price */}
      <div className="pricing-plan-top">
        <div className="pricing-plan-heading">
          <PlanIcon icon={Icon} />
          <div>
            <p className="pricing-plan-eyebrow">{plan.eyebrow}</p>
            <h2>{plan.name}</h2>
          </div>
        </div>
        <p className="pricing-plan-description">{plan.description}</p>
        
        <div className="pricing-price-row">
          {displayPrice === null ? (
            <span className="pricing-custom-price">Let&apos;s talk</span>
          ) : (
            <>
              <span className="pricing-currency">$</span>
              <span className="pricing-price">{displayPrice}</span>
            </>
          )}
          <span className="pricing-price-suffix">{plan.suffix}</span>
        </div>

        {/* Savings Badge */}
        {savings > 0 && (
          <span className="pricing-savings">
            Save {savings}% with annual billing
          </span>
        )}
      </div>

      <div className="pricing-plan-divider" />

      {/* Feature Bullet Points */}
      <div className="pricing-feature-heading">
        <span>Includes</span>
        <Icon size={14} />
      </div>
      <ul className="pricing-feature-list">
        {plan.features.map((feature) => (
          <li key={feature}>
            <Check size={15} strokeWidth={2.6} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button className="pricing-plan-button" type="button" onClick={() => onChoose(plan)}>
        {plan.cta}
        <ArrowRight size={16} />
      </button>
    </article>
  );
}

/* ==========================================================================
   3. MAIN PRICING COMPONENT
   ========================================================================== */
export default function Pricing() {
<<<<<<< Updated upstream
  // This page answers to two routes: /pricing, reached from the landing page,
  // and /subscription, reached from the workspace sidebar. "Back" has to
  // return to whichever one the visitor actually arrived from -- sending a
  // signed-in user to the marketing page would drop them out of the app.
  const pathname = usePathname();
  const cameFromWorkspace = pathname === "/subscription";
  const backHref = cameFromWorkspace ? "/dashboard" : "/";
  const backLabel = cameFromWorkspace ? "Back to dashboard" : "Back to DocuMend";

  // Billing cycle state: true for annual (discounted), false for monthly
  const [isAnnual, setIsAnnual] = useState(true);
  
  // Temporary toast notification message state
  const [toast, setToast] = useState("");
=======
  // Page Local State
  const [isAnnual, setIsAnnual] = useState(true); // Toggle between annual (true) and monthly (false)
  const [toast, setToast] = useState("");         // Feedback toast message
>>>>>>> Stashed changes

  // Workspace Chrome Shell States
  const [activeNav, setActiveNav] = useState('Subscription'); // Active sidebar link
  const [privacyMode, setPrivacyMode] = useState(true);       // Privacy mode toggle
  const [darkMode, setDarkMode] = useState(false);             // Dark mode toggle
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Collapsed sidebar state
  const [mobileSidebar, setMobileSidebar] = useState(false);       // Mobile drawer open state
  const [modal, setModal] = useState(null);                   // Dialog modal state ('logout', etc.)
  const [search, setSearch] = useState('');                   // Workspace search query

  // Displays a self-dismissing toast notification
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  // Handles sidebar link navigation
  const selectNav = (label) => {
    const route = workspaceRoutes?.[label];
    if (route && label !== 'Subscription' && label !== 'Pricing') {
      navigate(route);
      return;
    }
    // Direct fallbacks for common routes
    if (label === 'Dashboard') {
      navigate('/dashboard');
      return;
    }
    if (label === 'Editor') {
      navigate('/editor');
      return;
    }
    if (label === 'Version history') {
      navigate('/version');
      return;
    }

    setActiveNav(label);
    if (label !== 'Subscription' && label !== 'Pricing') notify(`${label} view selected`);
    setMobileSidebar(false);
  };

  // Handles user logout confirmation
  const handleLogout = () => {
    setModal(null);
    navigate('/');
  };

  // Handles action when a user clicks a plan CTA button
  const handleChoose = (plan) => {
    if (plan.id === "starter") {
      notify("Starter is ready when you are. Your first document is waiting.");
      navigate('/editor'); // Route directly to the editor for free tier
      return;
    }
    if (plan.id === "pro") {
      notify(`Pro selected — ${isAnnual ? "$10/month, billed annually" : "$14/month"} looks good on you.`);
      return;
    }
    notify("Our team has been notified. We’ll bring the quiet, careful details.");
  };

  return (
    <div className={`dash-shell ${darkMode ? 'dash-dark' : ''}`}>
      {/* -------------------------------------------------------------------- */}
      {/* MOBILE TOPBAR & SIDEBAR SHELL                                        */}
      {/* -------------------------------------------------------------------- */}
      <MobileTopbar
        onMenu={() => setMobileSidebar(true)}
        onThemeToggle={() => setDarkMode((current) => !current)}
        darkMode={darkMode}
      />

<<<<<<< Updated upstream
      {/* ========================================================= */}
      {/* 1. TOP HEADER NAVIGATION                                  */}
      {/* ========================================================= */}
      <header className="pricing-header">
        <button
          className="pricing-back"
          type="button"
          onClick={() => navigate(backHref)}
        >
          <ArrowLeft size={15} />
          {backLabel}
        </button>
        <div className="pricing-wordmark" aria-label="DocuMend">
          <BrandMark />
          <span>Docu<span>Mend</span></span>
        </div>
        <span className="pricing-header-note">
          <LockKeyhole size={13} />
          Private by default
        </span>
      </header>
=======
      <Sidebar
        activeNav={activeNav}
        onNavigate={selectNav}
        privacyMode={privacyMode}
        onPrivacyToggle={() => {
          setPrivacyMode((current) => !current);
          notify(`Privacy mode ${privacyMode ? 'paused' : 'enabled'}`);
        }}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode((current) => !current)}
        onLogout={() => setModal('logout')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />
>>>>>>> Stashed changes

      <MobileDrawer
        open={mobileSidebar}
        onClose={() => setMobileSidebar(false)}
        activeNav={activeNav}
        onNavigate={selectNav}
        onPrivacyToggle={() => setPrivacyMode((current) => !current)}
        onLogout={() => setModal('logout')}
      />

      {/* -------------------------------------------------------------------- */}
      {/* MAIN PRICING CONTENT CONTAINER                                       */}
      {/* -------------------------------------------------------------------- */}
      <main className={`dash-main ${sidebarCollapsed ? 'is-wide' : ''}`}>
        {/* Workspace Search Header */}
        <WorkspaceHeader 
          search={search} 
          onSearchChange={setSearch} 
          onAnnounce={notify} 
        />

        <div className="pricing-shell">
          {/* Ambient Background Orbs */}
          <div className="pricing-orb pricing-orb-one" aria-hidden="true" />
          <div className="pricing-orb pricing-orb-two" aria-hidden="true" />

          {/* Top Return Header */}
          <header className="pricing-header">
            <button
              className="pricing-back"
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={15} />
              Back to Dashboard
            </button>
            <div className="pricing-wordmark" aria-label="DocuMend">
              <BrandMark />
              <span>Docu<span>Mend</span></span>
            </div>
            <span className="pricing-header-note">
              <LockKeyhole size={13} />
              Private by default
            </span>
          </header>

          {/* Hero Section */}
          <section className="pricing-intro" aria-labelledby="pricing-title">
            <div className="pricing-kicker">
              <span className="pricing-kicker-rule" />
              Simple plans for serious words
              <span className="pricing-kicker-rule" />
            </div>
            <h1 id="pricing-title">
              Put the <em>good</em> back in your drafts.
            </h1>
            <p>
              DocuMend quietly repairs the structure, references, and small distractions
              that get between your thinking and the page.
            </p>
            <RepairIllustration />
          </section>

          {/* Billing Frequency Switcher (Monthly / Annual) */}
          <section className="pricing-controls" aria-label="Billing frequency">
            <div className="pricing-billing-copy">
              <span className="pricing-billing-label">Choose your pace</span>
              <span className="pricing-billing-detail">Change anytime. No vanishing footnotes.</span>
            </div>
            <div className="pricing-billing-toggle" role="group" aria-label="Choose monthly or annual billing">
              <button
                className={!isAnnual ? "pricing-billing-active" : ""}
                type="button"
                aria-pressed={!isAnnual}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={isAnnual ? "pricing-billing-active" : ""}
                type="button"
                aria-pressed={isAnnual}
                onClick={() => setIsAnnual(true)}
              >
                Annual
                <span>Save 29%</span>
              </button>
            </div>
          </section>

          {/* Pricing Cards Grid */}
          <section className="pricing-plans" aria-label="DocuMend plans">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isAnnual={isAnnual} onChoose={handleChoose} />
            ))}
          </section>

          {/* Baseline Features Included in All Plans */}
          <section className="pricing-every-plan" aria-label="Included with every plan">
            <div className="pricing-every-plan-title">
              <span className="pricing-mini-mark"><Zap size={14} /></span>
              <div>
                <p>Every plan includes</p>
                <strong>The calm parts are standard.</strong>
              </div>
            </div>
            <div className="pricing-every-plan-items">
              <span><CheckCircle2 size={15} /> Works offline</span>
              <span><CheckCircle2 size={15} /> No training on your writing</span>
              <span><CheckCircle2 size={15} /> Human-readable exports</span>
            </div>
          </section>

          {/* Testimonial & Local-First Promise Grid */}
          <section className="pricing-lower-grid" aria-label="Why writers choose DocuMend">
            <article className="pricing-reassurance">
              <span className="pricing-reassurance-label">A note from the careful corner</span>
              <div className="pricing-quote-mark"><Quote size={19} /></div>
              <blockquote>
                “It feels less like an AI tool and more like the colleague who catches
                the missing reference before your supervisor does.”
              </blockquote>
              <div className="pricing-quote-author">
                <span className="pricing-avatar">NC</span>
                <span><strong>Nadia Chen</strong><small>PhD candidate, computational law</small></span>
              </div>
              <div className="pricing-trust-bits">
                <span><LockKeyhole size={14} /> Your files stay on your device</span>
                <span><UsersRound size={14} /> Trusted by 12,400 careful writers</span>
                <button type="button" onClick={() => notify("All plans come with a 14-day, no-pressure trial.")}>
                  <Minus size={14} />
                  14-day trial, no card
                </button>
              </div>
            </article>

            <aside className="pricing-promise-card" aria-label="DocuMend privacy promise">
              <div className="pricing-promise-orbit pricing-promise-orbit-one" aria-hidden="true" />
              <div className="pricing-promise-orbit pricing-promise-orbit-two" aria-hidden="true" />
              <div className="pricing-promise-meta">
                <span>DOCUMEND / 001</span>
                <span><CheckCircle2 size={12} /> VERIFIED</span>
              </div>
              <div className="pricing-promise-icon"><LockKeyhole size={22} /></div>
              <p className="pricing-promise-kicker">The DocuMend promise</p>
              <h2>Your words stay <em>yours.</em></h2>
              <p className="pricing-promise-copy">
                Private by design, thoughtful by default. Your documents are never
                used to train a model.
              </p>
              <div className="pricing-promise-signature">
                <span />
                <strong>Local-first editing</strong>
                <small>signed with care</small>
              </div>
            </aside>
          </section>

          {/* Page Footer */}
          <footer className="pricing-footer">
            <span><span className="pricing-footer-dot" /> DocuMend · A more considered way to write.</span>
            <button type="button" onClick={() => notify("The full comparison is coming into focus.")}>
              Compare all features <ArrowRight size={14} />
            </button>
          </footer>
        </div>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* WORKSPACE DIALOG MODAL (LOGOUT, ETC.)                                */}
      {/* -------------------------------------------------------------------- */}
      <WorkspaceModal
        mode={modal}
        onClose={() => setModal(null)}
        onSubmit={() => setModal(null)}
        onLogout={handleLogout}
      />

      {/* -------------------------------------------------------------------- */}
      {/* TOAST NOTIFICATION CONTAINER                                         */}
      {/* -------------------------------------------------------------------- */}
      {toast && (
        <div className="pricing-toast" role="status" aria-live="polite">
          <span className="pricing-toast-icon"><Check size={14} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}