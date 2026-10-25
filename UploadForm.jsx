import useUploadForm from '../../hooks/useUploadForm.js';
import Button from '../ui/Button.jsx';
import InfoPanel from './InfoPanel.jsx';
import UploadFormFields from './UploadFormFields.jsx';

export default function UploadForm({ item, language, onCancel, onSaved, t }) {
  const form = useUploadForm({ item, language, onSaved });
  return (
    <form className="content-form upload-form" onSubmit={form.submit}>
      <div className="form-heading">
        <div>
          <span className="eyebrow">{item ? 'EDIT ENTRY' : 'NEW ENTRY'}</span>
          <h3>{item ? t('edit') : t('addContent')}</h3>
        </div>
        <button className="icon-button" onClick={onCancel} type="button" aria-label="Close upload form">×</button>
      </div>
      <InfoPanel t={t} />
      <UploadFormFields form={form} t={t} />
      {form.error && <p className="form-error" role="alert">{form.error}</p>}
      <div className="form-actions">
        <Button onClick={onCancel} type="button" variant="quiet">{t('cancel')}</Button>
        <Button disabled={form.busy} type="submit">{form.busy ? t('loading') : t('save')}</Button>
      </div>
    </form>
  );
}
