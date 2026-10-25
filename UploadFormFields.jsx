import Select from '../ui/Select.jsx';
import FileUploadInput from './FileUploadInput.jsx';
import MultilingualBodyFields from './MultilingualBodyFields.jsx';
import MultilingualTitleFields from './MultilingualTitleFields.jsx';

const categories = ['quran', 'book', 'audio', 'video', 'dhikr'];

export default function UploadFormFields({ form, t }) {
  return (
    <>
      <MultilingualTitleFields titles={form.titles} onChange={form.setTitle} t={t} />
      <Select label={t('category')} onChange={(event) => form.setCategory(event.target.value)} value={form.category}>
        {categories.map((category) => <option key={category} value={category}>{t(category)}</option>)}
      </Select>
      <p className="upload-field-hint">Choose Book for PDF/EPUB, Audio for MP3/WAV/M4A/OGG, or Video for MP4/MOV/WEBM. Then select the matching file below.</p>
      <MultilingualBodyFields bodies={form.bodies} onChange={form.setBody} t={t} />
      <FileUploadInput
        file={form.file}
        resourceFile={form.resourceFile}
        category={form.category}
        mediaUrl={form.mediaUrl}
        onFileChange={form.setFile}
        onResourceFileChange={form.setResourceFile}
        onUrlChange={form.setMediaUrl}
        t={t}
      />
    </>
  );
}
