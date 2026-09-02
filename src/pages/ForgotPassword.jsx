/**
 * ForgotPassword — password reset request, served at `/forgot-password`.
 *
 * Reached from the "Forgot password?" link on the login page. It wears the
 * same two-column auth card as LogIn and SignUp (dark story side, paper form
 * side) rather than the workspace chrome, because the reader is not signed in
 * yet.
 *
 * There is no backend, so the send is simulated: the form validates the
 * address, shows a brief sending state, then moves to a confirmation. The
 * confirmation deliberately does not claim the address is registered --
 * saying "if that address has an account" is both the honest wording and the
 * standard one, since confirming which emails exist leaks accounts to anyone
 * who cares to ask.
 *
 * Wire the real request in `requestReset` when there is an API.
 */
import { useEffect, useRef, useState } from 'react';
import './forgot-password.css';
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { navigate } from '../router';

// Deliberately loose: enough to catch a typo, not enough to reject a valid
// but unusual address. The server is the only thing that can really tell.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// How long the resend button stays disabled, in seconds.
const RESEND_COOLDOWN = 30;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [stage, setStage] = useState('idle'); // idle | sending | sent
  const [cooldown, setCooldown] = useState(0);
  const timers = useRef([]);

  // Any timer still pending when the reader navigates away would call
  // setState on an unmounted component.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  // Ticks the resend cooldown down to zero.
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = window.setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const requestReset = (event) => {
    event.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setError('Enter the email address you signed up with.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError('That does not look like an email address.');
      return;
    }

    setError('');
    setStage('sending');

    // Stand-in for the real request.
    const id = window.setTimeout(() => {
      setStage('sent');
      setCooldown(RESEND_COOLDOWN);
    }, 900);
    timers.current.push(id);
  };

  const resend = () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN);
  };

  return (
    <main className="reset-shell">
      <section className="reset-card" aria-label="Reset your DocuMend password">
        {/* ---------------------------------------------------------------- */}
        {/* Story side                                                        */}
        {/* ---------------------------------------------------------------- */}
        <div className="reset-story">
          <BrandMark size={30} className="reset-brand" />

          <div className="reset-story-copy">
            <p className="reset-kicker">
              <LockKeyhole size={13} />
              Account recovery
            </p>
            <h1>A locked door, not a lost room.</h1>
            <p className="reset-story-text">
              Your drafts are exactly where you left them. Reset the key and
              walk straight back in.
            </p>
          </div>

          <ul className="reset-assurances">
            <li><ShieldCheck size={15} /> The link expires in 30 minutes.</li>
            <li><LockKeyhole size={15} /> Your documents stay encrypted throughout.</li>
            <li><MailCheck size={15} /> One link at a time — older ones stop working.</li>
          </ul>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Form side                                                         */}
        {/* ---------------------------------------------------------------- */}
        <div className="reset-form-side">
          <button className="reset-back" type="button" onClick={() => navigate('/login')}>
            <ArrowLeft size={15} />
            Back to log in
          </button>

          {stage === 'sent' ? (
            <div className="reset-done">
              <span className="reset-done-icon"><MailCheck size={26} strokeWidth={1.6} /></span>
              <h2>Check your inbox</h2>
              <p className="reset-done-text">
                If <strong>{email.trim()}</strong> has an account, a reset link
                is on its way. It may take a minute to arrive, and it is worth
                checking your spam folder.
              </p>

              <div className="reset-done-actions">
                <button type="button" className="reset-primary" onClick={() => navigate('/login')}>
                  Back to log in <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  className="reset-quiet"
                  onClick={resend}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend the link'}
                </button>
              </div>

              <button
                type="button"
                className="reset-text-link"
                onClick={() => {
                  setStage('idle');
                  setCooldown(0);
                }}
              >
                Use a different email address
              </button>
            </div>
          ) : (
            <>
              <div className="reset-heading">
                <h2>Forgot your password?</h2>
                <p>
                  Give us the address you signed up with and we will send you a
                  link to set a new one.
                </p>
              </div>

              <form className="reset-form" onSubmit={requestReset} noValidate>
                <label className="reset-label" htmlFor="reset-email">Email address</label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  placeholder="you@university.edu"
                  className={`reset-input ${error ? 'is-invalid' : ''}`}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'reset-email-error' : undefined}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError('');
                  }}
                />
                {error && <p className="reset-error" id="reset-email-error" role="alert">{error}</p>}

                <button type="submit" className="reset-primary" disabled={stage === 'sending'}>
                  {stage === 'sending' ? 'Sending…' : (
                    <>Send reset link <ArrowRight size={15} /></>
                  )}
                </button>
              </form>

              <p className="reset-footnote">
                Remembered it after all?{' '}
                <button type="button" className="reset-text-link" onClick={() => navigate('/login')}>
                  Log in
                </button>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
