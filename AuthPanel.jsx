import { useState } from 'react';
import { loginUser, registerUser } from '../../services/contentService.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';

export default function AuthPanel({ onAuthenticated, t }) {
  const [mode, setMode] = useState('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = mode === 'register'
        ? await registerUser({ name: `${firstName.trim()} ${lastName.trim()}`, email, password })
        : await loginUser({ email, password });
      onAuthenticated(response.data.user);
    } catch (requestError) {
      setError(requestError.message || 'Unable to authenticate.');
    } finally {
      setBusy(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="auth-heading">
        <span className="eyebrow">YOUR WORKSPACE</span>
        <h2 id="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p>{mode === 'login' ? 'Sign in to manage your information.' : 'Register to start organizing content.'}</p>
      </div>
      <div className="auth-tabs" role="tablist" aria-label="Account access">
        <button aria-selected={mode === 'login'} className={mode === 'login' ? 'auth-tab active' : 'auth-tab'} onClick={() => changeMode('login')} role="tab" type="button">{t('signIn')}</button>
        <button aria-selected={mode === 'register'} className={mode === 'register' ? 'auth-tab active' : 'auth-tab'} onClick={() => changeMode('register')} role="tab" type="button">{t('register')}</button>
      </div>
      <form className="form-stack" onSubmit={submit}>
        {mode === 'register' && (
          <>
            <Input autoComplete="given-name" label="Enter first name" maxLength={50} minLength={1} onChange={(event) => setFirstName(event.target.value)} required value={firstName} />
            <Input autoComplete="family-name" label="Enter last name" maxLength={49} minLength={1} onChange={(event) => setLastName(event.target.value)} required value={lastName} />
          </>
        )}
        <Input autoComplete="email" label="Email" maxLength={254} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        <Input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} label="Password" minLength={mode === 'register' ? 6 : undefined} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <Button className="button-wide" disabled={busy} type="submit">{busy ? t('loading') : mode === 'login' ? t('signIn') : t('register')}</Button>
      </form>
      <p className="auth-footnote">Your session is kept in an HTTP-only cookie.</p>
    </section>
  );
}
