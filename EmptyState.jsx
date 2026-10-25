import Button from '../ui/Button.jsx';

export default function EmptyState({ t, onAdd, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">⌁</div>
      <h3>{message || t('noItems')}</h3>
      <p>{t('emptyDescription')}</p>
      {onAdd && <Button onClick={onAdd}>{t('addContent')}</Button>}
    </div>
  );
}
