import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import useLanguage from '../hooks/useLanguage.js';
import { useAuth } from '../hooks/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login({ email: email.trim(), password });
      navigate(location.state?.from?.pathname || '/library', { replace: true });
    } catch (requestError) {
      const message = requestError?.message || 'Please enter the correct email or password.';
      const friendlyMessage = requestError?.status === 401 || /email|password/i.test(message)
        ? 'Please enter the correct email or password.'
        : message;
      setError(friendlyMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout language={language} onLanguageChange={setLanguage} t={t}>
      <section className="auth-page">
        <div className="auth-page-copy">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Welcome<br /><span>back.</span></h1>
          <p>Sign in to manage your shared learning resources.</p>
        </div>
        <section className="auth-card auth-page-card">
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2>Login</h2>
          <p className="auth-subtitle">Use your Muslim Islamic Center account to continue.</p>
          <form className="form-stack" onSubmit={submit}>
            <Input autoComplete="email" label="Email" maxLength={254} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            <div className="password-wrap">
              <Input autoComplete="current-password" label="Password" onChange={(event) => setPassword(event.target.value)} required type={showPassword ? 'text' : 'password'} value={password} />
              <button aria-label={showPassword ? 'Hide password' : 'Show password'} className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} type="button">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <Button className="button-wide" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Login'}</Button>
          </form>
          <p className="auth-switch">New to Muslim Islamic Center? <Link to="/register">Create an account</Link></p>
          <p className="auth-home-link"><Link to="/">← Return to Home</Link></p>
        </section>
      </section>
    </Layout>
  );
}
