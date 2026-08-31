import { useState } from "react";
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
import "./pricing.css";

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
    recommended: true,
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
    price: { monthly: null, annual: null },
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

function BrandMark() {
  return (
    <span className="pricing-brand-mark" aria-hidden="true">
      <FileText size={18} strokeWidth={2.35} />
    </span>
  );
}

function RepairIllustration() {
  return (
    <svg
      className="pricing-illustration"
      viewBox="0 0 470 185"
      role="img"
      aria-label="A document being gently repaired"
    >
      <path
        className="pricing-illustration-line"
        d="M12 151c44-28 57-97 113-108 57-12 79 48 134 49 58 1 72-49 144-30"
      />
      <g transform="translate(62 28) rotate(-6 80 65)">
        <rect className="pricing-paper" width="164" height="123" rx="11" />
        <path className="pricing-paper-fold" d="M131 0h22a11 11 0 0 1 11 11v20z" />
        <rect x="19" y="22" width="83" height="9" rx="4.5" fill="#e8992e" />
        <rect x="19" y="47" width="123" height="6" rx="3" fill="#c0d2c6" />
        <rect x="19" y="63" width="104" height="6" rx="3" fill="#c0d2c6" />
        <rect x="19" y="79" width="122" height="6" rx="3" fill="#c0d2c6" />
        <rect x="19" y="99" width="61" height="8" rx="4" fill="#de6a50" opacity=".85" />
      </g>
      <g transform="translate(287 28) rotate(8)">
        <rect width="122" height="92" rx="10" fill="#f0bd5c" />
        <rect x="16" y="18" width="63" height="7" rx="3.5" fill="#fff6de" />
        <rect x="16" y="38" width="88" height="5" rx="2.5" fill="#fff6de" opacity=".83" />
        <rect x="16" y="52" width="71" height="5" rx="2.5" fill="#fff6de" opacity=".83" />
        <circle cx="96" cy="73" r="11" fill="#21483e" />
        <path d="m90 73 4 5 9-10" fill="none" stroke="#f0bd5c" strokeWidth="2.6" />
      </g>
      <path className="pricing-pencil" d="m211 130 29-48 13 8-29 48-18 7z" />
      <path className="pricing-pencil-tip" d="m211 130 13 8-18 7z" />
      <circle className="pricing-sparkle sparkle-one" cx="392" cy="20" r="4" />
      <circle className="pricing-sparkle sparkle-two" cx="31" cy="62" r="3" />
      <path className="pricing-star" d="m438 132 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
    </svg>
  );
}

function PlanIcon({ icon: Icon }) {
  return (
    <span className="pricing-plan-icon" aria-hidden="true">
      <Icon size={19} strokeWidth={2.1} />
    </span>
  );
}

function PlanCard({ plan, isAnnual, onChoose }) {
  const Icon = plan.icon;
  const displayPrice = isAnnual ? plan.price.annual : plan.price.monthly;
  const savings = plan.price.monthly && isAnnual ? Math.round((1 - plan.price.annual / plan.price.monthly) * 100) : 0;

  return (
    <article className={`pricing-plan pricing-plan-${plan.tone}`}>
      {plan.recommended && (
        <div className="pricing-recommended">
          <Sparkles size={13} />
          Most loved by researchers
        </div>
      )}
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
        {savings > 0 && (
          <span className="pricing-savings">
            Save {savings}% with annual billing
          </span>
        )}
      </div>
      <div className="pricing-plan-divider" />
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
      <button className="pricing-plan-button" type="button" onClick={() => onChoose(plan)}>
        {plan.cta}
        <ArrowRight size={16} />
      </button>
    </article>
  );
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [toast, setToast] = useState("");

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const handleChoose = (plan) => {
    if (plan.id === "starter") {
      notify("Starter is ready when you are. Your first document is waiting.");
      return;
    }
    if (plan.id === "pro") {
      notify(`Pro selected — ${isAnnual ? "$10/month, billed annually" : "$14/month"} looks good on you.`);
      return;
    }
    notify("Our team has been notified. We’ll bring the quiet, careful details.");
  };

  return (
    <main className="pricing-shell">
      <div className="pricing-orb pricing-orb-one" aria-hidden="true" />
      <div className="pricing-orb pricing-orb-two" aria-hidden="true" />
      <header className="pricing-header">
        <button
          className="pricing-back"
          type="button"
          onClick={() => notify("You’re still in the right place. Plans are just ahead.")}
        >
          <ArrowLeft size={15} />
          Back to DocuMend
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

      <section className="pricing-plans" aria-label="DocuMend plans">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} isAnnual={isAnnual} onChoose={handleChoose} />
        ))}
      </section>

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

      <footer className="pricing-footer">
        <span><span className="pricing-footer-dot" /> DocuMend · A more considered way to write.</span>
        <button type="button" onClick={() => notify("The full comparison is coming into focus.")}>
          Compare all features <ArrowRight size={14} />
        </button>
      </footer>

      {toast && (
        <div className="pricing-toast" role="status" aria-live="polite">
          <span className="pricing-toast-icon"><Check size={14} /></span>
          {toast}
        </div>
      )}
    </main>
  );
}