import CategoryTabs from './CategoryTabs.jsx';

export default function FilterBar({ category, onCategoryChange, search, onSearchChange, t }) {
  return (
    <div className="filter-bar">
      <CategoryTabs value={category} onChange={onCategoryChange} t={t} />
      <label className="search-field">
        <span aria-hidden="true">⌕</span>
        <input
          aria-label={t('search')}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('search')}
          type="search"
          value={search}
        />
      </label>
    </div>
  );
}
