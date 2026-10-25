import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import useLanguage from '../hooks/useLanguage.js';
import { useAuth } from '../hooks/AuthContext.jsx';

export default function NotFoundPage() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  async function signOut() { try { await logout(); } catch (error) { console.error('Logout failed:', error.message); } }
  return (
    <Layout language={language} onLanguageChange={setLanguage} onSignOut={signOut} t={t} user={user}>
      <section className="not-found">
        <span className="eyebrow">404 · PAGE NOT FOUND</span>
        <h1>This page isn’t in the library.</h1>
        <p>The address may be incorrect, or the page may have moved.</p>
        <Link className="button button-primary" to="/">Return home</Link>
      </section>
    </Layout>
  );
}
