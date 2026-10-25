import Textarea from '../ui/Textarea.jsx';
import { CONTENT_LANGUAGES } from '../../hooks/useUploadForm.js';

export default function MultilingualBodyFields({ bodies, onChange, t }) {
  return (
    <fieldset className="translation-group">
      <legend>{t('body')}</legend>
      {CONTENT_LANGUAGES.map((language) => (
        <Textarea
          aria-label={`${t('body')} (${language.label})`}
          key={language.code}
          maxLength={5000}
          onChange={(event) => onChange(language.code, event.target.value)}
          placeholder={`${t('body')} — ${language.label}`}
          rows={3}
          value={bodies[language.code] || ''}
        />
      ))}
    </fieldset>
  );
}
