import { NavLink } from 'react-router-dom';
import Header from './Header.jsx';

export default function Layout({ children, language, onLanguageChange, user, onSignOut, t, className = 'app-shell' }) {
  return (
    <div className={className}>
      <Header
        language={language}
        onLanguageChange={onLanguageChange}
        onSignOut={onSignOut}
        t={t}
        user={user}
      />
      <main>{children}</main>
      <footer className="footer">
        <NavLink className="brand footer-brand" to="/" aria-label="Muslim Islamic Center home">
          <span className="brand-mark">
            <svg aria-hidden="true" className="brand-mosque-icon" viewBox="0 0 32 32" fill="none">
              <path d="M20.8 4.7a11.8 11.8 0 1 0 6.5 19.6A10.2 10.2 0 0 1 20.8 4.7Z" fill="currentColor" />
              <path d="m25.5 7 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" fill="currentColor" />
            </svg>
          </span>
          <span className="brand-name">Muslim <span>Islamic Center</span></span>
        </NavLink>
        <p className="footer-message">A welcoming place for faith, learning, and community.</p>
        <nav className="footer-nav" aria-label="Footer navigation">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/library">Islamic Resources</NavLink>
          <NavLink to="/#community">Community</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        <span>© {new Date().getFullYear()} Muslim Islamic Center</span>
      </footer>
    </div>
  );
}
