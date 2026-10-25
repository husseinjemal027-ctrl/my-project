import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthPanel from '../components/auth/AuthPanel.jsx';
import ContentGrid from '../components/content/ContentGrid.jsx';
import EmptyState from '../components/content/EmptyState.jsx';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/AuthContext.jsx';
import useLanguage from '../hooks/useLanguage.js';
import { getMyContents } from '../services/contentService.js';

const PAGE_SIZE = 6;

export default function DashboardPage() {
  const { user, loading: authLoading, logout, setUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalItems: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    setLoading(true);
    setError('');
    getMyContents({ page, limit: PAGE_SIZE })
      .then((response) => {
        if (!active) return;
        setItems(response.data.items || []);
        setPagination(response.data.pagination || { page, totalItems: 0, totalPages: 0 });
      })
      .catch((requestError) => {
        if (!active) return;
        setItems([]);
        setError(requestError.message || 'Unable to load your resources.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, refreshVersion, user]);

  async function onSignOut() {
    setLogoutError('');
    try {
      await logout();
      setPage(1);
    } catch (requestError) {
      setLogoutError(requestError.message || 'Unable to sign out.');
    }
  }

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : '';

  return (
    <Layout
      className="app-shell interior-shell dashboard-shell"
      language={language}
      onLanguageChange={setLanguage}
      onSignOut={onSignOut}
      t={t}
      user={user}
    >
      <section className="page-intro">
        <span className="eyebrow">YOUR COMMUNITY SPACE</span>
        <h1>Dashboard</h1>
        <p>View your account and keep track of the Islamic resources you have shared.</p>
      </section>

      {logoutError && <div className="notice" role="alert">{logoutError}</div>}

      {authLoading
        ? <div className="dashboard-loading" role="status">Checking your account…</div>
        : !user
          ? (
            <section className="dashboard-sign-in">
              <div>
                <span className="eyebrow">SIGN IN TO CONTINUE</span>
                <h2>Your dashboard is waiting</h2>
                <p>Sign in or create an account to view the resources you have shared.</p>
              </div>
              <AuthPanel onAuthenticated={setUser} t={t} />
            </section>
          )
          : (
            <section className="dashboard-workspace">
              <div className="dashboard-main">
                <div className="dashboard-welcome">
                  <div>
                    <span className="eyebrow">WELCOME BACK</span>
                    <h2>{user.name}</h2>
                    <p>Your contributions help make learning resources easier to discover.</p>
                  </div>
                  <Button as={Link} to="/library">Browse resources</Button>
                </div>

                <div className="dashboard-stat-grid">
                  <article className="dashboard-stat-card">
                    <span className="eyebrow">YOUR CONTRIBUTIONS</span>
                    <strong>{pagination.totalItems}</strong>
                    <span>resources shared</span>
                  </article>
                  <article className="dashboard-stat-card">
                    <span className="eyebrow">ACCOUNT TYPE</span>
                    <strong>{user.role === 'admin' ? 'Admin' : 'Member'}</strong>
                    <span>{user.role === 'admin' ? 'Community administrator' : 'Community member'}</span>
                  </article>
                </div>

                <div className="dashboard-section-heading">
                  <div>
                    <span className="eyebrow">YOUR LIBRARY</span>
                    <h2>Recently shared resources</h2>
                  </div>
                  <Button as={Link} to="/library" variant="quiet">Manage resources</Button>
                </div>

                {error && (
                  <div className="notice" role="alert">
                    <span>{error}</span>
                    <button className="button button-quiet retry-button" onClick={() => setRefreshVersion((version) => version + 1)} type="button">Retry</button>
                  </div>
                )}

                {loading
                  ? <div className="skeleton-grid" aria-label="Loading your resources"><div /><div /><div /></div>
                  : items.length
                    ? (
                      <>
                        <ContentGrid allowManage={false} items={items} language={language} t={t} user={user} />
                        <div className="pagination">
                          <span>{pagination.totalItems} resources</span>
                          <div className="pagination-actions">
                            <Button disabled={page <= 1} onClick={() => setPage(page - 1)} type="button" variant="quiet">← Previous</Button>
                            <span className="page-count">{page} / {Math.max(pagination.totalPages, 1)}</span>
                            <Button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} type="button" variant="quiet">Next →</Button>
                          </div>
                        </div>
                      </>
                    )
                    : !error && <EmptyState message="You have not shared any resources yet." onAdd={() => navigate('/library')} t={t} />}
              </div>

              <aside className="workspace-aside">
                <section className="profile-card">
                  <span className="eyebrow">ACCOUNT DETAILS</span>
                  <div className="profile-avatar">{(user.name || 'U').slice(0, 1).toUpperCase()}</div>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <div className="profile-status"><span className="status-dot" /> Session active</div>
                  {joinedDate && <p className="dashboard-joined">Member since {joinedDate}</p>}
                </section>
                <section className="help-card">
                  <span className="help-icon" aria-hidden="true">✦</span>
                  <h3>Share knowledge</h3>
                  <p>Upload a book, audio, video, or other learning resource for the community.</p>
                  <Button as={Link} to="/library">Go to resources</Button>
                </section>
              </aside>
            </section>
          )}
    </Layout>
  );
}
