import { useState } from 'react';
import { createContent, updateContent } from '../services/uploadService.js';

export const CONTENT_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ' },
  { code: 'om', label: 'Afaan Oromoo' },
];

export default function useUploadForm({ item, onSaved, language }) {
  const [titles, setTitles] = useState(() => ({ ...(item?.titles || {}), en: item?.titles?.en || item?.title || '' }));
  const [bodies, setBodies] = useState(() => ({ ...(item?.bodies || {}), en: item?.bodies?.en || item?.description || '' }));
  const [category, setCategory] = useState(item?.category || 'quran');
  const [file, setFile] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(item?.mediaUrl || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function updateTranslation(setter, key, value) {
    setter((previous) => ({ ...previous, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    const hasTitle = Object.values(titles).some((value) => value.trim());
    if (!hasTitle) {
      setError('Add a title in at least one language.');
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      setError('Cover images must be 5 MB or smaller.');
      return;
    }
    if (resourceFile && resourceFile.size > 100 * 1024 * 1024) {
      setError('Books, audio, and video files must be 100 MB or smaller.');
      return;
    }

    setBusy(true);
    try {
      const values = { titles, bodies, category, file, resourceFile, mediaUrl: mediaUrl.trim() };
      if (item) await updateContent(item._id, values);
      else await createContent(values);
      await onSaved();
    } catch (requestError) {
      setError(requestError.message || 'Unable to save this content.');
    } finally {
      setBusy(false);
    }
  }

  return {
    titles,
    setTitle: (lang, value) => updateTranslation(setTitles, lang, value),
    bodies,
    setBody: (lang, value) => updateTranslation(setBodies, lang, value),
    category,
    setCategory: (value) => {
      setCategory(value);
      setResourceFile(null);
    },
    file,
    setFile,
    resourceFile,
    setResourceFile,
    mediaUrl,
    setMediaUrl,
    busy,
    error,
    submit,
    language,
  };
}
