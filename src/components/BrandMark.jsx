/**
 * BrandMark — the DocuMend logo. One definition, used everywhere.
 *
 * The project had drifted into six versions of this: a geometric diamond on
 * the landing page, a plain rounded tile in the workspace sidebar, a key on
 * the password reset screen, and near-identical dog-eared tiles at 29px, 30px
 * and 31px on pricing, version history, login and sign-up.
 *
 * The dog-eared tile won because it was already the majority and because the
 * asymmetric corner means something: `border-radius: 9px 9px 9px 3px` reads
 * as a turned page, which is the right idea for a document editor. A generic
 * rounded square is not a logo.
 *
 * The tile is always gold with a forest icon -- that pairing is the brand and
 * does not change. The wordmark inherits `currentColor` so it works on the
 * dark story panels and the light headers alike; only "Mend" is pinned, to
 * gold.
 *
 * Props:
 *   size      tile edge in px (the icon scales with it). Default 30.
 *   wordmark  set false for the collapsed sidebar, which shows the tile alone
 *   tagline   optional line under the wordmark, e.g. "write with clarity"
 *   className extra classes for the wrapper
 */
import './brand-mark.css';
import { FileText } from 'lucide-react';

export function BrandMark({ size = 30, wordmark = true, tagline = null, className = '' }) {
  return (
    <span className={`brand ${className}`} aria-label="DocuMend">
      <span
        className="brand-tile"
        aria-hidden="true"
        style={{ width: size, height: size, borderRadius: `${size * 0.3}px ${size * 0.3}px ${size * 0.3}px ${size * 0.1}px` }}
      >
        {/* The icon reads best at a little over half the tile. */}
        <FileText size={Math.round(size * 0.57)} strokeWidth={2.3} />
      </span>

      {wordmark && (
        <span className="brand-copy">
          <span className="brand-word">Docu<em>Mend</em></span>
          {tagline && <span className="brand-tagline">{tagline}</span>}
        </span>
      )}
    </span>
  );
}

export default BrandMark;
