import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthPanel from '../components/auth/AuthPanel.jsx';
import ContentGrid from '../components/content/ContentGrid.jsx';
import EmptyState from '../components/content/EmptyState.jsx';
import FilterBar from '../components/filters/FilterBar.jsx';
import Layout from '../components/layout/Layout.jsx';
import UploadForm from '../components/upload/UploadForm.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../hooks/AuthContext.jsx';
import useContents from '../hooks/useContents.js';
import useLanguage from '../hooks/useLanguage.js';
import { deleteContent } from '../services/contentService.js';

const validCategories = new Set(['all', 'quran', 'book', 'audio', 'video', 'dhikr']);

export default function LibraryPage() {
  const { user, setUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const contents = useContents();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [logoutError, setLogoutError] = useState('');
  const [logoutBusy, setLogoutBusy] = useState(false);

  useEffect(() => {
    const initialCategory = searchParams.get('category');
    if (initialCategory && validCategories.has(initialCategory)) contents.chooseCategory(initialCategory);
    // Apply only the category present on entry; subsequent selections are handled by the filter bar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSignOut() {
    setLogoutBusy(true);
    setLogoutError('');
    try {
      await logout();
    } catch (error) {
      setLogoutError(error.message);
    } finally {
      setLogoutBusy(false);
    }
  }

  async function onDelete(item) {
    const title = item.titles?.[language] || item.title;
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteContent(item._id);
      if (contents.items.length === 1 && contents.page > 1) contents.setPage(contents.page - 1);
      else contents.refresh();
    } catch (error) {
      contents.setError(error.message);
    }
  }

  async function onSaved() {
    setShowForm(false);
    setEditItem(null);
    contents.refresh();
  }

  function openForm(item = null) {
    setEditItem(item);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function changeCategory(category) {
    contents.chooseCategory(category);
    const next = new URLSearchParams(searchParams);
    if (category === 'all') next.delete('category');
    else next.set('category', category);
    setSearchParams(next, { replace: true });
  }

  return (
    <Layout className="app-shell interior-shell library-shell" language={language} onLanguageChange={setLanguage} onSignOut={onSignOut} t={t} user={logoutBusy ? null : user}>
      <section className="page-intro">
        <span className="eyebrow">DISCOVER AND SHARE</span>
        <h1>{t('library')}</h1>
        <p>Explore Quran, books, audio, video, and Dhikr resources shared by the community.</p>
      </section>

      <section className="workspace library-workspace">
        <div className="workspace-main">
          <div className="section-heading">
            <div><span className="eyebrow">RESOURCE COLLECTION</span><h2>Browse resources</h2></div>
            {user
              ? <Button onClick={() => openForm()}><span className="plus-sign">+</span>{t('addContent')}</Button>
              : (
                <div className="upload-access-actions">
                  <Button as={Link} state={{ from: { pathname: '/library' } }} to="/login">Sign in to upload</Button>
                  <Button as={Link} state={{ from: { pathname: '/library' } }} to="/register" variant="quiet">Create account</Button>
                </div>
              )}
          </div>
          {!user && (
            <div className="upload-access-notice" role="note">
              <strong>Want to share a resource?</strong>
              <span>Sign in or create an account first. After signing in, click <b>Add content</b>, choose a category, then select your file or paste a link.</span>
            </div>
          )}

          {(contents.error || logoutError) && (
            <div className="notice" role="alert">
              <span>{contents.error || logoutError}</span>
              {contents.error && (
                <button className="button button-quiet retry-button" onClick={contents.refresh} type="button">Retry</button>
              )}
              <button className="notice-close" onClick={() => { contents.setError(''); setLogoutError(''); }} type="button" aria-label="Dismiss">×</button>
            </div>
          )}

          {showForm && user && (
            <UploadForm
              item={editItem}
              language={language}
              onCancel={() => { setShowForm(false); setEditItem(null); }}
              onSaved={onSaved}
              t={t}
            />
          )}

          <FilterBar
            category={contents.category}
            onCategoryChange={changeCategory}
            onSearchChange={contents.changeSearch}
            search={contents.search}
            t={t}
          />

          {contents.loading
            ? <div className="skeleton-grid" aria-label="Loading resources"><div /><div /><div /></div>
            : contents.items.length
              ? (
                <>
                  <ContentGrid
                    items={contents.items}
                    language={language}
                    onDelete={onDelete}
                    onEdit={openForm}
                    t={t}
                    user={user}
                  />
                  <div className="pagination">
                    <span>{contents.pagination.totalItems} resources</span>
                    <div className="pagination-actions">
                      <Button disabled={contents.page <= 1} onClick={() => contents.setPage(contents.page - 1)} variant="quiet" type="button">← Previous</Button>
                      <span className="page-count">{contents.page} / {Math.max(contents.pagination.totalPages, 1)}</span>
                      <Button disabled={contents.page >= contents.pagination.totalPages} onClick={() => contents.setPage(contents.page + 1)} variant="quiet" type="button">Next →</Button>
                    </div>
                  </div>
                </>
              )
              : !contents.error && <EmptyState onAdd={user ? () => openForm() : null} t={t} />}
        </div>

        <aside className="workspace-aside">
          {!user
            ? <AuthPanel onAuthenticated={setUser} t={t} />
            : (
              <section className="profile-card">
                <span className="eyebrow">YOUR ACCOUNT</span>
                <div className="profile-avatar">{(user.name || 'U').slice(0, 1).toUpperCase()}</div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <div className="profile-status"><span className="status-dot" /> Session active</div>
                <div className="profile-tip"><span className="tip-mark">i</span><p>You can edit or remove entries you created.</p></div>
              </section>
            )}
          <section className="help-card">
            <span className="help-icon">✦</span>
            <h3>Share knowledge</h3>
            <p>Sign in, choose Add content, select Book, Audio, or Video, then upload a file or paste a link. Add a cover image if you like.</p>
          </section>
        </aside>
      </section>
    </Layout>
  );
}
