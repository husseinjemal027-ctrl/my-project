import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'am', label: 'አማርኛ' },
  { value: 'om', label: 'Afaan Oromoo' },
];

export default function Header({ language, onLanguageChange, user, onSignOut, t }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    if (!location.hash) return undefined;

    const targetId = decodeURIComponent(location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className={menuOpen ? 'topbar menu-open' : 'topbar'}>
      <NavLink className="brand" onClick={closeMenu} to="/" aria-label="Muslim Islamic Center home">
        <span className="brand-mark">
          <svg aria-hidden="true" className="brand-mosque-icon" viewBox="0 0 32 32" fill="none">
            <path d="M20.8 4.7a11.8 11.8 0 1 0 6.5 19.6A10.2 10.2 0 0 1 20.8 4.7Z" fill="currentColor" />
            <path d="m25.5 7 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" fill="currentColor" />
          </svg>
        </span>
        <span className="brand-name">Muslim <span>Islamic Center</span></span>
      </NavLink>
      <button
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        aria-controls="main-site-navigation"
        className="menu-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        <span className="menu-toggle-icon" aria-hidden="true"><span /><span /><span /></span>
        <span>{menuOpen ? 'Close' : 'Menu'}</span>
      </button>
      <nav className={menuOpen ? 'main-nav open' : 'main-nav'} id="main-site-navigation" aria-label="Main navigation">
        <div className="main-nav-links">
          <NavLink end onClick={closeMenu} to="/">Home</NavLink>
          <NavLink onClick={closeMenu} to="/about">About Us</NavLink>
          <NavLink onClick={closeMenu} to="/library">Islamic Resources</NavLink>
          <Link onClick={closeMenu} to="/#services" aria-current={location.hash === '#services' ? 'location' : undefined}>Programs</Link>
          <Link onClick={closeMenu} to="/#prayer-times" aria-current={location.hash === '#prayer-times' ? 'location' : undefined}>Prayer Times</Link>
          <Link onClick={closeMenu} to="/#projects" aria-current={location.hash === '#projects' ? 'location' : undefined}>Projects</Link>
          <Link onClick={closeMenu} to="/#events" aria-current={location.hash === '#events' ? 'location' : undefined}>Events</Link>
          <NavLink onClick={closeMenu} to="/contact">Contact Us</NavLink>
          {user && <NavLink onClick={closeMenu} to="/dashboard">Dashboard</NavLink>}
        </div>
      </nav>
      <div className="topbar-actions">
        {user
          ? <>
          <span className="signed-in">{t('signedIn')}: <strong>{user.name}</strong></span>
          <button className="button button-quiet" onClick={() => { closeMenu(); onSignOut(); }} type="button">{t('signOut')}</button>
          </>
          : <>
            <NavLink className="header-login" onClick={closeMenu} to="/login">Login</NavLink>
            <NavLink className="button button-primary header-register" onClick={closeMenu} to="/register">Join</NavLink>
          </>}
        <label className="language-control">
          <span className="sr-only">Language</span>
          <select aria-label="Language" onChange={(event) => onLanguageChange(event.target.value)} value={language}>
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
