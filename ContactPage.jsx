import { useState } from 'react';
import Layout from '../components/layout/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import useLanguage from '../hooks/useLanguage.js';
import { useAuth } from '../hooks/AuthContext.jsx';
import { submitContactMessage } from '../services/contentService.js';

const initialValues = { name: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [values, setValues] = useState(() => ({
    ...initialValues,
    name: user?.name || '',
    email: user?.email || '',
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');

  function change(field, value) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '' }));
    setSuccessMessage('');
    setFailureMessage('');
  }

  function validate() {
    const nextErrors = {};
    if (values.name.trim().length < 2 || values.name.trim().length > 100) nextErrors.name = 'Name must be 2–100 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) || values.email.length > 254) nextErrors.email = 'Enter a valid email address.';
    if (values.subject.trim().length < 3 || values.subject.trim().length > 160) nextErrors.subject = 'Subject must be 3–160 characters.';
    if (values.message.trim().length < 10 || values.message.trim().length > 5000) nextErrors.message = 'Message must be 10–5000 characters.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setSuccessMessage('');
    setFailureMessage('');
    if (!validate()) return;
    setBusy(true);
    try {
      const response = await submitContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
      setSuccessMessage(response.message);
      setValues({ ...initialValues, name: user?.name || '', email: user?.email || '' });
      setErrors({});
    } catch (error) {
      setFailureMessage(error.message || 'We could not save your message. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() { try { await logout(); } catch (error) { setFailureMessage(error.message); } }

  return (
    <Layout className="app-shell interior-shell contact-shell" language={language} onLanguageChange={setLanguage} onSignOut={signOut} t={t} user={user}>
      <section className="page-intro">
        <span className="eyebrow">WE’RE HERE TO LISTEN</span>
        <h1>Contact Us</h1>
        <p>Have a question, suggestion, or resource to share? Send us a message.</p>
      </section>
      <section className="contact-layout">
        <div className="contact-copy">
          <span className="eyebrow">GET IN TOUCH</span>
          <h2>Let’s keep the conversation going.</h2>
          <p>Use the form to contact Muslim Islamic Center. Messages are saved for the center team to review.</p>
          <address className="contact-details">
            <a className="contact-detail" href="mailto:husseinjemal027@gmail.com">
              <span aria-hidden="true" className="contact-detail-icon">@</span>
              <span><small>Email</small><strong>husseinjemal027@gmail.com</strong></span>
            </a>
            <a className="contact-detail" href="tel:0901348769">
              <span aria-hidden="true" className="contact-detail-icon">☎</span>
              <span><small>Phone</small><strong>0901348769</strong></span>
            </a>
          </address>
          <div className="contact-info-note">
            <span className="tip-mark">i</span>
            <p>Ask us here for current prayer times, program details, or community support information.</p>
          </div>
        </div>
        <form className="contact-form" onSubmit={submit} noValidate>
          <Input autoComplete="name" label="Full name" maxLength={100} onChange={(event) => change('name', event.target.value)} required value={values.name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
          {errors.name && <p className="field-error" id="contact-name-error">{errors.name}</p>}
          <Input autoComplete="email" label="Email" maxLength={254} onChange={(event) => change('email', event.target.value)} required type="email" value={values.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
          {errors.email && <p className="field-error" id="contact-email-error">{errors.email}</p>}
          <Input label="Subject" maxLength={160} onChange={(event) => change('subject', event.target.value)} required value={values.subject} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} />
          {errors.subject && <p className="field-error" id="contact-subject-error">{errors.subject}</p>}
          <Textarea label="Message" maxLength={5000} onChange={(event) => change('message', event.target.value)} required rows={6} value={values.message} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} />
          {errors.message && <p className="field-error" id="contact-message-error">{errors.message}</p>}
          {successMessage && <p className="form-success" role="status">{successMessage}</p>}
          {failureMessage && <p className="form-error" role="alert">{failureMessage}</p>}
          <Button className="button-wide" disabled={busy} type="submit">{busy ? 'Saving message…' : 'Submit message'}</Button>
          <p className="contact-disclaimer">Email delivery is not configured. The API will tell you whether the message was saved; it will not claim an email was sent.</p>
        </form>
      </section>
    </Layout>
  );
}
