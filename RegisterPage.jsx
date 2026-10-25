import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import useLanguage from '../hooks/useLanguage.js';
import { useAuth } from '../hooks/AuthContext.jsx';

function passwordScore(value) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const score = useMemo(() => passwordScore(password), [password]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    if (score < 2) {
      setError('Choose a stronger password: use at least 8 characters and combine letter types, numbers, or symbols.');
      return;
    }
    setBusy(true);
    try {
      await register({ name: `${firstName.trim()} ${lastName.trim()}`, email: email.trim(), password });
      setSuccess('Account created. Redirecting to your library…');
      window.setTimeout(() => navigate(location.state?.from?.pathname || '/library', { replace: true }), 600);
    } catch (requestError) {
      setError(requestError.message || 'Unable to create your account.');
    } finally {
      setBusy(false);
    }
  }

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score];

  return (
    <Layout language={language} onLanguageChange={setLanguage} t={t}>
      <section className="auth-page">
        <div className="auth-page-copy">
          <span className="eyebrow">JOIN THE COMMUNITY</span>
          <h1>Make room for<br /><span>new knowledge.</span></h1>
          <p>Create an account to share and organize useful learning resources.</p>
        </div>
        <section className="auth-card auth-page-card">
          <span className="eyebrow">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="auth-subtitle">Your account is ready in just a few steps.</p>
          <form className="form-stack" onSubmit={submit}>
            <Input autoComplete="given-name" label="Enter first name" maxLength={50} minLength={1} onChange={(event) => setFirstName(event.target.value)} required value={firstName} />
            <Input autoComplete="family-name" label="Enter last name" maxLength={49} minLength={1} onChange={(event) => setLastName(event.target.value)} required value={lastName} />
            <Input autoComplete="email" label="Email" maxLength={254} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            <div className="password-wrap">
              <Input autoComplete="new-password" label="Password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type={showPassword ? 'text' : 'password'} value={password} />
              <button aria-label={showPassword ? 'Hide password' : 'Show password'} className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} type="button">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="password-strength" aria-live="polite">
              <div className="strength-track"><span className={`strength-level strength-${score}`} /></div>
              <span>Password strength: <strong>{strengthLabel || 'Not set'}</strong></span>
            </div>
            <div className="password-wrap">
              <Input autoComplete="new-password" label="Confirm password" onChange={(event) => setConfirmation(event.target.value)} required type={showConfirmation ? 'text' : 'password'} value={confirmation} />
              <button aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'} className="password-toggle" onClick={() => setShowConfirmation((visible) => !visible)} type="button">
                {showConfirmation ? 'Hide' : 'Show'}
              </button>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            {success && <p className="form-success" role="status">{success}</p>}
            <Button className="button-wide" disabled={busy} type="submit">{busy ? 'Creating account…' : 'Register'}</Button>
          </form>
          <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
          <p className="auth-home-link"><Link to="/">← Return to Home</Link></p>
        </section>
      </section>
    </Layout>
  );
}
