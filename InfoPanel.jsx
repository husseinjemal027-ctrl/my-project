import { useState } from 'react';

export default function InfoPanel({ t }) {
  const [open, setOpen] = useState(true);
  return (
    <aside className="info-panel">
      <button aria-expanded={open} className="info-heading" onClick={() => setOpen((value) => !value)} type="button">
        <span className="info-symbol">!</span>
        <strong>{t('important')}</strong>
        <span className="info-toggle">{open ? '−' : '+'}</span>
      </button>
      {open && <p>{t('importantText')}</p>}
    </aside>
  );
}
