import Input from '../ui/Input.jsx';
import { CONTENT_LANGUAGES } from '../../hooks/useUploadForm.js';

export default function MultilingualTitleFields({ titles, onChange, t }) {
  return (
    <fieldset className="translation-group">
      <legend>{t('title')}</legend>
      {CONTENT_LANGUAGES.map((language) => (
        <Input
          aria-label={`${t('title')} (${language.label})`}
          key={language.code}
          maxLength={200}
          onChange={(event) => onChange(language.code, event.target.value)}
          placeholder={`${t('title')} — ${language.label}`}
          value={titles[language.code] || ''}
        />
      ))}
    </fieldset>
  );
}
