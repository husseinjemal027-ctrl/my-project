import ContentCard from './ContentCard.jsx';

export default function ContentGrid({ items, user, language, onEdit, onDelete, t, allowManage = true }) {
  return (
    <div className="content-grid">
      {items.map((item) => (
        <ContentCard
          canManage={Boolean(allowManage && user && String(item.author?._id || item.author) === String(user._id))}
          item={item}
          key={item._id}
          language={language}
          onDelete={onDelete}
          onEdit={onEdit}
          t={t}
        />
      ))}
    </div>
  );
}
