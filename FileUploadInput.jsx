import Input from '../ui/Input.jsx';
import { resolveMediaUrl } from '../../services/api.js';

const resourceFileTypes = {
  quran: 'audio/mpeg,audio/wav,audio/mp4,audio/ogg',
  book: 'application/pdf,application/epub+zip',
  audio: 'audio/mpeg,audio/wav,audio/mp4,audio/ogg',
  video: 'video/mp4,video/quicktime,video/webm',
  dhikr: 'audio/mpeg,audio/wav,audio/mp4,audio/ogg',
};

const resourceFileExtensions = {
  quran: '.mp3,.wav,.m4a,.ogg',
  book: '.pdf,.epub',
  audio: '.mp3,.wav,.m4a,.ogg',
  video: '.mp4,.mov,.webm',
  dhikr: '.mp3,.wav,.m4a,.ogg',
};

export default function FileUploadInput({
  file,
  onFileChange,
  resourceFile,
  onResourceFileChange,
  category,
  mediaUrl,
  onUrlChange,
  t,
}) {
  return (
    <div className="field">
      <span>{t('coverImage')}</span>
      <Input
        accept="image/jpeg,image/png,image/webp,image/gif"
        aria-label="Upload a cover image"
        className="file-field"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        type="file"
      />
      {file && <span className="file-name">{file.name}</span>}
      <span>{t('resourceFile')}</span>
      <div className="file-or-url">
        <Input
          accept={`${resourceFileTypes[category]},${resourceFileExtensions[category]}`}
          aria-label={`Upload a ${category} file`}
          className="file-field"
          onChange={(event) => onResourceFileChange(event.target.files?.[0] || null)}
          type="file"
        />
        <span className="or-separator">or</span>
        <Input
          aria-label="External media URL"
          maxLength={2048}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://…"
          type="url"
          value={mediaUrl}
        />
      </div>
      <small>{t('resourceFileHint')}</small>
      {resourceFile && <span className="file-name">{resourceFile.name}</span>}
      {!resourceFile && mediaUrl && resolveMediaUrl(mediaUrl) && (
        <a className="media-link" href={resolveMediaUrl(mediaUrl)} target="_blank" rel="noreferrer">Preview resource ↗</a>
      )}
    </div>
  );
}
