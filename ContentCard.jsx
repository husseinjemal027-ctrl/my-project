import { resolveMediaUrl } from '../../services/api.js';

function chooseTranslation(translations, fallback, language) {
  return translations?.[language]?.trim()
    || translations?.en?.trim()
    || Object.values(translations || {}).find((value) => value?.trim())
    || fallback
    || '';
}

export default function ContentCard({ item, language, canManage, onEdit, onDelete, t }) {
  const title = chooseTranslation(item.titles, item.title, language);
  const body = chooseTranslation(item.bodies, item.description, language);
  const media = resolveMediaUrl(item.image);
  const resource = resolveMediaUrl(item.mediaUrl);
  const isUploadedResource = item.mediaUrl?.startsWith('/uploads/')
    || item.mediaUrl?.startsWith('/api/content/files/');
  const downloadResource = isUploadedResource
    ? `${resource}${resource.includes('?') ? '&' : '?'}download=1`
    : '';
  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : '';

  return (
    <article className="content-card">
      {media
        ? <img className="content-image" src={media} alt="" loading="lazy" />
        : <div className="content-image image-placeholder" aria-hidden="true"><span>{title.slice(0, 1).toUpperCase() || 'I'}</span></div>}
      <div className="content-card-body">
        <div className="card-meta">
          <span className="category-pill">{t(item.category) || item.category}</span>
          {date && <time dateTime={item.createdAt}>{date}</time>}
        </div>
        <h3>{title}</h3>
        {body && <p className="content-description">{body}</p>}
        {resource && isUploadedResource && item.mediaType === 'audio' && (
          <audio className="resource-player" controls preload="none" src={resource}>
            Your browser does not support audio playback.
          </audio>
        )}
        {resource && isUploadedResource && item.mediaType === 'video' && (
          <video className="resource-player" controls preload="none" src={resource}>
            Your browser does not support video playback.
          </video>
        )}
        {resource && (
          <div className="resource-links">
            <a className="media-link" href={resource} target="_blank" rel="noreferrer">Open resource ↗</a>
            {downloadResource && (
              <a className="media-link" href={downloadResource}>Download file ↓</a>
            )}
          </div>
        )}
        <div className="card-footer">
          <span className="author-name">
            {typeof item.author === 'object' ? `By ${item.author?.name || 'user'}` : 'ISM entry'}
          </span>
          {canManage && (
            <div className="card-actions">
              <button className="text-button" onClick={() => onEdit(item)} type="button">{t('edit')}</button>
              <button className="text-button danger-text" onClick={() => onDelete(item)} type="button">{t('delete')}</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
